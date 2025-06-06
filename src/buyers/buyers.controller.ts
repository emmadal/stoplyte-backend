import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';

import { BuyersService } from './buyers.service';
import { SaveSearchDTO, UpdateSearchDTO } from './dto/search.dto';
import { Roles } from '../decorators/roles.decorator';
import { Public } from '../decorators/public.decorator';

@Controller('buyers')
export class BuyersController {
  constructor(private readonly buyersService: BuyersService) {}

  @Post('/potential-buyers')
  @Public()
  async getPotentialBuyers(@Body('filter') filter: any) {
    return this.buyersService.getPotentialBuyers(filter);
  }

  @Get('/searches')
  @Roles('user')
  async getSavedSearches() {
    return this.buyersService.getSavedSearches();
  }

  @Post('/searches')
  @Roles('user')
  async saveSearch(@Body() searchDTO: SaveSearchDTO) {
    return this.buyersService.createSearch(searchDTO);
  }

  @Put('/searches/:id')
  @Roles('user')
  async updateSearch(
    @Param('id') id: string,
    @Body() searchDTO: UpdateSearchDTO,
  ) {
    return this.buyersService.updateSearch(id, searchDTO);
  }
  @Delete('/searches/:id')
  @Roles('user')
  async deleteSearch(@Param('id') id: string) {
    return this.buyersService.deleteSearch(id);
  }
}
