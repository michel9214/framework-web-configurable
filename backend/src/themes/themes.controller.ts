import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ThemesService } from './themes.service';
import { CreateThemeDto, UpdateThemeDto } from './dto/create-theme.dto';
import { RequiresPermission } from '../permissions/decorators/requires-permission.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('themes')
export class ThemesController {
  constructor(private service: ThemesService) {}

  @Public()
  @Get()
  async findAll() {
    const data = await this.service.findAll();
    return { data, message: 'Temas obtenidos' };
  }

  @Get('admin')
  @RequiresPermission('themes-config')
  async findAllAdmin() {
    const data = await this.service.findAllAdmin();
    return { data, message: 'Todos los temas obtenidos' };
  }

  @Get(':id')
  @RequiresPermission('themes-config')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.service.findOne(id);
    return { data, message: 'Tema obtenido' };
  }

  @Post()
  @RequiresPermission('themes-config')
  async create(@Body() dto: CreateThemeDto) {
    const data = await this.service.create(dto);
    return { data, message: 'Tema creado' };
  }

  @Put(':id')
  @RequiresPermission('themes-config')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateThemeDto) {
    const data = await this.service.update(id, dto);
    return { data, message: 'Tema actualizado' };
  }

  @Delete(':id')
  @RequiresPermission('themes-config')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
