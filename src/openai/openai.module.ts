import { Module } from '@nestjs/common';
import { OpenAiService } from './openai.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [],
  providers: [OpenAiService],
  exports: [OpenAiService],
})
export class OpenaiModule {}
