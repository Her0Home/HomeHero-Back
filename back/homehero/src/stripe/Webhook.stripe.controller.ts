import { Controller, Post, Headers, Req, HttpException, HttpStatus, Logger, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, DataSource } from 'typeorm';
import type { Request } from 'express';
import Stripe from 'stripe';
import { StripeService } from './stripe.service';
import { Payment } from './entities/stripe.entity';
import { User } from '../users/entities/user.entity';
import { EmailService } from '../email/email.service';

@Controller('stripe/webhooks')
@Injectable()
export class StripeWebhookController {
  private readonly logger = new Logger(StripeWebhookController.name);
  private paymentIntentsMap: Map<string, string> = new Map(); 
  private subscriptionsMap: Map<string, string> = new Map(); 
  private pendingSubscriptionInfo: Map<string, string> = new Map();
  private processingPayments: string[] = [];
  
  constructor(
    private readonly stripeService: StripeService,
    private readonly configService: ConfigService,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private dataSource: DataSource,
    private readonly emailService: EmailService,
  ) {
    setInterval(() => {
      if (this.processingPayments.length > 0) {
        this.processingPayments = [];
      }
      
      if (this.pendingSubscriptionInfo.size > 0) {
        this.pendingSubscriptionInfo.clear();
      }
    }, 10 * 60 * 1000);
  }

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
      throw new HttpException('Missing webhook secret', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
    let event: Stripe.Event;

    try {
      event = this.stripeService.constructEvent(
        request.body,
        signature,
        webhookSecret,
      );
    } catch (err) {
      throw new HttpException(`Webhook error: ${err.message}`, HttpStatus.BAD_REQUEST);
    }

    try {
      if (event.type === 'customer.subscription.created') {
        await this.handleSubscriptionCreated(event.data.object as Stripe.Subscription);
      }
      else if (event.type === 'checkout.session.completed') {
        await this.handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
      }
      else if (event.type === 'payment_intent.succeeded') {
        await this.handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
      }
      else if (event.type === 'invoice.payment_succeeded' || event.type === 'invoice.paid') {
        await this.handleInvoicePayment(event.data.object as any);
      }
      else if (event.type === 'customer.subscription.deleted') {
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
      }
      
      return { received: true };
    } catch (err) {
      this.logger.error(`Error processing webhook: ${err.message}`, err.stack);
      return { received: true, error: err.message };
    }
  }

  private async handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<void> {
    try {
      const subscriptionId = subscription.id;
      const latestInvoiceId = subscription.latest_invoice as string;
      
      await this.updatePaymentWithSubscriptionId(undefined, subscriptionId);
      
      if (latestInvoiceId) {
        try {
          const invoice = await this.stripeService.stripe.invoices.retrieve(latestInvoiceId, {
            expand: ['payment_intent']
          }) as any;
          
          if (invoice.payment_intent) {
            const paymentIntentId = typeof invoice.payment_intent === 'string' 
              ? invoice.payment_intent 
              : invoice.payment_intent.id;
            
            this.paymentIntentsMap.set(subscriptionId, paymentIntentId);
            this.subscriptionsMap.set(paymentIntentId, subscriptionId);
            this.pendingSubscriptionInfo.set(paymentIntentId, subscriptionId);
            
            await this.updatePaymentWithSubscriptionId(paymentIntentId, subscriptionId);
          }
        } catch (error) {
        }
      }
      
      const customerId = typeof subscription.customer === 'string' ? 
        subscription.customer : subscription.customer.id;
      
      const user = await this.userRepository.findOne({ where: { stripeCustomerId: customerId } });
      
     if (user) {

      const subscriptionData = subscription as any;
      const endDate = new Date(subscriptionData.current_period_end * 1000);
      

      await this.userRepository.update(
        { id: user.id },
        { 
          isMembresyActive: true,
          membershipEndDate: endDate,
          membershipCancelled: false
        }
      );
    }
  } catch (error) {
    this.logger.error(`Error procesando subscription.created: ${error.message}`);
  }
}

