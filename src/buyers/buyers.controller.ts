import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody, ApiCookieAuth } from '@nestjs/swagger';

import { BuyersService } from './buyers.service';
import { SaveSearchDTO, UpdateSearchDTO } from './dto/search.dto';
import { Roles } from '../decorators/roles.decorator';
import { Public } from '../decorators/public.decorator';

@ApiTags('Buyers')
@Controller('buyers')
export class BuyersController {
  constructor(private readonly buyersService: BuyersService) {}

  @Post('/potential-buyers')
  @Public()
  @ApiOperation({ summary: 'Get potential buyers based on filter criteria' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        filter: {
          type: 'object',
          example: {
            location: 'San Francisco',
            priceMin: 300000,
            priceMax: 800000
          }
        }
      }
    }
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Successfully retrieved potential buyers' })
  async getPotentialBuyers(@Body('filter') filter: any) {
    return this.buyersService.getPotentialBuyers(filter);
  }

  @Get('/searches')
  @Roles('user')
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('stk')
  @ApiOperation({ summary: 'Get all saved searches for the current user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Successfully retrieved saved searches' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Not authenticated' })
  async getSavedSearches() {
    return this.buyersService.getSavedSearches();
  }

  @Post('/searches')
  @Roles('user')
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('stk')
  @ApiOperation({ summary: 'Create a new saved search' })
  @ApiBody({ type: SaveSearchDTO })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Search saved successfully' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Not authenticated' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input' })
  async saveSearch(@Body() searchDTO: SaveSearchDTO) {
    return this.buyersService.createSearch(searchDTO);
  }

  @Put('/searches/:id')
  @Roles('user')
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('stk')
  @ApiOperation({ summary: 'Update an existing saved search' })
  @ApiParam({ name: 'id', description: 'ID of the saved search to update' })
  @ApiBody({ type: UpdateSearchDTO })
  @ApiResponse({ status: HttpStatus.OK, description: 'Search updated successfully' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Not authenticated' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Saved search not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input' })
  async updateSearch(
    @Param('id') id: string,
    @Body() searchDTO: UpdateSearchDTO,
  ) {
    return this.buyersService.updateSearch(id, searchDTO);
  }
  @Delete('/searches/:id')
  @Roles('user')
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('stk')
  @ApiOperation({ summary: 'Delete a saved search' })
  @ApiParam({ name: 'id', description: 'ID of the saved search to delete' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Search deleted successfully' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Not authenticated' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Saved search not found' })
  async deleteSearch(@Param('id') id: string) {
    return this.buyersService.deleteSearch(id);
  }
}
