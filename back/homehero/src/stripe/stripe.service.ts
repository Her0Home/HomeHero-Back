import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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


  async cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return this.stripe.subscriptions.cancel(subscriptionId);
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
    // Obtener la suscripción con la última factura expandida
    const subscription = await this.stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['latest_invoice', 'latest_invoice.payment_intent'],
    });

    // Usamos "as any" para evitar problemas de tipado
    const subscriptionData = subscription as any;

    // Comprobar la estructura de los datos
    if (!subscriptionData.latest_invoice) {
      console.warn(`Subscription ${subscriptionId} has no latest_invoice`);
      return null;
    }

    // La factura puede ser un string (ID) o un objeto completo
    let invoiceData: any;
    if (typeof subscriptionData.latest_invoice === 'string') {
      invoiceData = await this.stripe.invoices.retrieve(subscriptionData.latest_invoice, { 
        expand: ['payment_intent'] 
      });
    } else {
      invoiceData = subscriptionData.latest_invoice;
    }

    // El payment_intent puede estar en diferentes ubicaciones
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

  // Crear un PaymentMethod de prueba esto se borrara luego
  async createTestPaymentMethod(cardNumber: string = '4242424242424242'): Promise<string> {
  try {
   
    const paymentMethod = await this.stripe.paymentMethods.create({
      type: 'card',
      card: {
        token: 'tok_visa', 
      },
    });
    
    return paymentMethod.id;
  } catch (error) {
    throw new error (`Error al crear PaymentMethod: ${error.message}`);
  }
}
}