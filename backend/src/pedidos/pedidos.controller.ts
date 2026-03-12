import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { CreatePedidoDto, UpdatePedidoDto } from './dto/create-pedido.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { RequiresPermission } from '../permissions/decorators/requires-permission.decorator';

@Controller('pedidos')
@RequiresPermission('pedidos')
export class PedidosController {
  constructor(private service: PedidosService) {}

  @Get()
  async findAll(@Query() pagination: PaginationDto) {
    const result = await this.service.findAll(pagination);
    return { data: result, message: 'Pedidos obtenidos' };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.service.findOne(id);
    return { data, message: 'Pedido obtenido' };
  }

  @Post()
  @RequiresPermission('pedidos', 'create')
  async create(@Body() dto: CreatePedidoDto) {
    const data = await this.service.create(dto);
    return { data, message: 'Pedido creado' };
  }

  @Put(':id')
  @RequiresPermission('pedidos', 'edit')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePedidoDto) {
    const data = await this.service.update(id, dto);
    return { data, message: 'Pedido actualizado' };
  }

  @Delete(':id')
  @RequiresPermission('pedidos', 'delete')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
