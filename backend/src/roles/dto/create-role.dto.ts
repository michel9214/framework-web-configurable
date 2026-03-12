import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsArray, ValidateNested, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  displayName: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateRoleDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  displayName?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class PagePermissionDto {
  @IsInt()
  pageId: number;

  @IsBoolean()
  canAccess: boolean;
}

export class ResourcePermissionDto {
  @IsInt()
  resourceId: number;

  @IsBoolean()
  isAllowed: boolean;
}

export class AssignPermissionsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PagePermissionDto)
  pages: PagePermissionDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResourcePermissionDto)
  resources: ResourcePermissionDto[];
}
