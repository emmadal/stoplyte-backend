import {
  IsString,
  IsBoolean,
  IsArray,
  IsObject,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SaveSearchDTO {
  @ApiProperty({
    description: 'Name of the saved search',
    example: 'Dream Home in Downtown'
  })
  @IsString()
  readonly name: string;

  @ApiProperty({
    description: 'Required features for the property',
    example: '3 bedrooms, 2 bathrooms, garage'
  })
  @IsString()
  readonly needs: string;

  @ApiProperty({
    description: 'Desired but not required features',
    example: 'Pool, finished basement, home office'
  })
  @IsString()
  readonly desires: string;

  @ApiProperty({
    description: 'Whether the buyer is working with an agent',
    example: true
  })
  @IsBoolean()
  readonly workingWithAgent: boolean;

  @ApiProperty({
    description: 'Whether the buyer has a pre-approval letter',
    example: true
  })
  @IsBoolean()
  readonly hasPreApprovalLetter: boolean;

  @ApiProperty({
    description: 'Whether to receive notifications for matching properties',
    example: true
  })
  @IsBoolean()
  readonly allowNotifications: boolean;

  @ApiProperty({
    description: 'Whether this search is visible to sellers',
    example: true
  })
  @IsBoolean()
  readonly visibleToSellers: boolean;

  @ApiProperty({
    description: 'Target markets/locations for the search',
    type: 'array',
    example: ['San Francisco', 'Oakland']
  })
  @IsArray()
  readonly markets: any[];

  @ApiProperty({
    description: 'Search criteria object',
    example: {
      priceRange: { min: 300000, max: 800000 },
      bedrooms: { min: 3 },
      bathrooms: { min: 2 },
      squareFeet: { min: 1500 }
    }
  })
  @IsObject()
  readonly search: any;
}

export class UpdateSearchDTO {
  @ApiPropertyOptional({
    description: 'Name of the saved search',
    example: 'Dream Home in Downtown'
  })
  @IsString()
  @IsOptional()
  readonly name: string;

  @ApiPropertyOptional({
    description: 'Required features for the property',
    example: '3 bedrooms, 2 bathrooms, garage'
  })
  @IsString()
  @IsOptional()
  readonly needs: string;

  @ApiPropertyOptional({
    description: 'Desired but not required features',
    example: 'Pool, finished basement, home office'
  })
  @IsString()
  @IsOptional()
  readonly desires: string;

  @ApiPropertyOptional({
    description: 'Whether the buyer is working with an agent',
    example: true
  })
  @IsBoolean()
  @IsOptional()
  readonly workingWithAgent: boolean;

  @ApiPropertyOptional({
    description: 'Whether the buyer has a pre-approval letter',
    example: true
  })
  @IsBoolean()
  @IsOptional()
  readonly hasPreApprovalLetter: boolean;

  @ApiPropertyOptional({
    description: 'Whether to receive notifications for matching properties',
    example: true
  })
  @IsBoolean()
  @IsOptional()
  readonly allowNotifications: boolean;

  @ApiPropertyOptional({
    description: 'Whether this search is visible to sellers',
    example: true
  })
  @IsBoolean()
  @IsOptional()
  readonly visibleToSellers: boolean;

  @ApiPropertyOptional({
    description: 'Target markets/locations for the search',
    type: 'array',
    example: ['San Francisco', 'Oakland']
  })
  @IsArray()
  @IsOptional()
  readonly markets: any[];

  @ApiPropertyOptional({
    description: 'Search criteria object',
    example: {
      priceRange: { min: 300000, max: 800000 },
      bedrooms: { min: 3 },
      bathrooms: { min: 2 },
      squareFeet: { min: 1500 }
    }
  })
  @IsObject()
  @IsOptional()
  readonly search: any;
}
