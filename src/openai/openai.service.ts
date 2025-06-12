import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // This is the default and can be omitted
});

@Injectable()
export class OpenAiService {
  constructor() {}

  async chatCompletion(
    systemPrompt: string,
    userPrompt: string,
  ): Promise<string> {
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0,
    });

    console.log('completion', completion);

    if (
      !completion.choices ||
      !completion.choices ||
      !completion.choices[0] ||
      !completion.choices[0].message ||
      !completion.choices[0].message.content
    ) {
      throw new Error('Invalid response from OpenAI');
    }
    return completion.choices[0].message.content;
  }
}
