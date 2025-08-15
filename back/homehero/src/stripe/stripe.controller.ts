import { Controller, Post, Body, Get, Param, UseGuards, NotFoundException, ForbiddenException } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { CreatePaymentDto } from './dto/create-stripe.dto';
import { CheckoutSessionDto } from './dto/update-stripe.dto';
import { AuthGuard } from '@nestjs/passport';
import { Role } from 'src/users/assets/roles';

@Controller('stripe')
export class StripeController {
  constructor(
    private readonly stripeService: StripeService,
  ) {}

  @Post('create-subscription')
  @UseGuards(AuthGuard('jwt'))
  async createSubscription(@Body() createPaymentDto: CreatePaymentDto) {
    const { userId, priceId, paymentMethodId, amount } = createPaymentDto;
    
    const user = await this.stripeService.findUserById(userId);
    
    if (user.role !== Role.PROFESSIONAL) {
  throw new ForbiddenException('Solo los usuarios profesionales pueden crear suscripciones');
}
    

    let customerId = user.stripeCustomerId;
    
    if (!customerId) {

      const customer = await this.stripeService.createCustomer(user.name, user.email);
      customerId = customer.id;
      
  
      await this.stripeService.updateUserStripeCustomerId(userId, customerId);
    }
    

    const subscription = await this.stripeService.createSubscription(
      customerId,
      priceId,
      paymentMethodId,
    );


    const paymentAmount = amount ?? 
      ((subscription['latest_invoice']?.['amount_paid'] ?? 0) / 100); 
    

    const payment = await this.stripeService.registerPayment(
      userId,
      paymentAmount,
      subscription['latest_invoice']?.['payment_intent']?.id ?? null,
      subscription.id,
    );
    
    return {
      subscriptionId: subscription.id,
      paymentId: payment.UniqueID,
      clientSecret: subscription['latest_invoice']?.['payment_intent']?.client_secret ?? null,
      status: subscription.status,
    };
  }

  @Post('create-checkout-session')
  @UseGuards(AuthGuard('jwt'))
  async createCheckoutSession(@Body() checkoutSessionDto: CheckoutSessionDto) {
    const { userId, priceId, successUrl, cancelUrl } = checkoutSessionDto;
    

    const user = await this.stripeService.findUserById(userId);
    

    if (user.role !== Role.PROFESSIONAL) {
      throw new ForbiddenException('Solo los usuarios profesionales pueden crear suscripciones');
    }
    

    let customerId = user.stripeCustomerId;
    
    if (!customerId) {
  
      const customer = await this.stripeService.createCustomer(user.name, user.email);
      customerId = customer.id;
      

      await this.stripeService.updateUserStripeCustomerId(userId, customerId);
    }
    

    const session = await this.stripeService.createCheckoutSession(
      customerId,
      priceId,
      successUrl,
      cancelUrl,
    );
    
    return { sessionId: session.id, url: session.url };
  }

  @Post('create-portal-session')
  @UseGuards(AuthGuard('jwt'))
  async createPortalSession(
    @Body('userId') userId: string,
    @Body('returnUrl') returnUrl: string,
  ) {
  
    const customerId = await this.stripeService.getUserStripeCustomerId(userId);
    if (!customerId) {
      throw new NotFoundException('El usuario no tiene una cuenta de Stripe');
    }
    

    const session = await this.stripeService.createBillingPortalSession(
      customerId,
      returnUrl,
    );
    
    return { url: session.url };
  }

  @Get('subscription/:id')
  @UseGuards(AuthGuard('jwt'))
  async getSubscription(@Param('id') id: string) {
    return this.stripeService.getSubscription(id);
  }

  @Post('cancel-subscription/:id')
  @UseGuards(AuthGuard('jwt'))
  async cancelSubscription(@Param('id') id: string) {
    return this.stripeService.cancelSubscription(id);
  }

  @Get('user-payments/:userId')
  @UseGuards(AuthGuard('jwt'))
  async getUserPayments(@Param('userId') userId: string) {
    return this.stripeService.getUserPayments(userId);
  }
}