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
        request.body,
        signature,
        webhookSecret,
      );

      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated': {
          await this.handleSubscriptionChange(event.data.object);
          break;
        }
        
        case 'invoice.payment_succeeded': {
          const invoice = event.data.object as Stripe.Invoice & { subscription?: string; payment_intent?: string };
          const subscriptionId = invoice.subscription;
          const paymentIntentId = invoice.payment_intent;
          
          const customerId = invoice.customer;
          
      
          const user = await this.userRepository.findOne({ 
            where: { stripeCustomerId: typeof customerId === 'string' ? customerId : undefined } 
          });
          
          if (user) {
       
            await this.stripeService.registerPayment(
              user.id,
              invoice.amount_paid / 100,
              paymentIntentId ?? '',
              subscriptionId,
            );
            
            
            if (subscriptionId) {
              const subscription = await this.stripeService.getSubscription(subscriptionId);
              await this.updateUserMembershipStatus(user, subscription.status === 'active');
            }
          }
          break;
        }
        
        case 'invoice.payment_failed': {
          const invoice = event.data.object as Stripe.Invoice & { payment_intent?: string; subscription?: string };
          const paymentIntentId = invoice.payment_intent;
          const subscriptionId = invoice.subscription;
          
          
          if (paymentIntentId) {
            await this.stripeService.updatePaymentStatus(paymentIntentId, false);
          }
          
         
          if (subscriptionId) {
            const subscription = await this.stripeService.getSubscription(subscriptionId);
            const customerId = subscription.customer;
            const user = await this.userRepository.findOne({ 
              where: { stripeCustomerId: typeof customerId === 'string' ? customerId : undefined } 
            });
            
            if (user && subscription.status !== 'active') {
              await this.updateUserMembershipStatus(user, false);
            }
          }
          break;
        }
        
        case 'customer.subscription.deleted': {
          await this.handleSubscriptionChange(event.data.object, false);
          break;
        }
      }
      
      return { received: true };
    } catch (err) {
      throw new HttpException('Webhook error: ' + err.message, HttpStatus.BAD_REQUEST);
    }
  }

  private async handleSubscriptionChange(subscription: Stripe.Subscription, checkStatus = true) {
    try {
      const customerId = subscription.customer;
      const user = await this.userRepository.findOne({ 
        where: { stripeCustomerId: typeof customerId === 'string' ? customerId : undefined } 
      });
      
      if (!user) {
        return;
      }
      
  
      const isActive = checkStatus ? subscription.status === 'active' : false;
      
      await this.updateUserMembershipStatus(user, isActive);
    } catch (error) {
    }
  }

  private async updateUserMembershipStatus(user: User, isActive: boolean) {

    if (user.isMembresyActive !== isActive) {
      user.isMembresyActive = isActive;
      await this.userRepository.save(user);
    
    }
  }
}