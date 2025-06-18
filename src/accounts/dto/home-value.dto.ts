import {
  IsString,
  IsEmail,
  IsPhoneNumber,
  IsBoolean,
  IsNotEmpty,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePropertySubmissionDto {
  @ApiProperty({
    description: 'First name of the property owner',
    example: 'John',
    minLength: 2
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  firstName: string;

  @ApiPropertyOptional({
    description: 'Last name of the property owner',
    example: 'Doe'
  })
  @IsString()
  lastName?: string;

  @ApiProperty({
    description: 'Email address of the property owner',
    example: 'john.doe@example.com'
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Phone number of the property owner',
    example: '+12025550179'
  })
  @IsPhoneNumber()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({
    description: 'Full address of the property',
    example: '123 Main Street, Anytown, CA 90210',
    minLength: 5
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  propertyAddress: string;

  @ApiProperty({
    description: 'Description of the property condition',
    example: 'Recently renovated with new roof and HVAC system',
    minLength: 10
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  condition: string;

  @ApiProperty({
    description: 'Whether the user has opted in to marketing communications',
    example: true
  })
  @IsBoolean()
  optIn: boolean;
}
