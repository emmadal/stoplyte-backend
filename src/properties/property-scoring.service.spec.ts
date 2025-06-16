import { Test, TestingModule } from '@nestjs/testing';
import { PropertyScoringService } from './property-scoring.service';
import { SYSTEM_PROMPT } from './property-scoring-system.prompt';
import {
  PropertyScoringFilterDto,
  PropertyScoringPropertyDto,
  ScoringResultDto,
} from './dto/property-scoring.dto';
import { OpenAiService } from '../openai/openai.service';

const mockOpenAiService = {
  chatCompletion: jest.fn(),
};

describe('PropertyScoringService', () => {
  let service: PropertyScoringService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertyScoringService,
        { provide: OpenAiService, useValue: mockOpenAiService },
      ],
    }).compile();

    service = module.get<PropertyScoringService>(PropertyScoringService);
    mockOpenAiService.chatCompletion.mockReset();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should parse valid scoring result from OpenAI', async () => {
    const filter: PropertyScoringFilterDto = { budget: 500000 };
    const property: PropertyScoringPropertyDto = { price: 480000 };
    const aiResponse = `{
      "total_score": 95,
      "breakdown": {
        "price": 20,
        "location": 20,
        "specs": 20,
        "lifestyle": 20,
        "timing": 10,
        "sentiment": 5
      },
      "tier": "Top Match",
      "explanation": "Great fit for the buyer."
    }`;
    mockOpenAiService.chatCompletion.mockResolvedValue(aiResponse);

    const result = await service.scoreProperty(filter, property);
    expect(result).toEqual({
      total_score: 95,
      breakdown: {
        price: 20,
        location: 20,
        specs: 20,
        lifestyle: 20,
        timing: 10,
        sentiment: 5,
      },
      tier: 'Top Match',
      explanation: 'Great fit for the buyer.',
    });
    expect(mockOpenAiService.chatCompletion).toHaveBeenCalledWith(
      SYSTEM_PROMPT,
      expect.any(String),
    );
  });

  it('should throw if OpenAI response does not contain JSON', async () => {
    mockOpenAiService.chatCompletion.mockResolvedValue('No JSON here');
    await expect(service.scoreProperty({}, {})).rejects.toThrow(
      'No JSON found in LLM response',
    );
  });

  it('should handle already parsed object', async () => {
    const parsed: ScoringResultDto = {
      total_score: 80,
      breakdown: {
        price: 15,
        location: 15,
        specs: 15,
        lifestyle: 15,
        timing: 10,
        sentiment: 10,
      },
      tier: 'Great Fit',
      explanation: 'Good match.',
    };
    mockOpenAiService.chatCompletion.mockResolvedValue(parsed);
    const result = await service.scoreProperty({}, {});
    expect(result).toEqual(parsed);
  });
});
