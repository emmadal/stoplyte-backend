import { Injectable, BadRequestException } from '@nestjs/common';
import { SYSTEM_PROMPT } from './property-scoring-system.prompt';
import {
  PropertyScoringFilterDto,
  PropertyScoringPropertyDto,
  ScoringResultDto,
} from './dto/property-scoring.dto';
import { OpenAiService } from '../openai/openai.service';

@Injectable()
export class PropertyScoringService {
  constructor(private readonly openAiService: OpenAiService) {}

  async scoreProperty(
    filter: PropertyScoringFilterDto,
    property: PropertyScoringPropertyDto,
  ): Promise<ScoringResultDto> {
    console.log('[SCORING] Start scoreProperty');
    console.log('[SCORING] Filter:', JSON.stringify(filter));
    console.log('[SCORING] Property:', JSON.stringify(property));
    const userPrompt = this.buildUserPrompt(filter, property);
    let response;
    try {
      response = await this.openAiService.chatCompletion(
        SYSTEM_PROMPT,
        userPrompt,
      );
      console.log('[SCORING] OpenAI response:', response);
    } catch (err) {
      console.error('[SCORING] OpenAI error:', err?.error);
      throw err;
    }
    try {
      const parsed = this.parseScoringResult(response);
      console.log('[SCORING] Parsed scoring result:', parsed);
      return parsed;
    } catch (err) {
      console.error('[SCORING] Parse error:', err);
      throw err;
    }
  }

  private buildUserPrompt(
    filter: PropertyScoringFilterDto,
    property: PropertyScoringPropertyDto,
  ): string {
    // Compose a prompt for the LLM using filter and property data
    return `Evaluate the following property against the buyer's preferences (filter).\n\n### Buyer Filter\n${JSON.stringify(
      filter,
      null,
      2,
    )}\n\n### Property\n${JSON.stringify(property, null, 2)}\n`;
  }

  private parseScoringResult(response: string): ScoringResultDto {
    // Parse the JSON result from the LLM response
    let jsonString = '';
    if (typeof response === 'string') {
      const match = response.match(/\{[\s\S]*\}/);
      if (!match) {
        throw new BadRequestException('No JSON found in LLM response');
      }
      jsonString = match[0];
      return JSON.parse(jsonString) as ScoringResultDto;
    } else if (typeof response === 'object' && response !== null) {
      return response as ScoringResultDto;
    } else {
      throw new BadRequestException('Unexpected LLM response format');
    }
  }
}
