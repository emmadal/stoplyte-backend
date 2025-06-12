import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PropertyScoringService } from '../properties/property-scoring.service';
import { UtilsService } from '../utils/utils.service';
import { PrismaService } from '../database/prisma.service';
import { Logger } from '@nestjs/common';

@Processor('property-scoring')
export class WorkerConsumer extends WorkerHost {
  private logger = new Logger(WorkerConsumer.name);
  constructor(
    private readonly propertyScoringService: PropertyScoringService,
    private readonly prisma: PrismaService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case 'score':
        console.log('JOB NAME:', job.name);
        return await this.handleScoringJob(job);
      default:
        break;
    }
  }

  async handleScoringJob(job: Job<any>) {
    const { propertyId, filter, property } = job.data;
    const cacheKey = `score:${propertyId}:${JSON.stringify(filter)}`;
    this.logger.log(
      `[WORKER] Received job: ${job.id} for propertyId: ${propertyId}`,
    );
    this.logger.debug(`[WORKER] Job data: ${JSON.stringify(job.data)}`);
    try {
      const result = await this.propertyScoringService.scoreProperty(
        filter,
        property,
      );
      await UtilsService.saveCachedData(cacheKey, result, this.prisma);
      return result;
    } catch (error) {
      this.logger.error(
        `[WORKER] Error scoring propertyId: ${propertyId}: ${error}`,
      );
      await UtilsService.saveCachedData(
        cacheKey,
        { error: error.message },
        this.prisma,
      );
      throw error;
    }
  }
}
