import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { ResourceType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePageDto, UpdatePageDto } from './dto/create-page.dto';

@Injectable()
export class PagesConfigService {
  constructor(private prisma: PrismaService) {}

  async findAll(moduleId?: number) {
    const where: any = {};
    if (moduleId) where.moduleId = moduleId;

    return this.prisma.page.findMany({
      where,
      orderBy: { order: 'asc' },
      include: {
        module: { select: { name: true, displayName: true } },
        parentPage: { select: { name: true, displayName: true } },
        _count: { select: { resources: true, childPages: true } },
      },
    });
  }

  async findOne(id: number) {
    const page = await this.prisma.page.findUnique({
      where: { id },
      include: {
        module: true,
        parentPage: true,
        childPages: { orderBy: { order: 'asc' } },
        resources: { orderBy: { code: 'asc' } },
      },
    });
    if (!page) throw new NotFoundException('Página no encontrada');
    return page;
  }

  async create(dto: CreatePageDto) {
    const { createDefaultResources, ...pageData } = dto;
    try {
      const page = await this.prisma.page.create({ data: pageData });

      if (createDefaultResources) {
        const defaults = [
          { name: 'crear', displayName: 'Crear', code: 'create', type: ResourceType.BUTTON },
          { name: 'editar', displayName: 'Editar', code: 'edit', type: ResourceType.BUTTON },
          { name: 'eliminar', displayName: 'Eliminar', code: 'delete', type: ResourceType.BUTTON },
        ];
        await this.prisma.resource.createMany({
          data: defaults.map(r => ({ ...r, pageId: page.id })),
        });
      }

      return page;
    } catch (e: any) {
      if (e.code === 'P2002') throw new ConflictException('El nombre de la página ya existe');
      throw e;
    }
  }

  async update(id: number, dto: UpdatePageDto) {
    await this.findOne(id);
    try {
      return await this.prisma.page.update({ where: { id }, data: dto });
    } catch (e: any) {
      if (e.code === 'P2002') throw new ConflictException('El nombre de la página ya existe');
      throw e;
    }
  }

  async remove(id: number) {
    const page = await this.findOne(id);
    const childCount = await this.prisma.page.count({ where: { parentPageId: id } });
    if (childCount > 0) {
      throw new BadRequestException(
        `No se puede eliminar la página "${page.name}" porque tiene ${childCount} página(s) hija(s). Elimina las páginas hijas primero.`,
      );
    }
    await this.prisma.page.delete({ where: { id } });
    return { message: 'Página eliminada exitosamente' };
  }
}
