import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateResourceDto, UpdateResourceDto } from './dto/create-resource.dto';

@Injectable()
export class ResourcesConfigService {
  constructor(private prisma: PrismaService) {}

  async findAll(pageId?: number) {
    const where: any = {};
    if (pageId) where.pageId = pageId;

    return this.prisma.resource.findMany({
      where,
      orderBy: { code: 'asc' },
      include: { page: { select: { name: true, displayName: true } } },
    });
  }

  async findOne(id: number) {
    const resource = await this.prisma.resource.findUnique({
      where: { id },
      include: { page: true },
    });
    if (!resource) throw new NotFoundException('Recurso no encontrado');
    return resource;
  }

  async create(dto: CreateResourceDto) {
    try {
      return await this.prisma.resource.create({ data: dto });
    } catch (e: any) {
      if (e.code === 'P2002') throw new ConflictException('El código del recurso ya existe para esta página');
      throw e;
    }
  }

  async update(id: number, dto: UpdateResourceDto) {
    await this.findOne(id);
    try {
      return await this.prisma.resource.update({ where: { id }, data: dto });
    } catch (e: any) {
      if (e.code === 'P2002') throw new ConflictException('El código del recurso ya existe para esta página');
      throw e;
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.resource.update({ where: { id }, data: { isActive: false } });
    return { message: 'Recurso desactivado exitosamente' };
  }
}
