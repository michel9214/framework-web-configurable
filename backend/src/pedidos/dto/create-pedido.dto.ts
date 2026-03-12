import { IsString, IsNotEmpty, IsOptional, IsNumber, IsInt, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PedidoItemDto {
  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsInt()
  @Min(1)
  cantidad: number;

  @IsNumber()
  @Min(0)
  precioUnitario: number;
}

export class CreatePedidoDto {
  @IsString()
  @IsNotEmpty()
  cliente: string;

  @IsString()
  @IsOptional()
  observaciones?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PedidoItemDto)
  items: PedidoItemDto[];
}

export class UpdatePedidoDto {
  @IsString()
  @IsOptional()
  cliente?: string;

  @IsString()
  @IsOptional()
  observaciones?: string;

  @IsString()
  @IsOptional()
  estado?: string;
}
