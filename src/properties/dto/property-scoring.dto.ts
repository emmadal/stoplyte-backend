import { ApiProperty } from '@nestjs/swagger';

export class PropertyScoringFilterDto {
  [key: string]: any;
}

export class PropertyScoringPropertyDto {
  @ApiProperty({
    description: 'Unique identifier of the property',
    example: 'prop-123'
  })
  id: string;
  [key: string]: any;
}

export class ScoringResultDto {
  @ApiProperty({
    description: 'Total score for the property',
    example: 85
  })
  total_score: number;
  @ApiProperty({
    description: 'Detailed score breakdown by category',
    example: {
      price: 70,
      location: 90,
      specs: 85,
      lifestyle: 80,
      timing: 95,
      sentiment: 90
    }
  })
  breakdown: {
    price: number;
    location: number;
    specs: number;
    lifestyle: number;
    timing: number;
    sentiment: number;
  };
  @ApiProperty({
    description: 'Quality tier classification of the property',
    example: 'premium',
    enum: ['budget', 'standard', 'premium', 'luxury']
  })
  tier: string;
  @ApiProperty({
    description: 'Detailed explanation of the scoring result',
    example: 'This property has excellent location value and meets most of your requirements.'
  })
  explanation: string;
}
