import {
  IsString,
  IsOptional,
  IsNumber,
  IsUUID,
  IsIn,
  IsNotEmpty,
  IsEmail,
} from 'class-validator';
import { Type } from 'class-transformer';

// DTO for creating a transaction
export class CreateTransactionDTO {
  @IsNumber()
  @IsNotEmpty()
  readonly amount: number;

  @IsEmail()
  @IsNotEmpty()
  readonly receipt_email: string;

  @IsString()
  @IsNotEmpty()
  readonly claimed_property_id: string;

  @IsString()
  @IsOptional()
  readonly description?: string;

  @IsString()
  @IsOptional()
  readonly currency?: string = 'usd';

  @IsString()
  @IsNotEmpty()
  readonly accounts_uid: string;
}

// DTO for transaction response
export class TransactionResponseDTO {
  @IsUUID()
  readonly id: string;

  @IsNumber()
  readonly amount: number;

  @IsString()
  readonly paymentMethod: string;

  @IsString()
  readonly stripePaymentIntentId: string;

  @IsString()
  @IsIn(['pending', 'succeeded', 'failed', 'refunded', 'canceled'])
  readonly status: string;

  @IsString()
  readonly claimed_property_id: string;

  @IsString()
  readonly accounts_uid: string;

  @Type(() => Date)
  readonly createdAt: Date;
}

// DTO for updating a transaction status
export class UpdateTransactionStatusDTO {
  @IsString()
  @IsNotEmpty()
  @IsIn(['pending', 'succeeded', 'failed', 'refunded', 'canceled'])
  readonly status: string;

  @IsString()
  @IsOptional()
  readonly stripePaymentIntentId?: string;
}


