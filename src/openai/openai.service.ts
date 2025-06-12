import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { OpenAiChatResponse } from './interface';

@Injectable()
export class OpenAiService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async chatCompletion(
    systemPrompt: string,
    userPrompt: string,
  ): Promise<string> {
    const openaiKey = this.configService.get<string>('OPENAI_API_KEY');
    const url = 'https://api.openai.com/v1/chat/completions';
    const response = await firstValueFrom(
      this.httpService.post<OpenAiChatResponse>(
        url,
        {
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openaiKey}`,
          },
        },
      ),
    );
    if (
      !response.data ||
      !response.data.choices ||
      !response.data.choices[0] ||
      !response.data.choices[0].message ||
      !response.data.choices[0].message.content
    ) {
      throw new Error('Invalid response from OpenAI');
    }
    return response.data.choices[0].message.content;
  }
}