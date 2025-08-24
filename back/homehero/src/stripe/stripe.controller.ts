import { Controller, Post, Body, Get, Param, UseGuards, NotFoundException, ForbiddenException } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { CreatePaymentDto } from './dto/createPayment.dto';
import { CheckoutSessionDto } from './dto/checkoutPayment.dto';
import { AuthGuard } from '@nestjs/passport';
import { Role } from 'src/users/assets/roles';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/decorators/role.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('stripe')
export class StripeController {
  constructor(
    private readonly stripeService: StripeService,
  ) {}

  // @Post('create-subscription')
  // @Roles(Role.PROFESSIONAL)
  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  // async createSubscription(@Body() createPaymentDto: CreatePaymentDto) {
  //   const { userId, priceId, paymentMethodId, amount } = createPaymentDto;
    
 
  //   const user = await this.stripeService.findUserById(userId);
    
   
  //   if (user.role !== Role.PROFESSIONAL) {
  //     throw new ForbiddenException('Solo los usuarios profesionales pueden crear suscripciones');
  //   }
    

  //   let customerId = user.stripeCustomerId;
    
  //   if (!customerId) {

  //     const customer = await this.stripeService.createCustomer(user.name, user.email);
  //     customerId = customer.id;
      
    
  //     await this.stripeService.updateUserStripeCustomerId(userId, customerId);
  //   }
    

  //   const subscription = await this.stripeService.createSubscription(
  //     customerId,
  //     priceId,
  //     paymentMethodId || undefined,
  //   );


  //   const paymentAmount = amount || 
  //     (subscription['latest_invoice'] && subscription['latest_invoice']['amount_paid'] 
  //       ? subscription['latest_invoice']['amount_paid'] / 100 
  //       : 0); 
    
  
  //   const paymentIntentId =
  //     subscription['latest_invoice'] && subscription['latest_invoice']['payment_intent']
  //       ? subscription['latest_invoice']['payment_intent'].id
  //       : null;

  //   const payment = await this.stripeService.registerPayment(
  //     userId,
  //     paymentAmount,
  //     paymentIntentId,
  //     subscription.id,
  //   );
  //   if (subscription.status === 'active') {
  //   await this.stripeService.updateUserMembershipStatus(userId, true);
  // }
    
  //   return {
  //     subscriptionId: subscription.id,
  //     paymentId: payment.UniqueID,
  //     PaymentStatus: subscription.status,
  //   };
  // }

  
  @Post('create-checkout-session')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.PROFESSIONAL)
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
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.PROFESSIONAL)
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
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.PROFESSIONAL)
  async getSubscription(@Param('id') id: string) {
    return this.stripeService.getSubscription(id);
  }

  @Post('cancel-subscription/:id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.PROFESSIONAL)
  async cancelSubscription(@Param('id') id: string) {
    return this.stripeService.cancelSubscription(id);
  }

  @Get('user-payments/:userId')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.PROFESSIONAL)
  async getUserPayments(@Param('userId') userId: string) {
    return this.stripeService.getUserPayments(userId);
  }

  

  /////pruebas de id de metodo de pago
//    @Get('test-payment-method')
//   async getTestPaymentMethod() {
//     const paymentMethodId = await this.stripeService.createTestPaymentMethod();
//     return { paymentMethodId: paymentMethodId };
//   }
}
