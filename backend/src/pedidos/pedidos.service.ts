import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePedidoDto, UpdatePedidoDto } from './dto/create-pedido.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class PedidosService {
  constructor(private prisma: PrismaService) {}

  async findAll(pagination: PaginationDto) {
    const { page = 1, limit = 10, search } = pagination;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { numero: { contains: search, mode: 'insensitive' } },
        { cliente: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.pedido.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { items: true },
      }),
      this.prisma.pedido.count({ where }),
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
    const pedido = await this.prisma.pedido.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!pedido) throw new NotFoundException('Pedido no encontrado');
    return pedido;
  }

  async create(dto: CreatePedidoDto) {
    const numero = await this.generateNumero();
    const items = dto.items.map(item => ({
      ...item,
      subtotal: item.cantidad * item.precioUnitario,
    }));
    const total = items.reduce((sum, item) => sum + item.subtotal, 0);

    return this.prisma.pedido.create({
      data: {
        numero,
        cliente: dto.cliente,
        observaciones: dto.observaciones,
        total,
        items: { create: items },
      },
      include: { items: true },
    });
  }

  async update(id: number, dto: UpdatePedidoDto) {
    await this.findOne(id);
    return this.prisma.pedido.update({
      where: { id },
      data: dto,
      include: { items: true },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.pedido.delete({ where: { id } });
    return { message: 'Pedido eliminado exitosamente' };
  }

  private async generateNumero(): Promise<string> {
    const year = new Date().getFullYear();
    const last = await this.prisma.pedido.findFirst({
      where: { numero: { startsWith: `PED-${year}` } },
      orderBy: { numero: 'desc' },
    });
    const seq = last ? parseInt(last.numero.split('-')[2]) + 1 : 1;
    return `PED-${year}-${seq.toString().padStart(5, '0')}`;
  }
}
