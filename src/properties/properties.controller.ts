import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';

import { Public } from 'src/decorators/public.decorator';
import { PropertiesService } from './properties.service';
import { Roles } from '../decorators/roles.decorator';
import { PropertyScoringService } from './property-scoring.service';
import {
  PropertyScoringFilterDto,
  PropertyScoringPropertyDto,
} from './dto/property-scoring.dto';
import { PropertyScoringQueueService } from './property-scoring-queue.service';
import { PrismaService } from '../database/prisma.service';

@Controller('properties')
export class PropertiesController {
  constructor(
    private readonly propertiesService: PropertiesService,
    private readonly propertyScoringService: PropertyScoringService,
    private readonly propertyScoringQueueService: PropertyScoringQueueService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('/autocomplete')
  @Public()
  async autocompleteProperties(
    @Query('search') search: string,
    @Query('type') type: string,
  ) {
    return this.propertiesService.autocompleteProperties(search, type);
  }

  @Post('/search')
  @Public()
  async searchProperties(
    @Body('search') search: any,
    @Body('filter') filter: any,
    @Body('pagination') pagination: any,
  ) {
    return this.propertiesService.searchProperties(search, filter, pagination);
  }

  @Post('/search-by-slug')
  @Public()
  async searchBySlug(@Body('slug') slug: string) {
    return this.propertiesService.searchPropertyBySlug(slug);
  }

  @Post('/search-by-gpt-request')
  @Public()
  async searchByGptRequest(
    @Body('query') query: string,
    @Body('pagination') pagination: any,
  ) {
    return this.propertiesService.searchPropertiesByGptRequest(
      query,
      pagination,
    );
  }

  @Get('/:id/request-status')
  @Roles('user')
  async getRequestStatus(@Param('id') id: string) {
    return this.propertiesService.getRequestStatus(String(id));
  }

  @Post('/:id/ask-details')
  @Roles('user')
  async requestDetails(
    @Param('id') id: string,
    @Body('email') email: string,
    @Body('message') message: string,
    @Body('phone') phone: string,
  ) {
    return this.propertiesService.requestDetails(
      String(id),
      email,
      message,
      phone,
    );
  }

  @Post('/score')
  @Public()
  async scoreProperty(
    @Body('filter') filter: PropertyScoringFilterDto,
    @Body('property') property: PropertyScoringPropertyDto,
  ) {
    // Returns the scoring result for a property based on the provided filter
    return this.propertyScoringService.scoreProperty(filter, property);
  }

  @Post('/score-async')
  @Public()
  async scorePropertyAsync(
    @Body('filter') filter: PropertyScoringFilterDto,
    @Body('property') property: PropertyScoringPropertyDto,
  ) {
    return this.propertyScoringQueueService.scorePropertyAsync(
      filter,
      property,
      this.prisma,
    );
  }
}
