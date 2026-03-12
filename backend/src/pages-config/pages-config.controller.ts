import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { PagesConfigService } from './pages-config.service';
import { CreatePageDto, UpdatePageDto } from './dto/create-page.dto';
import { RequiresPermission } from '../permissions/decorators/requires-permission.decorator';

@Controller('pages-config')
@RequiresPermission('pages-config')
export class PagesConfigController {
  constructor(private service: PagesConfigService) {}

  @Get()
  async findAll(@Query('moduleId') moduleId?: string) {
    const data = await this.service.findAll(moduleId ? +moduleId : undefined);
    return { data, message: 'Páginas obtenidas' };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.service.findOne(id);
    return { data, message: 'Página obtenida' };
  }

  @Post()
  async create(@Body() dto: CreatePageDto) {
    const data = await this.service.create(dto);
    return { data, message: 'Página creada' };
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePageDto) {
    const data = await this.service.update(id, dto);
    return { data, message: 'Página actualizada' };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
