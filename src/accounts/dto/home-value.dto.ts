import {
  IsString,
  IsEmail,
  IsPhoneNumber,
  IsBoolean,
  IsNotEmpty,
  MinLength,
} from 'class-validator';

export class CreatePropertySubmissionDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  firstName: string;

  @IsString()
  lastName?: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsPhoneNumber()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  propertyAddress: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  condition: string;

  @IsBoolean()
  optIn: boolean;
}
