import { Module } from '@nestjs/common';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { StripeModule } from '../stripe/stripe.module';
import { PrismaModule } from '../database/prisma.module';

@Module({
  imports: [StripeModule, PrismaModule],
  controllers: [TransactionController],
  providers: [TransactionService],
})
export class TransactionModule {}
