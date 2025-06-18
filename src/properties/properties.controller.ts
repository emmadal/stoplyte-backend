import { Body, Controller, Get, Param, Post, Query, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiQuery, ApiBearerAuth, ApiCookieAuth } from '@nestjs/swagger';

import { Public } from 'src/decorators/public.decorator';
import { PropertiesService } from './properties.service';
import { Roles } from '../decorators/roles.decorator';
import { PropertyScoringService } from './property-scoring.service';
import {
  PropertyScoringFilterDto,
  PropertyScoringPropertyDto,
  ScoringResultDto
} from './dto/property-scoring.dto';
import { PropertyScoringQueueService } from './property-scoring-queue.service';
import { PrismaService } from '../database/prisma.service';

@ApiTags('Properties')
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
  @ApiOperation({ summary: 'Autocomplete property search queries' })
  @ApiQuery({ name: 'search', description: 'Search term for autocomplete', required: true })
  @ApiQuery({ name: 'type', description: 'Type of property to filter by', required: true })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns autocomplete suggestions' })
  async autocompleteProperties(
    @Query('search') search: string,
    @Query('type') type: string,
  ) {
    return this.propertiesService.autocompleteProperties(search, type);
  }

  @Post('/search')
  @Public()
  @ApiOperation({ summary: 'Search for properties with filters and pagination' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        search: {
          type: 'object',
          description: 'Search parameters',
        },
        filter: {
          type: 'object',
          description: 'Filter criteria',
        },
        pagination: {
          type: 'object',
          description: 'Pagination parameters',
          properties: {
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
          },
        },
      },
    },
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns search results with pagination' })
  async searchProperties(
    @Body('search') search: any,
    @Body('filter') filter: any,
    @Body('pagination') pagination: any,
  ) {
    return this.propertiesService.searchProperties(search, filter, pagination);
  }

  @Post('/search-by-slug')
  @Public()
  @ApiOperation({ summary: 'Find a property by its slug' })
  @ApiBody({ schema: { type: 'object', properties: { slug: { type: 'string', example: 'luxury-home-miami-beach' } } } })
  @ApiResponse({ status: HttpStatus.OK, description: 'Property details returned successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Property not found' })
  async searchBySlug(@Body('slug') slug: string) {
    return this.propertiesService.searchPropertyBySlug(slug);
  }

  @Post('/search-by-gpt-request')
  @Public()
  @ApiOperation({ summary: 'Search properties using natural language query' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        query: { type: 'string', example: 'Find me a 3 bedroom house near downtown with a pool' },
        pagination: {
          type: 'object',
          properties: {
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
          },
        },
      },
    },
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns AI-processed search results' })
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
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('stk')
  @ApiOperation({ summary: 'Check status of property request' })
  @ApiParam({ name: 'id', description: 'Property ID', example: 'prop-123' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Request status returned successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Property request not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Not authenticated' })
  async getRequestStatus(@Param('id') id: string) {
    return this.propertiesService.getRequestStatus(String(id));
  }

  @Post('/:id/ask-details')
  @Roles('user')
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('stk')
  @ApiOperation({ summary: 'Request additional details about a property' })
  @ApiParam({ name: 'id', description: 'Property ID', example: 'prop-123' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['email', 'message'],
      properties: {
        email: { type: 'string', example: 'user@example.com' },
        message: { type: 'string', example: 'I would like to know more about this property.' },
        phone: { type: 'string', example: '555-123-4567' },
      },
    },
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Details request submitted successfully' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Not authenticated' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid request parameters' })
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
  @ApiOperation({ summary: 'Score a property against filtering criteria' })
  @ApiBody({ schema: { type: 'object', properties: { filter: { $ref: '#/components/schemas/PropertyScoringFilterDto' }, property: { $ref: '#/components/schemas/PropertyScoringPropertyDto' } } } })
  @ApiResponse({ status: HttpStatus.OK, description: 'Property scoring results', type: ScoringResultDto })
  async scoreProperty(
    @Body('filter') filter: PropertyScoringFilterDto,
    @Body('property') property: PropertyScoringPropertyDto,
  ) {
    // Returns the scoring result for a property based on the provided filter
    return this.propertyScoringService.scoreProperty(filter, property);
  }

  @Post('/score-async')
  @Public()
  @ApiOperation({ summary: 'Score a property asynchronously against filtering criteria' })
  @ApiBody({ schema: { type: 'object', properties: { filter: { $ref: '#/components/schemas/PropertyScoringFilterDto' }, property: { $ref: '#/components/schemas/PropertyScoringPropertyDto' } } } })
  @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'Scoring job accepted for processing' })
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
