import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateModuleDto, UpdateModuleDto } from './dto/create-module.dto';

@Injectable()
export class ModulesConfigService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.module.findMany({
      orderBy: { order: 'asc' },
      include: { _count: { select: { pages: true } } },
    });
  }

  async findOne(id: number) {
    const mod = await this.prisma.module.findUnique({
      where: { id },
      include: { pages: { orderBy: { order: 'asc' } } },
    });
    if (!mod) throw new NotFoundException('Módulo no encontrado');
    return mod;
  }

  async create(dto: CreateModuleDto) {
    try {
      return await this.prisma.module.create({ data: dto });
    } catch (e: any) {
      if (e.code === 'P2002') throw new ConflictException('El nombre del módulo ya existe');
      throw e;
    }
  }

  async update(id: number, dto: UpdateModuleDto) {
    await this.findOne(id);
    try {
      return await this.prisma.module.update({ where: { id }, data: dto });
    } catch (e: any) {
      if (e.code === 'P2002') throw new ConflictException('El nombre del módulo ya existe');
      throw e;
    }
  }

  async remove(id: number) {
    const mod = await this.findOne(id);
    const pageCount = await this.prisma.page.count({ where: { moduleId: id } });
    if (pageCount > 0) {
      throw new BadRequestException(`No se puede eliminar el módulo "${mod.name}" porque tiene ${pageCount} página(s) asignada(s). Elimina las páginas primero.`);
    }
    await this.prisma.module.delete({ where: { id } });
    return { message: 'Módulo eliminado exitosamente' };
  }
}
