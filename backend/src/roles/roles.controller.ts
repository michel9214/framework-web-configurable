import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto, UpdateRoleDto, AssignPermissionsDto } from './dto/create-role.dto';
import { RequiresPermission } from '../permissions/decorators/requires-permission.decorator';

@Controller('roles')
@RequiresPermission('roles')
export class RolesController {
  constructor(private service: RolesService) {}

  @Get()
  async findAll() {
    const data = await this.service.findAll();
    return { data, message: 'Roles obtenidos' };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.service.findOne(id);
    return { data, message: 'Rol obtenido' };
  }

  @Post()
  async create(@Body() dto: CreateRoleDto) {
    const data = await this.service.create(dto);
    return { data, message: 'Rol creado' };
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRoleDto) {
    const data = await this.service.update(id, dto);
    return { data, message: 'Rol actualizado' };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  @Post(':id/permissions')
  async assignPermissions(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignPermissionsDto,
  ) {
    const data = await this.service.assignPermissions(id, dto);
    return { data, message: 'Permisos asignados exitosamente' };
  }
}
