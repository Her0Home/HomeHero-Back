import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import Stripe from 'stripe';
import { Payment } from './entities/stripe.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class StripeService {
  attachPaymentMethod(id: any, id1: string) {
    throw new Error('Method not implemented.');
  }

  private stripeInstance: Stripe;


  get stripe(): Stripe {
    return this.stripeInstance;
  }

  constructor(
    private configService: ConfigService,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('Stripe secret key is not defined in environment variables');
    }

    this.stripeInstance = new Stripe(stripeSecretKey);
  };


  async createCustomer(name: string, email: string): Promise<Stripe.Customer> {
    return this.stripe.customers.create({
      name,
      email,
    });
  }


  async createSubscription(
    customerId: string, 
    priceId: string,
    paymentMethodId?: string,
  ): Promise<Stripe.Subscription> {
    if (paymentMethodId) {
      await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });
      

      await this.stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
    }

    return this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      expand: ['latest_invoice.payment_intent'],
    });
  }


  async cancelSubscription(subscriptionId: string): Promise<any> {
  const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
  
  const payment = await this.paymentRepository.findOne({
    where: { stripeSubscriptionId: subscriptionId },
    order: { date: 'DESC' }
  });
  
  if (payment) {
    const user = await this.findUserById(payment.user_id);
    
   const canceledSubscription = await this.stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    });
    
    await this.userRepository.update(
      { id: user.id },
      { membershipCancelled: true }
    );
    return {
      message: 'Suscripción cancelada exitosamente. El acceso permanecerá activo hasta el final del período de facturación.',
      subscriptionId: canceledSubscription.id,
      status: canceledSubscription.status,
      cancelAtPeriodEnd: canceledSubscription.cancel_at_period_end,
      accessValidUntil:  new Date(subscription.items.data[0].current_period_end * 1000)
    };
  }
  

  const immediateCancel = await this.stripe.subscriptions.cancel(subscriptionId);
  return {
      message: 'Suscripción cancelada de forma inmediata.',
      subscriptionId: immediateCancel.id,
      status: immediateCancel.status
  }
}

 
  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return this.stripe.subscriptions.retrieve(subscriptionId);
  }


  async createCheckoutSession(
  customerId: string, 
  priceId: string,
  successUrl: string,
  cancelUrl: string,
): Promise<Stripe.Checkout.Session> {
  return this.stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    expand: ['payment_intent'],
  });
}


  async createBillingPortalSession(
    customerId: string,
    returnUrl: string,
  ): Promise<Stripe.BillingPortal.Session> {
    return this.stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
  }


  constructEvent(
    payload: Buffer,
    signature: string,
    webhookSecret: string,
  ): Stripe.Event {
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret,
    );
  }

