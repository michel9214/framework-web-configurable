import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { PersonalService } from './personal.service';
import { CreateEmpleadoDto, UpdateEmpleadoDto } from './dto/create-empleado.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { RequiresPermission } from '../permissions/decorators/requires-permission.decorator';

@Controller('personal')
@RequiresPermission('personal')
export class PersonalController {
  constructor(private service: PersonalService) {}

  @Get()
  async findAll(@Query() pagination: PaginationDto) {
    const result = await this.service.findAll(pagination);
    return { data: result, message: 'Personal obtenido' };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.service.findOne(id);
    return { data, message: 'Empleado obtenido' };
  }

  @Post()
  @RequiresPermission('personal', 'create')
  async create(@Body() dto: CreateEmpleadoDto) {
    const data = await this.service.create(dto);
    return { data, message: 'Empleado creado' };
  }

  @Put(':id')
  @RequiresPermission('personal', 'edit')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEmpleadoDto) {
    const data = await this.service.update(id, dto);
    return { data, message: 'Empleado actualizado' };
  }

  @Delete(':id')
  @RequiresPermission('personal', 'delete')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
