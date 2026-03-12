import { IsString, IsNotEmpty, IsOptional, IsInt, IsBoolean } from 'class-validator';

export class CreatePageDto {
  @IsInt()
  moduleId: number;

  @IsInt()
  @IsOptional()
  parentPageId?: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  displayName: string;

  @IsString()
  @IsNotEmpty()
  route: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsInt()
  @IsOptional()
  order?: number;

  @IsBoolean()
  @IsOptional()
  visibleInMenu?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  createDefaultResources?: boolean;
}

export class UpdatePageDto {
  @IsInt()
  @IsOptional()
  moduleId?: number;

  @IsInt()
  @IsOptional()
  parentPageId?: number | null;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  displayName?: string;

  @IsString()
  @IsOptional()
  route?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsInt()
  @IsOptional()
  order?: number;

  @IsBoolean()
  @IsOptional()
  visibleInMenu?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
