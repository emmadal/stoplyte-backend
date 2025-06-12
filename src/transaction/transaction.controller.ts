import { Body, Controller, Post } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDTO } from './dto/transaction.dto';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}
  @Post('create')
  async createTransaction(
    @Body()
    body: CreateTransactionDTO,
  ) {
    return await this.transactionService.createTransactionIntent(body);
  }
}
