import { Controller, Post, Headers, Req, HttpStatus, HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { StripeService } from './stripe.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import Stripe from 'stripe';

@Controller('stripe/webhooks')
export class StripeWebhookController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  @Post()
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: Request,
  ) {
    if (!signature) {
      throw new HttpException('Missing stripe-signature header', HttpStatus.BAD_REQUEST);
    }

    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new HttpException('Missing Stripe webhook secret configuration', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
    try {
    
      const event = this.stripeService.constructEvent(
        request['rawBody'],
        signature,
        webhookSecret,
      );

 
      switch (event.type) {
        case 'invoice.payment_succeeded': {
          const invoice = event.data.object as Stripe.Invoice & { subscription?: string; payment_intent?: string };
          const subscriptionId = invoice.subscription;
          const paymentIntentId = invoice.payment_intent;
          
         
          const customerId = invoice.customer;
          
          // Buscar el usuario por su customerId
          const user = await this.userRepository.findOne({ 
            where: { stripeCustomerId: typeof customerId === 'string' ? customerId : undefined } 
          });
          
          if (user) {
      
            await this.stripeService.registerPayment(
              user.id,
              invoice.amount_paid / 100, // Convertir de centavos a unidad monetaria
              paymentIntentId ?? '',
              subscriptionId,
            );
          }
          break;
        }
        
        case 'invoice.payment_failed': {
          const invoice = event.data.object as Stripe.Invoice & { payment_intent?: string };
          const paymentIntentId = invoice.payment_intent;
          
          // Marcar el pago como fallido si existe
          if (paymentIntentId) {
            await this.stripeService.updatePaymentStatus(paymentIntentId, false);
          }
          break;
        }
        
        case 'customer.subscription.deleted': {
          const subscription = event.data.object;
          // Aquí podrías actualizar el estado de la suscripción en tu base de datos
          // Por ejemplo, marcar la membresía como expirada
          break;
        }
        
        default:
          console.log(`Evento de Stripe no manejado: ${event.type}`);
      }
      
      return { received: true };
    } catch (err) {
      console.error('Error de webhook:', err.message);
      throw new HttpException('Webhook error: ' + err.message, HttpStatus.BAD_REQUEST);
    }
  }
}