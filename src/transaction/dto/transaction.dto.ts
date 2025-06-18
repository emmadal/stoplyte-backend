import {
  IsString,
  IsOptional,
  IsNumber,
  IsUUID,
  IsIn,
  IsNotEmpty,
  IsEmail,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// DTO for creating a transaction
export class CreateTransactionDTO {
  @ApiProperty({
    description: 'Transaction amount in cents',
    example: 10000,
  })
  @IsNumber()
  @IsNotEmpty()
  readonly amount: number;

  @ApiProperty({
    description: 'Email address to send the receipt to',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  readonly receipt_email: string;

  @ApiProperty({
    description: 'ID of the claimed property for this transaction',
    example: 'property-123',
  })
  @IsString()
  @IsNotEmpty()
  readonly claimed_property_id: string;

  @ApiPropertyOptional({
    description: 'Transaction description',
    example: 'Payment for property at 123 Main St',
  })
  @IsString()
  @IsOptional()
  readonly description?: string;

  @ApiPropertyOptional({
    description: 'Transaction currency',
    example: 'usd',
    default: 'usd',
  })
  @IsString()
  @IsOptional()
  readonly currency?: string = 'usd';

  @ApiProperty({
    description: 'ID of the user account making the transaction',
    example: 'user-456',
  })
  @IsString()
  @IsNotEmpty()
  readonly accounts_uid: string;
}

// DTO for transaction response
export class TransactionResponseDTO {
  @ApiProperty({
    description: 'Transaction ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  readonly id: string;

  @ApiProperty({
    description: 'Transaction amount in cents',
    example: 10000,
  })
  @IsNumber()
  readonly amount: number;

  @ApiProperty({
    description: 'Payment method used',
    example: 'card',
  })
  @IsString()
  readonly paymentMethod: string;

  @ApiProperty({
    description: 'Stripe payment intent ID',
    example: 'pi_1J4JrILkdIwDmIBp0X7NFU2B',
  })
  @IsString()
  readonly stripePaymentIntentId: string;

  @ApiProperty({
    description: 'Transaction status',
    example: 'succeeded',
    enum: ['pending', 'succeeded', 'failed', 'refunded', 'canceled'],
  })
  @IsString()
  @IsIn(['pending', 'succeeded', 'failed', 'refunded', 'canceled'])
  readonly status: string;

  @ApiProperty({
    description: 'ID of the claimed property',
    example: 'property-123',
  })
  @IsString()
  readonly claimed_property_id: string;

  @ApiProperty({
    description: 'ID of the user account that made the transaction',
    example: 'user-456',
  })
  @IsString()
  readonly accounts_uid: string;

  @ApiProperty({
    description: 'Transaction creation timestamp',
    example: '2025-06-18T11:39:59Z',
  })
  @Type(() => Date)
  readonly createdAt: Date;
}

// DTO for updating a transaction status
export class UpdateTransactionStatusDTO {
  @ApiProperty({
    description: 'Updated transaction status',
    example: 'succeeded',
    enum: ['pending', 'succeeded', 'failed', 'refunded', 'canceled'],
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['pending', 'succeeded', 'failed', 'refunded', 'canceled'])
  readonly status: string;

  @ApiPropertyOptional({
    description: 'Stripe payment intent ID',
    example: 'pi_1J4JrILkdIwDmIBp0X7NFU2B',
  })
  @IsString()
  @IsOptional()
  readonly stripePaymentIntentId?: string;
}


