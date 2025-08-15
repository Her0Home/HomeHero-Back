import { Controller, Post, Headers, Req, HttpStatus, HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { StripeService } from './stripe.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

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
          const invoice = event.data.object;
          const subscriptionId = (invoice as any).subscription;
          const paymentIntentId = (invoice as any).payment_intent;
          

          const customerId = invoice.customer;
          
    
          const user = await this.userRepository.findOne({ 
            where: { stripeCustomerId: typeof customerId === 'string' ? customerId : undefined } 
          });
          
          if (user) {
            // Registrar el pago exitoso
            await this.stripeService.registerPayment(
              user.id,
              invoice.amount_paid / 100, 
              paymentIntentId,
              subscriptionId,
            );
          }
          break;
        }
        
        case 'invoice.payment_failed': {
          const invoice = event.data.object;
          const paymentIntentId = (invoice as any).payment_intent;
          
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