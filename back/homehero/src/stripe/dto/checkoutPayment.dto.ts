import { IsNotEmpty, IsString, IsUrl, IsUUID } from 'class-validator';

export class CheckoutSessionDto {
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @IsNotEmpty()
  @IsString()
  priceId: string;

  @IsNotEmpty()
  @IsUrl()
  successUrl: string;

  @IsNotEmpty()
  @IsUrl()
  cancelUrl: string;
}