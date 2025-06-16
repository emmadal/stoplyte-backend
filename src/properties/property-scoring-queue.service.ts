import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  PropertyScoringFilterDto,
  PropertyScoringPropertyDto,
} from './dto/property-scoring.dto';
import { UtilsService } from '../utils/utils.service';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class PropertyScoringQueueService {
  constructor(@InjectQueue('property-scoring') private queue: Queue) {}

  async addScoringJob(propertyId: string, filter: any, property: any) {
    console.log('[QUEUE] Adding job to queue:', {
      propertyId,
      filter,
      property,
    });
    await this.queue.add('score', { propertyId, filter, property });
    return true;
  }

  async scorePropertyAsync(
    filter: PropertyScoringFilterDto,
    property: PropertyScoringPropertyDto,
    prisma: PrismaService,
  ): Promise<{ status: string; result?: any }> {
    const propertyId = property.id || property.propertyId;
    const cacheKey = `score:${propertyId}:${JSON.stringify(filter)}`;
    console.log('[QUEUE] Checking cache for:', cacheKey);
    const cached = await UtilsService.getCachedData(cacheKey, 60, prisma); // TTL 60 minutes
    if (cached) {
      console.log('[QUEUE] Cache hit:', cached);
      let resultWithId =
        cached && typeof cached === 'object' && !Array.isArray(cached)
          ? { id: propertyId, ...cached }
          : cached;
      if (resultWithId && resultWithId.id !== propertyId) {
        resultWithId = { ...resultWithId, id: propertyId };
      }
      return {
        status: cached.error ? 'error' : 'scored',
        result: resultWithId,
      };
    }
    await this.addScoringJob(propertyId, filter, property);
    console.log('[QUEUE] Job added, returning pending');
    return { status: 'pending' };
  }
}
