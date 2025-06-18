import { Controller, Get, Query, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth, ApiCookieAuth } from '@nestjs/swagger';
import { StorageService } from './storage.service';
import { Roles } from '../decorators/roles.decorator';

@ApiTags('Storage')
@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Get('/upload-link')
  @Roles('user')
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('stk')
  @ApiOperation({ summary: 'Generate a secure upload link for file storage' })
  @ApiQuery({ name: 'path', description: 'File path or name to be stored', required: true, example: 'property-images/house123.jpg' })
  @ApiQuery({ name: 'privateStorage', description: 'Whether the file should be stored privately', required: false, type: 'boolean', example: 'true' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Upload link generated successfully', schema: { type: 'string', example: 'https://storage.example.com/upload-url?token=xyz' } })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Not authenticated' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid path parameter' })
  async generateUploadLink(
    @Query('path') path: string,
    @Query('privateStorage') privateStorage?: string,
  ): Promise<string> {
    return this.storageService.generateUploadLink(
      path,
      privateStorage === 'true',
    );
  }
}
