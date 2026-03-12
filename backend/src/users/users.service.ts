import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto/create-user.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(pagination: PaginationDto) {
    const { page = 1, limit = 10, search } = pagination;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isActive: true,
          lastLogin: true,
          createdAt: true,
          role: { select: { id: true, name: true, displayName: true } },
          theme: { select: { id: true, name: true, displayName: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        role: true,
        theme: true,
      },
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async create(dto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    try {
      const user = await this.prisma.user.create({
        data: { ...dto, password: hashedPassword },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isActive: true,
          role: { select: { id: true, name: true, displayName: true } },
        },
      });
      return user;
    } catch (e: any) {
      if (e.code === 'P2002') throw new ConflictException('El correo electrónico ya existe');
      throw e;
    }
  }

  async update(id: number, dto: UpdateUserDto) {
    await this.findOne(id);
    const data: any = { ...dto };
    if (dto.password) {
      data.password = await bcrypt.hash(dto.password, 10);
    }
    try {
      return await this.prisma.user.update({
        where: { id },
        data,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isActive: true,
          role: { select: { id: true, name: true, displayName: true } },
        },
      });
    } catch (e: any) {
      if (e.code === 'P2002') throw new ConflictException('El correo electrónico ya existe');
      throw e;
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.user.update({ where: { id }, data: { isActive: false } });
    return { message: 'Usuario desactivado exitosamente' };
  }

  async updateTheme(id: number, themeId: number) {
    await this.findOne(id);
    return this.prisma.user.update({
      where: { id },
      data: { themeId },
      select: {
        id: true,
        theme: true,
      },
    });
  }
}
