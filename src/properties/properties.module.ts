import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { PropertiesController } from './properties.controller';
import { PropertiesService } from './properties.service';
import { PropertyScoringService } from './property-scoring.service';
import { UtilsService } from '../utils/utils.service';
import { PrismaService } from '../database/prisma.service';
import { OpenAiService } from '../openai/openai.service';
import { AccountsService } from '../accounts/accounts.service';
import { PropertyScoringQueueService } from './property-scoring-queue.service';

@Module({
  imports: [ConfigModule, HttpModule],
  controllers: [PropertiesController],
  providers: [
    PropertiesService,
    PropertyScoringService,
    PropertyScoringQueueService,
    UtilsService,
    PrismaService,
    OpenAiService,
    AccountsService,
  ],
  exports: [PropertyScoringService],
})
export class PropertiesModule {}
