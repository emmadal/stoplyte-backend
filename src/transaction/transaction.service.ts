import { Inject, Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import { PrismaService } from '../database/prisma.service';
import { CreateTransactionDTO } from './dto/transaction.dto';

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(
    @Inject('STRIPE_CLIENT') private readonly stripe: Stripe,
    private readonly prismaService: PrismaService,
  ) {}

  // Create payment intent
  async createTransactionIntent(body: CreateTransactionDTO) {
    const intent = await this.stripe.paymentIntents.create({
      amount: body.amount,
      currency: 'usd',
      receipt_email: body.receipt_email,
      description: body.description,
      automatic_payment_methods: {
        enabled: true,
      },
    });
    this.logger.log(intent);
    if (intent.status === 'succeeded') {
      await this.prismaService.transactions.create({
        data: {
          stripePaymentIntentId: intent.id,
          object: intent.object,
          status: intent.status,
          amount: intent.amount,
          claimed_property_id: body.claimed_property_id,
          accounts_uid: body.accounts_uid,
          description: body.description,
          paymentMethodType: intent.payment_method_types[0],
          currency: intent.currency,
          paymentReference: intent.id,
        },
      });
    }
    return intent;
  }
}
