import { PropertiesController } from './properties.controller';
import { PropertiesService } from './properties.service';
import { Module } from '@nestjs/common';

@Module({
  controllers: [PropertiesController],
  providers: [PropertiesService],
})
export class PropertiesModule {}
