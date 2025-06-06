import { Controller, Get, Logger, Query } from '@nestjs/common';
import { StorageService } from './storage.service';
import { Roles } from '../decorators/roles.decorator';

@Controller('storage')
export class StorageController {
  private readonly logger = new Logger(StorageController.name);

  constructor(private readonly storageService: StorageService) {}

  @Get('/upload-link')
  @Roles('user')
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
