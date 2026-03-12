import { Controller, Get, Request } from '@nestjs/common';
import { PermissionService } from '../permissions/permission.service';

@Controller('menu')
export class MenuController {
  constructor(private permissionService: PermissionService) {}

  @Get()
  async getMenu(@Request() req: any) {
    const menu = await this.permissionService.getMenuForUser(req.user.id);
    return { data: menu, message: 'Menú obtenido exitosamente' };
  }
}
