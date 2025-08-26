import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { StripeWebhookController } from './Webhook.stripe.controller';
import { Payment } from './entities/stripe.entity';
import { User } from '../users/entities/user.entity';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Payment, User]),
    EmailModule,
  ],
  controllers: [StripeController, StripeWebhookController],
  providers: [StripeService],
  exports: [StripeService], 
})
export class StripeModule {}