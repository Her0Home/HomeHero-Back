import { Controller, Post, Body, Get, Param, UseGuards, NotFoundException, ForbiddenException, Req, BadRequestException } from '@nestjs/common';
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

  
  
  @ApiBearerAuth()
  @Post('create-checkout-session')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.PROFESSIONAL)
  async createCheckoutSession(@Body() checkoutSessionDto: CheckoutSessionDto) {
    const { userId, priceId, successUrl, cancelUrl } = checkoutSessionDto;
    
    

    const user = await this.stripeService.findUserById(userId);
    
     if (user.isMembresyActive) {
      throw new BadRequestException('El usuario ya tiene una suscripción activa.');
    }

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
    
    return { url: session.url };
  }

  

  @ApiBearerAuth()
  @Get('subscription/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.PROFESSIONAL)
  async getSubscription(@Param('id') id: string) {
    return this.stripeService.getSubscription(id);
  }

  @ApiBearerAuth()
  @Post('cancel-subscription/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.PROFESSIONAL)
  async cancelSubscription(@Param('id') id: string) {
    return this.stripeService.cancelSubscription(id);
  }

  @ApiBearerAuth()
  @Get('user-payments/:userId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.PROFESSIONAL)
  async getUserPayments(@Param('userId') userId: string) {
    return this.stripeService.getUserPayments(userId);
  }

  
@ApiBearerAuth()
@Get('membership-info')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.PROFESSIONAL)
async getMembershipInfo(@Req() req) {
  const userId = req.user.id;
  return this.stripeService.getMembershipInfo(userId);
}
@ApiBearerAuth()
  @Get('user-subscription/:userId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.PROFESSIONAL)
  async getUserSubscription(@Param('userId') userId: string) {
    return this.stripeService.getActiveSubscriptionByUserId(userId);
  }
}
