import {
  IsString,
  IsBoolean,
  IsArray,
  IsObject,
  IsOptional,
} from 'class-validator';

export class SaveSearchDTO {
  @IsString()
  readonly name: string;

  @IsString()
  readonly needs: string;

  @IsString()
  readonly desires: string;

  @IsBoolean()
  readonly workingWithAgent: boolean;

  @IsBoolean()
  readonly hasPreApprovalLetter: boolean;

  @IsBoolean()
  readonly allowNotifications: boolean;

  @IsBoolean()
  readonly visibleToSellers: boolean;

  @IsArray()
  readonly markets: any[];

  @IsObject()
  readonly search: any;
}

export class UpdateSearchDTO {
  @IsString()
  @IsOptional()
  readonly name: string;

  @IsString()
  @IsOptional()
  readonly needs: string;

  @IsString()
  @IsOptional()
  readonly desires: string;

  @IsBoolean()
  @IsOptional()
  readonly workingWithAgent: boolean;

  @IsBoolean()
  @IsOptional()
  readonly hasPreApprovalLetter: boolean;

  @IsBoolean()
  @IsOptional()
  readonly allowNotifications: boolean;

  @IsBoolean()
  @IsOptional()
  readonly visibleToSellers: boolean;

  @IsArray()
  @IsOptional()
  readonly markets: any[];

  @IsObject()
  @IsOptional()
  readonly search: any;
}
