import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto, UpdateRoleDto, AssignPermissionsDto } from './dto/create-role.dto';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.role.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { users: true } } },
    });
  }

  async findOne(id: number) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        rolePagePermissions: {
          include: { page: { select: { id: true, name: true, displayName: true, moduleId: true } } },
        },
        roleResourcePermissions: {
          include: { resource: { select: { id: true, code: true, displayName: true, pageId: true } } },
        },
        _count: { select: { users: true } },
      },
    });
    if (!role) throw new NotFoundException('Rol no encontrado');
    return role;
  }

  async create(dto: CreateRoleDto) {
    try {
      return await this.prisma.role.create({ data: dto });
    } catch (e: any) {
      if (e.code === 'P2002') throw new ConflictException('El nombre del rol ya existe');
      throw e;
    }
  }

  async update(id: number, dto: UpdateRoleDto) {
    const role = await this.findOne(id);
    if (role.isSystem) throw new BadRequestException('No se pueden modificar roles del sistema');
    try {
      return await this.prisma.role.update({ where: { id }, data: dto });
    } catch (e: any) {
      if (e.code === 'P2002') throw new ConflictException('El nombre del rol ya existe');
      throw e;
    }
  }

  async remove(id: number) {
    const role = await this.findOne(id);
    if (role.isSystem) throw new BadRequestException('No se pueden eliminar roles del sistema');
    await this.prisma.role.update({ where: { id }, data: { isActive: false } });
    return { message: 'Rol desactivado exitosamente' };
  }

  async assignPermissions(id: number, dto: AssignPermissionsDto) {
    await this.findOne(id);

    await this.prisma.$transaction(async (tx) => {
      // Upsert page permissions
      for (const pp of dto.pages) {
        await tx.rolePagePermission.upsert({
          where: { roleId_pageId: { roleId: id, pageId: pp.pageId } },
          create: { roleId: id, pageId: pp.pageId, canAccess: pp.canAccess },
          update: { canAccess: pp.canAccess },
        });
      }

      // Upsert resource permissions
      for (const rp of dto.resources) {
        await tx.roleResourcePermission.upsert({
          where: { roleId_resourceId: { roleId: id, resourceId: rp.resourceId } },
          create: { roleId: id, resourceId: rp.resourceId, isAllowed: rp.isAllowed },
          update: { isAllowed: rp.isAllowed },
        });
      }
    });

    return this.findOne(id);
  }
}
