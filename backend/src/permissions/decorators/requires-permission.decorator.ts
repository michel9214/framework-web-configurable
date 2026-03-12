import { SetMetadata } from '@nestjs/common';

export const PERMISSION_KEY = 'requiredPermission';

export interface PermissionMeta {
  pageCode: string;
  resourceCode?: string;
}

export const RequiresPermission = (pageCode: string, resourceCode?: string) =>
  SetMetadata(PERMISSION_KEY, { pageCode, resourceCode } as PermissionMeta);
