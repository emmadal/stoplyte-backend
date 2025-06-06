import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AdminsService } from './admin.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from 'src/decorators/roles.decorator';

@Controller('admin')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}
  @Post('/bulk-upload')
  @Roles('admin')
  @UseInterceptors(FileInterceptor('file'))
  async syncBulkUpload(@UploadedFile() file: Express.Multer.File) {
    return this.adminsService.processXlsxWithColors(file);
  }
}
