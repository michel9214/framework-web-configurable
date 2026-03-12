import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ResourcesConfigService } from './resources-config.service';
import { CreateResourceDto, UpdateResourceDto } from './dto/create-resource.dto';
import { RequiresPermission } from '../permissions/decorators/requires-permission.decorator';

@Controller('resources-config')
@RequiresPermission('pages-config')
export class ResourcesConfigController {
  constructor(private service: ResourcesConfigService) {}

  @Get()
  async findAll(@Query('pageId') pageId?: string) {
    const data = await this.service.findAll(pageId ? +pageId : undefined);
    return { data, message: 'Recursos obtenidos' };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.service.findOne(id);
    return { data, message: 'Recurso obtenido' };
  }

  @Post()
  async create(@Body() dto: CreateResourceDto) {
    const data = await this.service.create(dto);
    return { data, message: 'Recurso creado' };
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateResourceDto) {
    const data = await this.service.update(id, dto);
    return { data, message: 'Recurso actualizado' };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
