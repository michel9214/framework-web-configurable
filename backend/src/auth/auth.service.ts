import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
      include: {
        role: true,
        theme: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roleId: user.roleId,
      isSystem: user.role.isSystem,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = randomBytes(64).toString('hex');

    const refreshExpiration = this.configService.get<string>(
      'JWT_REFRESH_EXPIRATION',
      '7d',
    );
    const expiresAt = new Date();
    const days = parseInt(refreshExpiration) || 7;
    expiresAt.setDate(expiresAt.getDate() + days);

    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    const { password, ...userWithoutPassword } = user;

    return {
      data: {
        accessToken,
        refreshToken,
        user: userWithoutPassword,
      },
      message: 'Inicio de sesión exitoso',
    };
  }

  async refresh(refreshTokenValue: string) {
    if (!refreshTokenValue) {
      throw new BadRequestException('El token de refresco es requerido');
    }

    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: refreshTokenValue },
      include: {
        user: {
          include: { role: true },
        },
      },
    });

    if (
      !storedToken ||
      storedToken.isRevoked ||
      storedToken.expiresAt < new Date()
    ) {
      throw new UnauthorizedException('Token de refresco inválido o expirado');
    }

    if (!storedToken.user.isActive) {
      throw new UnauthorizedException('La cuenta de usuario está desactivada');
    }

    const payload: JwtPayload = {
      sub: storedToken.user.id,
      email: storedToken.user.email,
      roleId: storedToken.user.roleId,
      isSystem: storedToken.user.role.isSystem,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      data: { accessToken },
      message: 'Token renovado exitosamente',
    };
  }

  async logout(refreshTokenValue: string) {
    if (refreshTokenValue) {
      await this.prisma.refreshToken.updateMany({
        where: { token: refreshTokenValue },
        data: { isRevoked: true },
      });
    }

    return { data: null, message: 'Sesión cerrada exitosamente' };
  }

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
        theme: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const { password, ...userWithoutPassword } = user;

    return {
      data: userWithoutPassword,
      message: 'Perfil obtenido exitosamente',
    };
  }
}
