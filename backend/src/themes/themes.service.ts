import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateThemeDto, UpdateThemeDto } from './dto/create-theme.dto';

@Injectable()
export class ThemesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.theme.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async findAllAdmin() {
    return this.prisma.theme.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number) {
    const theme = await this.prisma.theme.findUnique({ where: { id } });
    if (!theme) throw new NotFoundException('Tema no encontrado');
    return theme;
  }

  async create(dto: CreateThemeDto) {
    if (dto.isDefault) {
      await this.prisma.theme.updateMany({ data: { isDefault: false } });
    }
    try {
      return await this.prisma.theme.create({ data: dto });
    } catch (e: any) {
      if (e.code === 'P2002') throw new ConflictException('El nombre del tema ya existe');
      throw e;
    }
  }

  async update(id: number, dto: UpdateThemeDto) {
    await this.findOne(id);
    if (dto.isDefault) {
      await this.prisma.theme.updateMany({ data: { isDefault: false } });
    }
    try {
      return await this.prisma.theme.update({ where: { id }, data: dto });
    } catch (e: any) {
      if (e.code === 'P2002') throw new ConflictException('El nombre del tema ya existe');
      throw e;
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.theme.update({ where: { id }, data: { isActive: false } });
    return { message: 'Tema desactivado exitosamente' };
  }
}
