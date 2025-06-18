import { IsString, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePartnerDto {
  @ApiPropertyOptional({
    description: 'Name of the partner company or individual',
    example: 'ABC Home Inspections'
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Contact phone number',
    example: '555-123-4567'
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Date when the partner was recorded',
    example: '2023-01-15T00:00:00Z'
  })
  @IsOptional()
  @IsDateString()
  date_record?: string;

  @ApiPropertyOptional({
    description: 'Geographic location of the partner',
    example: 'Miami, FL'
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    description: 'Business category of the partner',
    example: 'Home Inspection'
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Physical address of the partner',
    example: '123 Main St, Miami, FL 33101'
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    description: 'Contact email address',
    example: 'contact@abcinspections.com'
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({
    description: 'Website URL',
    example: 'https://www.abcinspections.com'
  })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiPropertyOptional({
    description: 'Comma-separated list of tags',
    example: 'inspection,certified,residential'
  })
  @IsOptional()
  @IsString()
  tags?: string;

  @ApiPropertyOptional({
    description: 'URL or path to partner logo or image',
    example: 'https://storage.example.com/partners/abc-logo.png'
  })
  @IsOptional()
  @IsString()
  image?: string;
}
