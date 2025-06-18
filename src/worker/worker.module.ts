import '@bull-board/ui/package.json';
import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ExpressAdapter } from '@bull-board/express';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import * as process from 'node:process';
import { WorkerConsumer } from './worker.consumer';
import { PropertiesModule } from '../properties/properties.module';

const propertyScoringQueue = BullModule.registerQueue({
  name: 'property-scoring',
});

@Global()
@Module({
  imports: [
    PropertiesModule,
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST,
        password: process.env.REDIS_PASSWORD,
        port: 6379,
      },
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    }),
    propertyScoringQueue,
    //register the bull-board module forRoot in your app.module
    BullBoardModule.forRoot({
      route: '/queues',
      adapter: ExpressAdapter,
      boardOptions: {
        uiConfig: {
          boardTitle: 'Stoplyte Job',
          pollingInterval: {
            forceInterval: 1000,
            showSetting: true,
          },
        },
      },
    }),
    BullBoardModule.forFeature({
      name: 'property-scoring',
      adapter: BullMQAdapter,
      options: {
        description: 'Property Scoring Queue',
      },
    }),
  ],
  controllers: [],
  providers: [WorkerConsumer],
  exports: [propertyScoringQueue],
})
export class WorkerModule {}
