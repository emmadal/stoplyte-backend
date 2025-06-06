import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';

import { Public } from 'src/decorators/public.decorator';
import { PropertiesService } from './properties.service';
import { Roles } from '../decorators/roles.decorator';

@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

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
}
