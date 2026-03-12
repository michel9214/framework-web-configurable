import { IsString, IsNotEmpty, IsOptional, IsInt, IsBoolean, IsEmail, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsInt()
  roleId: number;

  @IsInt()
  @IsOptional()
  themeId?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @MinLength(6)
  password?: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsInt()
  @IsOptional()
  roleId?: number;

  @IsInt()
  @IsOptional()
  themeId?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateThemeDto {
  @IsInt()
  themeId: number;
}
