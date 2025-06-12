import { Injectable } from '@nestjs/common';
import { OpenAiChatResponse } from './interface';

@Injectable()
export class OpenAiService {
  constructor() {}

  async chatCompletion(
    systemPrompt: string,
    userPrompt: string,
  ): Promise<string> {
    const openaiKey = process.env.OPENAI_API_KEY;
    const url = 'https://api.openai.com/v1/chat/completions';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data: OpenAiChatResponse = await response.json();

    if (
      !data ||
      !data.choices ||
      !data.choices[0] ||
      !data.choices[0].message ||
      !data.choices[0].message.content
    ) {
      throw new Error('Invalid response from OpenAI');
    }
    return data.choices[0].message.content;
  }
}
