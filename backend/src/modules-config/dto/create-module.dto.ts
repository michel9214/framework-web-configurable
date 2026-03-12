import { IsString, IsNotEmpty, IsOptional, IsInt, IsBoolean } from 'class-validator';

export class CreateModuleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  displayName: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsInt()
  @IsOptional()
  order?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateModuleDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  displayName?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsInt()
  @IsOptional()
  order?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
