import { IsString, IsNotEmpty, IsOptional, IsInt, IsBoolean, IsEnum } from 'class-validator';
import { ResourceType } from '@prisma/client';

export class CreateResourceDto {
  @IsInt()
  pageId: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  displayName: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsEnum(ResourceType)
  @IsOptional()
  type?: ResourceType;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateResourceDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  displayName?: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsEnum(ResourceType)
  @IsOptional()
  type?: ResourceType;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
