import { Controller, Get, Param, Request } from '@nestjs/common';
import { PermissionService } from './permission.service';

@Controller('permissions')
export class PermissionController {
  constructor(private permissionService: PermissionService) {}

  @Get('page/:pageCode')
  async getPageResources(
    @Request() req: any,
    @Param('pageCode') pageCode: string,
  ) {
    const resources = await this.permissionService.getPageResources(
      req.user.roleId,
      pageCode,
    );
    return { data: resources, message: 'Recursos de página obtenidos' };
  }
}
