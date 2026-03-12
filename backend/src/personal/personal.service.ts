import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmpleadoDto, UpdateEmpleadoDto } from './dto/create-empleado.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class PersonalService {
  constructor(private prisma: PrismaService) {}

  async findAll(pagination: PaginationDto) {
    const { page = 1, limit = 10, search } = pagination;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { nombres: { contains: search, mode: 'insensitive' } },
        { apellidos: { contains: search, mode: 'insensitive' } },
        { dni: { contains: search, mode: 'insensitive' } },
        { cargo: { contains: search, mode: 'insensitive' } },
        { departamento: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.empleado.findMany({
        where,
        skip,
        take: limit,
        orderBy: { apellidos: 'asc' },
      }),
      this.prisma.empleado.count({ where }),
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
    const empleado = await this.prisma.empleado.findUnique({ where: { id } });
    if (!empleado) throw new NotFoundException('Empleado no encontrado');
    return empleado;
  }

  async create(dto: CreateEmpleadoDto) {
    const codigo = await this.generateCodigo();
    return this.prisma.empleado.create({
      data: {
        codigo,
        dni: dto.dni,
        nombres: dto.nombres,
        apellidos: dto.apellidos,
        cargo: dto.cargo,
        departamento: dto.departamento,
        telefono: dto.telefono,
        email: dto.email,
        fechaIngreso: new Date(dto.fechaIngreso),
        salario: dto.salario || 0,
        observaciones: dto.observaciones,
      },
    });
  }

  async update(id: number, dto: UpdateEmpleadoDto) {
    await this.findOne(id);
    const data: any = { ...dto };
    if (dto.fechaIngreso) {
      data.fechaIngreso = new Date(dto.fechaIngreso);
    }
    return this.prisma.empleado.update({ where: { id }, data });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.empleado.delete({ where: { id } });
    return { message: 'Empleado eliminado exitosamente' };
  }

  private async generateCodigo(): Promise<string> {
    const year = new Date().getFullYear();
    const last = await this.prisma.empleado.findFirst({
      where: { codigo: { startsWith: `EMP-${year}` } },
      orderBy: { codigo: 'desc' },
    });
    const seq = last ? parseInt(last.codigo.split('-')[2]) + 1 : 1;
    return `EMP-${year}-${seq.toString().padStart(5, '0')}`;
  }
}
