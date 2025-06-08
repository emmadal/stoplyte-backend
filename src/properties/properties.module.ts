import { PropertiesController } from './properties.controller';
import { PropertiesService } from './properties.service';
import { Module } from '@nestjs/common';
import { AccountsModule } from '../accounts/accounts.module';

@Module({
  imports: [AccountsModule],
  controllers: [PropertiesController],
  providers: [PropertiesService],
})
export class PropertiesModule {}
