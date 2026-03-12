import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ModulesConfigService } from './modules-config.service';
import { CreateModuleDto, UpdateModuleDto } from './dto/create-module.dto';
import { RequiresPermission } from '../permissions/decorators/requires-permission.decorator';

@Controller('modules-config')
@RequiresPermission('modules-config')
export class ModulesConfigController {
  constructor(private service: ModulesConfigService) {}

  @Get()
  async findAll() {
    const data = await this.service.findAll();
    return { data, message: 'Módulos obtenidos' };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.service.findOne(id);
    return { data, message: 'Módulo obtenido' };
  }

  @Post()
  async create(@Body() dto: CreateModuleDto) {
    const data = await this.service.create(dto);
    return { data, message: 'Módulo creado' };
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateModuleDto) {
    const data = await this.service.update(id, dto);
    return { data, message: 'Módulo actualizado' };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
