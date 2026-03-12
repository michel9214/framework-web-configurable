import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, UpdateThemeDto } from './dto/create-user.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { RequiresPermission } from '../permissions/decorators/requires-permission.decorator';

@Controller('users')
@RequiresPermission('users')
export class UsersController {
  constructor(private service: UsersService) {}

  @Get()
  async findAll(@Query() pagination: PaginationDto) {
    const result = await this.service.findAll(pagination);
    return { data: result, message: 'Usuarios obtenidos' };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.service.findOne(id);
    return { data, message: 'Usuario obtenido' };
  }

  @Post()
  async create(@Body() dto: CreateUserDto) {
    const data = await this.service.create(dto);
    return { data, message: 'Usuario creado' };
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
    const data = await this.service.update(id, dto);
    return { data, message: 'Usuario actualizado' };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  @Patch(':id/theme')
  async updateTheme(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateThemeDto,
  ) {
    const data = await this.service.updateTheme(id, dto.themeId);
    return { data, message: 'Tema actualizado' };
  }
}
