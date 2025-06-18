import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  IsNumber,
  IsBoolean,
  IsArray,
  IsEmail,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAccountDTO {
  @ApiPropertyOptional({
    description: 'Unique identifier for the user',
    example: 'user123',
  })
  @IsString()
  @IsOptional()
  readonly uid: string;

  @ApiProperty({
    description: 'Display name of the user',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  readonly displayName: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'user@example.com',
  })
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @ApiPropertyOptional({
    description: 'User password (not required for social login)',
    example: 'StrongPassword123',
  })
  @IsString()
  @IsOptional()
  password: string;

  @ApiPropertyOptional({
    description: 'User subscription type',
    example: 'buyer',
    enum: ['buyer', 'seller'],
  })
  @IsString()
  @IsOptional()
  subscription: string;

  @IsUrl()
  @IsOptional()
  readonly image: string;
  

  @ApiPropertyOptional({
    description: 'Push notification token for mobile devices',
    example: 'exponentpushtoken:XXX',
  })
  @IsString()
  @IsOptional()
  pushNotificationToken: string;
}

export class UpdateAccountDTO {
  @ApiPropertyOptional({
    description: 'Updated display name',
    example: 'John Doe',
  })
  @IsString()
  @IsOptional()
  readonly displayName: string;

  @ApiPropertyOptional({
    description: 'Whether the user is working with a real estate agent',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  readonly workingWithAgent: boolean;

  @ApiPropertyOptional({
    description: 'Whether the user has a pre-approval letter',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  readonly hasPreApprovalLetter: boolean;

  @IsUrl()
  @IsOptional()
  readonly image: string;
}

export class ListPropertyDTO {
  @ApiProperty({
    description: 'Property asking price in USD',
    example: 450000,
  })
  @IsNumber()
  readonly askingPrice: number;

  @ApiPropertyOptional({
    description: 'Property highlights and special features',
    example: 'Newly renovated kitchen, hardwood floors throughout',
  })
  @IsString()
  @IsOptional()
  readonly highlights: string;

  @ApiPropertyOptional({
    description: 'Conditions for the sale',
    example: 'Contingent on home inspection',
  })
  @IsString()
  @IsOptional()
  readonly saleConditions: string;

  @ApiProperty({
    description: 'Whether the seller disclosure document is available',
    example: true,
  })
  @IsBoolean()
  readonly sellerDisclosureDocument: boolean;

  @ApiProperty({
    description: 'Whether a copy of the title document is available',
    example: true,
  })
  @IsBoolean()
  readonly copyTitleDocument: boolean;

  @ApiPropertyOptional({
    description: 'Array of property image URLs',
    type: [String],
    example: [
      'https://example.com/house1.jpg',
      'https://example.com/house2.jpg',
    ],
  })
  @IsArray()
  @IsOptional()
  readonly pictures: string[];

  @ApiProperty({
    description: 'Property listing status',
    example: 'active',
    enum: ['active', 'pending', 'sold', 'withdrawn'],
  })
  @IsString()
  readonly status: string;
}

export class LoginAccountDTO {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsString()
  @IsNotEmpty()
  readonly email: string;

  @ApiProperty({
    description: 'User password',
    example: 'YourPassword123',
  })
  @IsString()
  @IsNotEmpty()
  readonly password: string;
}
