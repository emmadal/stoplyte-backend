import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { Public } from 'src/decorators/public.decorator';
import { Roles } from 'src/decorators/roles.decorator';
import { CreatePartnerDto } from './dto/create-partners.dto';
import { PartnersService } from './partners.service';

@Controller('partners')
export class PartnersController {
  constructor(private readonly partnersService: PartnersService) {}

  @Post()
  @Roles('admin')
  async create(@Body() dto: CreatePartnerDto) {
    return this.partnersService.create(dto);
  }

  @Get()
  @Public()
  findAll(
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('location') location?: string,
  ) {
    return this.partnersService.findAll({ search, category, location });
  }

  @Get('/trusted')
  @Public()
  findTrusted() {
    return this.partnersService.findTrusted();
  }

  /** GET /partners/locations */
  @Get('locations')
  @Public()
  getLocations() {
    return this.partnersService.getLocations();
  }

  /** GET /partners/categories */
  @Get('categories')
  @Public()
  getCategories() {
    return this.partnersService.getCategories();
  }
}
