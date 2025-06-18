import { Body, Controller, Get, Post, Query, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery, ApiBearerAuth, ApiCookieAuth } from '@nestjs/swagger';
import { Public } from 'src/decorators/public.decorator';
import { Roles } from 'src/decorators/roles.decorator';
import { CreatePartnerDto } from './dto/create-partners.dto';
import { PartnersService } from './partners.service';

@ApiTags('Partners')
@Controller('partners')
export class PartnersController {
  constructor(private readonly partnersService: PartnersService) {}

  @Post()
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('stk')
  @ApiOperation({ summary: 'Create a new partner' })
  @ApiBody({ type: CreatePartnerDto })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Partner created successfully' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Not authorized to create partners' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
  async create(@Body() dto: CreatePartnerDto) {
    return this.partnersService.create(dto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all partners with optional filters' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term to filter partners' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter partners by category' })
  @ApiQuery({ name: 'location', required: false, description: 'Filter partners by location' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns a list of partners' })
  findAll(
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('location') location?: string,
  ) {
    return this.partnersService.findAll({ search, category, location });
  }

  @Get('/trusted')
  @Public()
  @ApiOperation({ summary: 'Get list of trusted partners' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns a list of trusted partners' })
  findTrusted() {
    return this.partnersService.findTrusted();
  }

  /** GET /partners/locations */
  @Get('locations')
  @Public()
  @ApiOperation({ summary: 'Get all available partner locations' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Returns a list of unique partner locations',
    schema: {
      type: 'array',
      items: {
        type: 'string',
        example: 'Miami, FL'
      }
    }
  })
  getLocations() {
    return this.partnersService.getLocations();
  }

  /** GET /partners/categories */
  @Get('categories')
  @Public()
  @ApiOperation({ summary: 'Get all available partner categories' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Returns a list of unique partner categories',
    schema: {
      type: 'array',
      items: {
        type: 'string',
        example: 'Home Inspection'
      }
    }
  })
  getCategories() {
    return this.partnersService.getCategories();
  }
}
