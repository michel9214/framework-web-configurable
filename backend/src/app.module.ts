import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { PermissionModule } from './permissions/permission.module';
import { MenuModule } from './menu/menu.module';
import { ModulesConfigModule } from './modules-config/modules-config.module';
import { PagesConfigModule } from './pages-config/pages-config.module';
import { ResourcesConfigModule } from './resources-config/resources-config.module';
import { RolesModule } from './roles/roles.module';
import { UsersModule } from './users/users.module';
import { ThemesModule } from './themes/themes.module';
import { PedidosModule } from './pedidos/pedidos.module';
import { PersonalModule } from './personal/personal.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { PermissionGuard } from './permissions/guards/permission.guard';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    PermissionModule,
    MenuModule,
    ModulesConfigModule,
    PagesConfigModule,
    ResourcesConfigModule,
    RolesModule,
    UsersModule,
    ThemesModule,
    PedidosModule,
    PersonalModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
  ],
})
export class AppModule {}
