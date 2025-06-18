import { Body, Controller, Post, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { TransactionService } from './transaction.service';
import { CreateTransactionDTO, TransactionResponseDTO } from './dto/transaction.dto';

@ApiTags('Transaction')
@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}
  @Post('create')
  @ApiOperation({ summary: 'Create a new payment transaction intent' })
  @ApiBody({ type: CreateTransactionDTO })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Transaction intent created successfully',
    type: TransactionResponseDTO
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
  async createTransaction(
    @Body()
    body: CreateTransactionDTO,
  ) {
    return await this.transactionService.createTransactionIntent(body);
  }
}
