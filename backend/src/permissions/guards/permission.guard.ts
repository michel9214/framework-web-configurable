import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  PERMISSION_KEY,
  PermissionMeta,
} from '../decorators/requires-permission.decorator';
import { PermissionService } from '../permission.service';
import { IS_PUBLIC_KEY } from '../../auth/decorators/public.decorator';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionService: PermissionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const permission = this.reflector.getAllAndOverride<PermissionMeta>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!permission) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) return false;

    if (user.isSystem) return true;

    const canAccess = await this.permissionService.canAccessPage(
      user.roleId,
      permission.pageCode,
    );

    if (!canAccess) {
      throw new ForbiddenException('No tienes acceso a esta página');
    }

    if (permission.resourceCode) {
      const canUse = await this.permissionService.canUseResource(
        user.roleId,
        permission.pageCode,
        permission.resourceCode,
      );

      if (!canUse) {
        throw new ForbiddenException(
          'No tienes permiso para esta acción',
        );
      }
    }

    return true;
  }
}
