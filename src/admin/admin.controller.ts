import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  HttpStatus
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody, ApiBearerAuth, ApiCookieAuth } from '@nestjs/swagger';
import { AdminsService } from './admin.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from 'src/decorators/roles.decorator';

@ApiTags('Admin')
@Controller('admin')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}
  @Post('/bulk-upload')
  @Roles('admin')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('stk')
  @ApiOperation({ summary: 'Upload property data in bulk via XLSX file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'XLSX file containing property data'
        }
      }
    }
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'File processed successfully' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Not authorized' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid file format' })
  async syncBulkUpload(@UploadedFile() file: Express.Multer.File) {
    return this.adminsService.processXlsxWithColors(file);
  }
}
