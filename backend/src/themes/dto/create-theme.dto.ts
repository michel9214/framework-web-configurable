import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateThemeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  displayName: string;

  @IsString()
  @IsNotEmpty()
  cssClass: string;

  @IsString()
  @IsNotEmpty()
  primary: string;

  @IsString()
  @IsNotEmpty()
  secondary: string;

  @IsString()
  @IsNotEmpty()
  accent: string;

  @IsString()
  @IsNotEmpty()
  background: string;

  @IsString()
  @IsNotEmpty()
  surface: string;

  @IsString()
  @IsNotEmpty()
  text: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateThemeDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  displayName?: string;

  @IsString()
  @IsOptional()
  cssClass?: string;

  @IsString()
  @IsOptional()
  primary?: string;

  @IsString()
  @IsOptional()
  secondary?: string;

  @IsString()
  @IsOptional()
  accent?: string;

  @IsString()
  @IsOptional()
  background?: string;

  @IsString()
  @IsOptional()
  surface?: string;

  @IsString()
  @IsOptional()
  text?: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
