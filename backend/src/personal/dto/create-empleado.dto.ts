import { IsString, IsNotEmpty, IsOptional, IsNumber, IsDateString, Min } from 'class-validator';

export class CreateEmpleadoDto {
  @IsString()
  @IsNotEmpty()
  dni: string;

  @IsString()
  @IsNotEmpty()
  nombres: string;

  @IsString()
  @IsNotEmpty()
  apellidos: string;

  @IsString()
  @IsNotEmpty()
  cargo: string;

  @IsString()
  @IsNotEmpty()
  departamento: string;

  @IsString()
  @IsOptional()
  telefono?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsDateString()
  fechaIngreso: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  salario?: number;

  @IsString()
  @IsOptional()
  observaciones?: string;
}

export class UpdateEmpleadoDto {
  @IsString()
  @IsOptional()
  dni?: string;

  @IsString()
  @IsOptional()
  nombres?: string;

  @IsString()
  @IsOptional()
  apellidos?: string;

  @IsString()
  @IsOptional()
  cargo?: string;

  @IsString()
  @IsOptional()
  departamento?: string;

  @IsString()
  @IsOptional()
  telefono?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsDateString()
  @IsOptional()
  fechaIngreso?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  salario?: number;

  @IsString()
  @IsOptional()
  estado?: string;

  @IsString()
  @IsOptional()
  observaciones?: string;
}
