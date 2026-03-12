import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { permissionGuard } from './core/guards/permission.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./auth/login.component').then(m => m.LoginComponent),
  },
  {
    path: '',
    loadComponent: () => import('./layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
        data: { pageCode: 'dashboard' },
        canActivate: [permissionGuard],
      },
      {
        path: 'admin/users',
        loadComponent: () => import('./admin/users/users.component').then(m => m.UsersComponent),
        data: { pageCode: 'users' },
        canActivate: [permissionGuard],
      },
      {
        path: 'admin/users/:id',
        loadComponent: () => import('./admin/users/users.component').then(m => m.UsersComponent),
        data: { pageCode: 'user-detail' },
        canActivate: [permissionGuard],
      },
      {
        path: 'admin/roles',
        loadComponent: () => import('./admin/roles/roles.component').then(m => m.RolesComponent),
        data: { pageCode: 'roles' },
        canActivate: [permissionGuard],
      },
      {
        path: 'admin/roles/:id/permissions',
        loadComponent: () => import('./admin/roles/role-permissions.component').then(m => m.RolePermissionsComponent),
        data: { pageCode: 'roles' },
        canActivate: [permissionGuard],
      },
      {
        path: 'admin/pages-config',
        loadComponent: () => import('./admin/pages-config/pages-config.component').then(m => m.PagesConfigComponent),
        data: { pageCode: 'pages-config' },
        canActivate: [permissionGuard],
      },
      {
        path: 'settings/themes-config',
        loadComponent: () => import('./admin/themes-config/themes-config.component').then(m => m.ThemesConfigComponent),
        data: { pageCode: 'themes-config' },
        canActivate: [permissionGuard],
      },
      {
        path: 'comercial/pedidos',
        loadComponent: () => import('./comercial/pedidos/pedidos.component').then(m => m.PedidosComponent),
        data: { pageCode: 'pedidos' },
        canActivate: [permissionGuard],
      },
      {
        path: 'personal/personal',
        loadComponent: () => import('./personal/personal/personal.component').then(m => m.PersonalComponent),
        data: { pageCode: 'personal' },
        canActivate: [permissionGuard],
      },
      {
        path: 'access-denied',
        loadComponent: () => import('./pages/access-denied/access-denied.component').then(m => m.AccessDeniedComponent),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent),
  },
];
