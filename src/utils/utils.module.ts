import { Module } from '@nestjs/common';
import { UtilsService } from './utils.service';
import { JwtStrategy } from './jwt.strategy';

@Module({
  providers: [UtilsService, JwtStrategy],
  exports: [UtilsService, JwtStrategy],
})
export class UtilsModule {}
