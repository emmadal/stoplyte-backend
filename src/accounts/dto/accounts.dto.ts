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

export class CreateAccountDTO {
  @IsString()
  @IsOptional()
  readonly uid: string;

  @IsString()
  @IsNotEmpty()
  readonly displayName: string;

  @IsString()
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @IsString()
  @IsOptional()
  password: string;

  @IsString()
  @IsOptional()
  subscription: string;

  @IsUrl()
  @IsOptional()
  readonly image: string;
  

  @IsString()
  @IsOptional()
  pushNotificationToken: string;
}

export class UpdateAccountDTO {
  @IsString()
  @IsOptional()
  readonly displayName: string;

  @IsBoolean()
  @IsOptional()
  readonly workingWithAgent: boolean;

  @IsBoolean()
  @IsOptional()
  readonly hasPreApprovalLetter: boolean;

  @IsUrl()
  @IsOptional()
  readonly image: string;
}

export class ListPropertyDTO {
  @IsNumber()
  readonly askingPrice: number;

  @IsString()
  @IsOptional()
  readonly highlights: string;

  @IsString()
  @IsOptional()
  readonly saleConditions: string;

  @IsBoolean()
  readonly sellerDisclosureDocument: boolean;

  @IsBoolean()
  readonly copyTitleDocument: boolean;

  @IsArray()
  @IsOptional()
  readonly pictures: string[];

  @IsString()
  readonly status: string;
}

export class LoginAccountDTO {
  @IsString()
  @IsNotEmpty()
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  readonly password: string;
}
