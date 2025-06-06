import {
  IsString,
  IsOptional,
  IsUrl,
  IsNumber,
  IsBoolean,
  IsArray,
} from 'class-validator';

export class CreateAccountDTO {
  @IsString()
  readonly uid: string;

  @IsString()
  readonly displayName: string;

  @IsString()
  @IsOptional()
  readonly email: string;

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
