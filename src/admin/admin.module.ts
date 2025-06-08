import { Module } from '@nestjs/common';
import { AdminsController } from './admin.controller';
import { AdminsService } from './admin.service';
import { AccountsService } from 'src/accounts/accounts.service';
import { UtilsModule } from 'src/utils/utils.module';

@Module({
  imports: [UtilsModule],
  controllers: [AdminsController],
  providers: [AdminsService, AccountsService],
})
export class AdminsModule {}
