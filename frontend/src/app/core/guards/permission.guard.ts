import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PermissionService } from '../services/permission.service';
import { MenuService } from '../services/menu.service';

export const permissionGuard: CanActivateFn = async (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const permissionService = inject(PermissionService);
  const menuService = inject(MenuService);
  const router = inject(Router);

  const pageCode = route.data?.['pageCode'];
  if (!pageCode) return true;

  const user = authService.currentUser();
  if (!user) return router.createUrlTree(['/login']);

  // System roles bypass
  if (user.role.isSystem) {
    await permissionService.loadPagePermissions(pageCode);
    return true;
  }

  // Check if page is in the user's menu (recursive search)
  const menu = menuService.menuItems();
  const findInPages = (pages: any[]): boolean => {
    for (const page of pages) {
      if (page.name === pageCode) return true;
      if (page.children?.length && findInPages(page.children)) return true;
    }
    return false;
  };
  let hasAccess = false;
  for (const mod of menu) {
    if (findInPages(mod.pages)) { hasAccess = true; break; }
  }

  if (!hasAccess) {
    return router.createUrlTree(['/access-denied']);
  }

  await permissionService.loadPagePermissions(pageCode);
  return true;
};
