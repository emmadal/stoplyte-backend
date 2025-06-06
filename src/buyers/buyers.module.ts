import { BuyersController } from './buyers.controller';
import { BuyersService } from './buyers.service';
import { Module } from '@nestjs/common';

@Module({
  controllers: [BuyersController],
  providers: [BuyersService],
})
export class BuyersModule {}