  private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
    if (!session.customer || !session.subscription) {
      return;
    }
    
    const customerId = typeof session.customer === 'string' ? 
      session.customer : session.customer.id;
      
    const subscriptionId = typeof session.subscription === 'string' ? 
      session.subscription : session.subscription.id;
    
    let paymentIntentId: string | undefined = undefined;
    
    if (session.payment_intent) {
      paymentIntentId = typeof session.payment_intent === 'string' ? 
        session.payment_intent : session.payment_intent.id;
      
      if (paymentIntentId && subscriptionId) {
        this.paymentIntentsMap.set(subscriptionId, paymentIntentId);
        this.subscriptionsMap.set(paymentIntentId, subscriptionId);
        this.pendingSubscriptionInfo.set(paymentIntentId, subscriptionId);
        
        await this.updatePaymentWithSubscriptionId(paymentIntentId, subscriptionId);
      }
    }
    
    const user = await this.userRepository.findOne({ where: { stripeCustomerId: customerId } });
    
    if (!user) {
      return;
    }

    await this.updateUserMembershipStatus(user, true);
  }

  private async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const customerId = paymentIntent.customer as string;
    
    if (paymentIntent.metadata?.subscription_id) {
      const subId = paymentIntent.metadata.subscription_id;
      this.paymentIntentsMap.set(subId, paymentIntent.id);
      this.subscriptionsMap.set(paymentIntent.id, subId);
      this.pendingSubscriptionInfo.set(paymentIntent.id, subId);
      
      await this.updatePaymentWithSubscriptionId(paymentIntent.id, subId);
    }
    
    if (!customerId) {
      return;
    }

    const user = await this.userRepository.findOne({ 
      where: { stripeCustomerId: customerId } 
    });
    
    if (!user) {
      return;
    }
    try {
      const amount = paymentIntent.amount / 100;
      await this.emailService.sendPaymentSuccessEmail(user, amount, paymentIntent.id);
    } catch(error) {
      this.logger.error(`Fallo al enviar el correo de confirmación de pago: ${error.message}`);
    }


    let subscriptionId = this.subscriptionsMap.get(paymentIntent.id) || 
                        this.pendingSubscriptionInfo.get(paymentIntent.id);
    
    if (!subscriptionId) {
      try {
        const charges = await this.stripeService.stripe.charges.list({
          limit: 1,
          payment_intent: paymentIntent.id,
        }) as any;
        
        if (charges.data.length > 0 && charges.data[0].invoice) {
          const invoiceId = charges.data[0].invoice;
          const invoice = await this.stripeService.stripe.invoices.retrieve(invoiceId, {
            expand: ['subscription']
          }) as any;
          
          if (invoice.subscription) {
            subscriptionId = typeof invoice.subscription === 'string' 
              ? invoice.subscription 
              : invoice.subscription.id;
              
            if (subscriptionId) {
              this.paymentIntentsMap.set(subscriptionId, paymentIntent.id);
              this.subscriptionsMap.set(paymentIntent.id, subscriptionId);
              
              await this.updatePaymentWithSubscriptionId(paymentIntent.id, subscriptionId);
            }
          }
        }
      } catch (error) {

      }
    }

    await this.createOrUpdatePayment(
      user.id,
      paymentIntent.amount / 100,
      paymentIntent.id,
      subscriptionId,
      100,
      'payment_intent'
    );
    
    await this.updateUserMembershipStatus(user, true);
  }

  private async handleInvoicePayment(invoice: any): Promise<void> {
  
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (!invoice.customer) {
      return;
    }
    
    const customerId = typeof invoice.customer === 'string' ? 
      invoice.customer : invoice.customer.id;
    
  
    let subscriptionId: string | undefined = undefined;
    
    if (invoice.subscription) {
      subscriptionId = typeof invoice.subscription === 'string' ? 
        invoice.subscription : invoice.subscription.id;
    } else if (invoice.lines?.data?.[0]?.subscription) {
      subscriptionId = typeof invoice.lines.data[0].subscription === 'string' ?
        invoice.lines.data[0].subscription :
        invoice.lines.data[0].subscription.id;
    } else if (invoice.parent?.subscription_details?.subscription) {
      subscriptionId = invoice.parent.subscription_details.subscription;
    }
    

    if (!subscriptionId && invoice.lines?.data?.length > 0) {
      for (const line of invoice.lines.data) {
        if (line.parent?.subscription_item_details?.subscription) {
          subscriptionId = line.parent.subscription_item_details.subscription;
          break;
        }
      }
    }
    
    if (!subscriptionId) {
      return;
    }

    let paymentIntentId: string | undefined = undefined;
    
    if (invoice.payment_intent) {
      paymentIntentId = typeof invoice.payment_intent === 'string' ? 
        invoice.payment_intent : invoice.payment_intent.id;
        
      if (subscriptionId && paymentIntentId) {
        this.paymentIntentsMap.set(subscriptionId, paymentIntentId);
        this.subscriptionsMap.set(paymentIntentId, subscriptionId);
        this.pendingSubscriptionInfo.set(paymentIntentId, subscriptionId);
        
        await this.updatePaymentWithSubscriptionId(paymentIntentId, subscriptionId);
      }
    } else if (this.paymentIntentsMap.has(subscriptionId)) {
      paymentIntentId = this.paymentIntentsMap.get(subscriptionId);
    }
    
    const user = await this.userRepository.findOne({ where: { stripeCustomerId: customerId } });
    
    if (!user) {
      return;
    }
    try {
      const amount = invoice.amount_paid / 100;
      // El paymentIntentId podría estar en invoice.payment_intent
      const paymentIntentId = invoice.payment_intent?.id || `invoice_${invoice.id}`;
      await this.emailService.sendPaymentSuccessEmail(user, amount, paymentIntentId);
    } catch(error) {
      this.logger.error(`Fallo al enviar el correo de confirmación de factura: ${error.message}`);
    }

  
    if (paymentIntentId) {
      await this.updatePaymentWithSubscriptionId(paymentIntentId, subscriptionId);
    } else {
  
      await this.updatePaymentWithSubscriptionId(undefined, subscriptionId, user.id);
    }
    

    if (!paymentIntentId || !(await this.paymentExists(paymentIntentId))) {
      await this.createOrUpdatePayment(
        user.id,
        invoice.amount_paid / 100,
        paymentIntentId || `invoice_payment_${invoice.id}`,
        subscriptionId,
        50,
        'invoice'
      );
    }
    
    await this.updateUserMembershipStatus(user, true);
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    const customerId = typeof subscription.customer === 'string' ? 
      subscription.customer : subscription.customer.id;
      
    const user = await this.userRepository.findOne({ where: { stripeCustomerId: customerId } });
    
    if (user) {

      const subscriptionData = subscription as any;
    const endDate = new Date(subscriptionData.current_period_end * 1000);
    const now = new Date();
    
    if (now >= endDate) {
      await this.userRepository.update(
        { id: user.id },
        { 
          isMembresyActive: false,
          membershipCancelled: true
        }
      );
    } else {
      await this.userRepository.update(
        { id: user.id },
        { membershipCancelled: true }
      );
    }
  }
}

   private async updatePaymentWithSubscriptionId(
    paymentIntentId?: string,
    subscriptionId?: string,
    userId?: string
  ): Promise<void> {
    if (!subscriptionId) return;
    
    try {

      const criteria: any = {};
      
      if (paymentIntentId) {

        criteria.stripePaymentId = paymentIntentId;
      } else if (userId) {

        const fiveMinutesAgo = new Date(new Date().getTime() - 5 * 60 * 1000);
        criteria.user_id = userId;
        criteria.date = MoreThanOrEqual(fiveMinutesAgo);
      } else {

        return;
      }
      

      const paymentsToUpdate = await this.paymentRepository.find({
        where: criteria
      });
      
      if (paymentsToUpdate.length > 0) {
        for (const payment of paymentsToUpdate) {
          if (!payment.stripeSubscriptionId) {
            await this.paymentRepository.update(
              { UniqueID: payment.UniqueID },
              { stripeSubscriptionId: subscriptionId }
            );
          }
        }
      }
    } catch (error) {
      this.logger.error(`Error actualizando pagos con suscripción: ${error.message}`);
    }
  }

  private async paymentExists(paymentIntentId: string): Promise<boolean> {
    const payment = await this.paymentRepository.findOne({
      where: { stripePaymentId: paymentIntentId }
    });
    return !!payment;
  }

  private async createOrUpdatePayment(
    userId: string,
    amount: number,
    paymentId: string,
    subscriptionId: string | undefined,
    priority: number,
    source: string
  ): Promise<void> {

    const paymentIdentifier = `${userId}_${Math.round(amount * 100)}`;
    

    if (this.processingPayments.includes(paymentIdentifier)) {
      return;
    }
    
    try {

      this.processingPayments.push(paymentIdentifier);
      

      await this.dataSource.transaction(async transactionalEntityManager => {

        const existingPaymentById = await transactionalEntityManager.findOne(Payment, {
          where: { stripePaymentId: paymentId }
        });
        
        if (existingPaymentById) {

          if (subscriptionId && !existingPaymentById.stripeSubscriptionId) {
            await transactionalEntityManager.update(
              Payment, 
              { UniqueID: existingPaymentById.UniqueID },
              { stripeSubscriptionId: subscriptionId }
            );
          }
          
          return;
        }
        
   
        const fiveMinutesAgo = new Date(new Date().getTime() - 5 * 60 * 1000);
        
        const similarPayments = await transactionalEntityManager.find(Payment, {
          where: {
            user_id: userId,
            amount: amount,
            date: MoreThanOrEqual(fiveMinutesAgo)
          },
          order: { date: 'DESC' }
        });
        

        let subscriptionPayments: Payment[] = [];
        if (subscriptionId) {
          subscriptionPayments = await transactionalEntityManager.find(Payment, {
            where: { stripeSubscriptionId: subscriptionId }
          });
        }
        

        const allPotentialDuplicates = [...similarPayments, ...subscriptionPayments];
        
        if (allPotentialDuplicates.length > 0) {
          if (source === 'payment_intent' && !paymentId.startsWith('invoice_payment_')) {
            for (const payment of allPotentialDuplicates) {
              if (payment.stripePaymentId.startsWith('invoice_payment_')) {
                await transactionalEntityManager.update(
                  Payment,
                  { UniqueID: payment.UniqueID },
                  { 
                    stripePaymentId: paymentId,
                    stripeSubscriptionId: subscriptionId || payment.stripeSubscriptionId
                  }
                );
                return;
              }
            }
          }
          

          for (const payment of allPotentialDuplicates) {
            if (!payment.stripeSubscriptionId && subscriptionId) {
              await transactionalEntityManager.update(
                Payment,
                { UniqueID: payment.UniqueID },
                { stripeSubscriptionId: subscriptionId }
              );
              return;
            }
          }
          
          return;
        }
        

        await transactionalEntityManager.save(Payment, {
          user_id: userId,
          amount,
          date: new Date(),
          status: true,
          stripePaymentId: paymentId,
          stripeSubscriptionId: subscriptionId,
        });
      });
      
    } catch (error) {
      this.logger.error(`Error procesando pago: ${error.message}`, error.stack);
    } finally {

      const index = this.processingPayments.indexOf(paymentIdentifier);
      if (index !== -1) {
        this.processingPayments.splice(index, 1);
      }
    }
  }

  private async updateUserMembershipStatus(user: User, isActive: boolean): Promise<void> {
    try {
      await this.userRepository.update(
        { id: user.id },
        { isMembresyActive: isActive }
      );
    } catch (error) {
      this.logger.error(`Error actualizando estado de membresía: ${error.message}`, error.stack);
    }
  }
  
} 