async getPaymentIntentFromSubscription(subscriptionId: string): Promise<string | null> {
  try {
   
    const subscription = await this.stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['latest_invoice', 'latest_invoice.payment_intent'],
    });

   
    const subscriptionData = subscription as any;

   
    if (!subscriptionData.latest_invoice) {
      console.warn(`Subscription ${subscriptionId} has no latest_invoice`);
      return null;
    }


    let invoiceData: any;
    if (typeof subscriptionData.latest_invoice === 'string') {
      invoiceData = await this.stripe.invoices.retrieve(subscriptionData.latest_invoice, { 
        expand: ['payment_intent'] 
      });
    } else {
      invoiceData = subscriptionData.latest_invoice;
    }


    if (invoiceData.payment_intent) {
      return typeof invoiceData.payment_intent === 'string' 
        ? invoiceData.payment_intent 
        : invoiceData.payment_intent.id;
    }

    if (invoiceData.charge) {
      const charge = await this.stripe.charges.retrieve(
        typeof invoiceData.charge === 'string' ? invoiceData.charge : invoiceData.charge.id,
        { expand: ['payment_intent'] }
      );
      
      if (charge.payment_intent) {
        return typeof charge.payment_intent === 'string' 
          ? charge.payment_intent 
          : charge.payment_intent.id;
      }
    }

    console.warn(`No payment intent found for invoice ${invoiceData.id}`);
    return null;
  } catch (error) {
    console.error(`Error fetching payment intent for subscription ${subscriptionId}:`, error);
    return null;
  }
}


  async findUserById(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }
    return user;
  }


  async registerPayment(
    userId: string,
    amount: number,
    stripePaymentId: string,
    stripeSubscriptionId?: string,
  ): Promise<Payment> {

    const user = await this.findUserById(userId);

    const payment = this.paymentRepository.create({
      user_id: user.id,
      amount,
      date: new Date(),
      status: true,
      stripePaymentId,
      stripeSubscriptionId,
    });

    return this.paymentRepository.save(payment);
  }
  async findUserByStripeCustomerId(customerId: string): Promise<User | null> {
  return this.userRepository.findOne({ where: { stripeCustomerId: customerId } });
}


  async updatePaymentStatus(stripePaymentId: string, status: boolean): Promise<void> {
    await this.paymentRepository.update(
      { stripePaymentId },
      { status }
    );
  }


  async getUserPayments(userId: string): Promise<Payment[]> {

    const user = await this.findUserById(userId);

    return this.paymentRepository.find({
      where: { user_id: user.id },
      order: { date: 'DESC' },
      relations: ['user'], 
    });
  }
  async updateUserMembershipStatus(userId: string, isActive: boolean): Promise<void> {
  await this.userRepository.update(
    { id: userId },
    { isMembresyActive: isActive }
  );
}

  async updateUserStripeCustomerId(userId: string, customerId: string): Promise<void> {
    await this.userRepository.update(
      { id: userId },
      { stripeCustomerId: customerId }
    );
  }


  async getUserStripeCustomerId(userId: string): Promise<string | undefined> {
    const user = await this.findUserById(userId);
    return user.stripeCustomerId;
  }

  
async getMembershipInfo(userId: string): Promise<any> {
  const user = await this.findUserById(userId);
  

  const lastPayment = await this.paymentRepository.findOne({
    where: { 
      user_id: userId,
      stripeSubscriptionId: Not(IsNull()) 
    },
    order: { date: 'DESC' }
  });
  let priceId: string | null = null;

  if (lastPayment?.stripeSubscriptionId) {
    try {

      const subscription = await this.stripe.subscriptions.retrieve(
        lastPayment.stripeSubscriptionId
      );

      if (subscription.items.data.length > 0) {
        priceId = subscription.items.data[0].price.id;
      }
    } catch (error) {
    }
  }


  if (!user.membershipEndDate) {
    return {
      active: user.isMembresyActive || false,
      remaining: 0,
      endDate: null,
      isCancelled: user.membershipCancelled || false,
      subscriptionId: lastPayment?.stripeSubscriptionId || null,
      priceId: priceId, 
    };
  }


  const today = new Date();
  const endDate = new Date(user.membershipEndDate);
  const diffTime = endDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  
  return {
    active: diffDays > 0 && user.isMembresyActive,
    remaining: diffDays > 0 ? diffDays : 0,
    endDate: user.membershipEndDate,
    isCancelled: user.membershipCancelled || false,
    subscriptionId: lastPayment?.stripeSubscriptionId || null,
    priceId: priceId,
  };
}

async getActiveSubscriptionByUserId(userId: string): Promise<{ subscriptionId: string }> {

    const user = await this.findUserById(userId);
    if (!user.isMembresyActive) {
      throw new NotFoundException(`El usuario con ID ${userId} no tiene una membresía activa.`);
    }

  
    const lastPaymentWithSubscription = await this.paymentRepository.findOne({
      where: {
        user_id: userId,
        stripeSubscriptionId: Not(IsNull()), // Nos aseguramos que el campo no sea nulo
      },
      order: {
        date: 'DESC', 
      },
    });


    if (!lastPaymentWithSubscription || !lastPaymentWithSubscription.stripeSubscriptionId) {
      throw new NotFoundException(`No se encontró un ID de suscripción para el usuario ${userId}.`);
    }

 
    return { subscriptionId: lastPaymentWithSubscription.stripeSubscriptionId };
  }
}