import { PrismaClient, ResourceType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Sembrando base de datos...');

  // ── Temas ──
  const themes = await Promise.all([
    prisma.theme.upsert({
      where: { name: 'light' },
      update: {},
      create: {
        name: 'light',
        displayName: 'Claro',
        cssClass: 'theme-light',
        primary: '#3f51b5',
        secondary: '#ff4081',
        accent: '#ff9800',
        background: '#fafafa',
        surface: '#ffffff',
        text: '#212121',
        isDefault: true,
      },
    }),
    prisma.theme.upsert({
      where: { name: 'dark' },
      update: {},
      create: {
        name: 'dark',
        displayName: 'Oscuro',
        cssClass: 'theme-dark',
        primary: '#00bcd4',
        secondary: '#ff4081',
        accent: '#ffab40',
        background: '#121212',
        surface: '#1e1e1e',
        text: '#e0e0e0',
      },
    }),
    prisma.theme.upsert({
      where: { name: 'blue-corporate' },
      update: {},
      create: {
        name: 'blue-corporate',
        displayName: 'Azul Corporativo',
        cssClass: 'theme-blue-corporate',
        primary: '#1565c0',
        secondary: '#42a5f5',
        accent: '#ffc107',
        background: '#eceff1',
        surface: '#ffffff',
        text: '#263238',
      },
    }),
    prisma.theme.upsert({
      where: { name: 'green-nature' },
      update: {},
      create: {
        name: 'green-nature',
        displayName: 'Verde Natural',
        cssClass: 'theme-green-nature',
        primary: '#2e7d32',
        secondary: '#66bb6a',
        accent: '#ff8f00',
        background: '#f1f8e9',
        surface: '#ffffff',
        text: '#1b5e20',
      },
    }),
  ]);

  console.log(`Creados ${themes.length} temas`);

  // ── Módulos ──
  const dashboardModule = await prisma.module.upsert({
    where: { name: 'dashboard' },
    update: {},
    create: {
      name: 'dashboard',
      displayName: 'Panel Principal',
      description: 'Panel principal y resumen general',
      icon: 'dashboard',
      order: 1,
    },
  });

  const adminModule = await prisma.module.upsert({
    where: { name: 'administration' },
    update: {},
    create: {
      name: 'administration',
      displayName: 'Administración',
      description: 'Administración y configuración del sistema',
      icon: 'admin_panel_settings',
      order: 2,
    },
  });

  const settingsModule = await prisma.module.upsert({
    where: { name: 'settings' },
    update: {},
    create: {
      name: 'settings',
      displayName: 'Configuración',
      description: 'Configuración del sistema y temas',
      icon: 'settings',
      order: 3,
    },
  });

  console.log('Creados 3 módulos');

  // ── Páginas ──
  const pages: Record<string, any> = {};

  // Páginas del Panel Principal
  pages.dashboard = await prisma.page.upsert({
    where: { name: 'dashboard' },
    update: {},
    create: {
      name: 'dashboard',
      displayName: 'Panel Principal',
      route: '/dashboard',
      icon: 'dashboard',
      order: 1,
      moduleId: dashboardModule.id,
    },
  });

  // Páginas de Administración
  pages.users = await prisma.page.upsert({
    where: { name: 'users' },
    update: {},
    create: {
      name: 'users',
      displayName: 'Usuarios',
      route: '/admin/users',
      icon: 'people',
      order: 1,
      moduleId: adminModule.id,
    },
  });

  pages.userDetail = await prisma.page.upsert({
    where: { name: 'user-detail' },
    update: {},
    create: {
      name: 'user-detail',
      displayName: 'Detalle de Usuario',
      route: '/admin/users/:id',
      icon: 'person',
      order: 2,
      visibleInMenu: false,
      moduleId: adminModule.id,
      parentPageId: pages.users.id,
    },
  });

  pages.roles = await prisma.page.upsert({
    where: { name: 'roles' },
    update: {},
    create: {
      name: 'roles',
      displayName: 'Roles',
      route: '/admin/roles',
      icon: 'security',
      order: 3,
      moduleId: adminModule.id,
    },
  });

  pages.pagesConfig = await prisma.page.upsert({
    where: { name: 'pages-config' },
    update: {},
    create: {
      name: 'pages-config',
      displayName: 'Módulos y Páginas',
      route: '/admin/pages-config',
      icon: 'account_tree',
      order: 4,
      moduleId: adminModule.id,
    },
  });

  // Páginas de Configuración
  pages.themesConfig = await prisma.page.upsert({
    where: { name: 'themes-config' },
    update: {},
    create: {
      name: 'themes-config',
      displayName: 'Temas',
      route: '/settings/themes-config',
      icon: 'palette',
      order: 1,
      moduleId: settingsModule.id,
    },
  });

  console.log(`Creadas ${Object.keys(pages).length} páginas`);

  // ── Recursos ──
  const resourceDefs: { pageName: string; resources: { name: string; displayName: string; code: string; type: ResourceType }[] }[] = [
    {
      pageName: 'dashboard',
      resources: [
        { name: 'ver_estadisticas', displayName: 'Ver Estadísticas', code: 'view_stats', type: ResourceType.SECTION },
        { name: 'acceso_rapido', displayName: 'Acceso Rápido', code: 'quick_access', type: ResourceType.SECTION },
      ],
    },
    {
      pageName: 'users',
      resources: [
        { name: 'crear', displayName: 'Crear', code: 'create', type: ResourceType.BUTTON },
        { name: 'editar', displayName: 'Editar', code: 'edit', type: ResourceType.BUTTON },
        { name: 'eliminar', displayName: 'Eliminar', code: 'delete', type: ResourceType.BUTTON },
        { name: 'descargar_excel', displayName: 'Descargar Excel', code: 'download_excel', type: ResourceType.BUTTON },
        { name: 'ver_detalle', displayName: 'Ver Detalle', code: 'view_detail', type: ResourceType.BUTTON },
      ],
    },
    {
      pageName: 'user-detail',
      resources: [
        { name: 'editar', displayName: 'Editar', code: 'edit', type: ResourceType.BUTTON },
        { name: 'cambiar_rol', displayName: 'Cambiar Rol', code: 'change_role', type: ResourceType.BUTTON },
        { name: 'desactivar', displayName: 'Desactivar', code: 'deactivate', type: ResourceType.BUTTON },
      ],
    },
    {
      pageName: 'roles',
      resources: [
        { name: 'crear', displayName: 'Crear', code: 'create', type: ResourceType.BUTTON },
        { name: 'editar', displayName: 'Editar', code: 'edit', type: ResourceType.BUTTON },
        { name: 'eliminar', displayName: 'Eliminar', code: 'delete', type: ResourceType.BUTTON },
        { name: 'gestionar_permisos', displayName: 'Gestionar Permisos', code: 'manage_permissions', type: ResourceType.BUTTON },
      ],
    },
    {
      pageName: 'pages-config',
      resources: [
        { name: 'crear', displayName: 'Crear', code: 'create', type: ResourceType.BUTTON },
        { name: 'editar', displayName: 'Editar', code: 'edit', type: ResourceType.BUTTON },
        { name: 'eliminar', displayName: 'Eliminar', code: 'delete', type: ResourceType.BUTTON },
        { name: 'gestionar_recursos', displayName: 'Gestionar Recursos', code: 'manage_resources', type: ResourceType.BUTTON },
      ],
    },
    {
      pageName: 'themes-config',
      resources: [
        { name: 'crear', displayName: 'Crear', code: 'create', type: ResourceType.BUTTON },
        { name: 'editar', displayName: 'Editar', code: 'edit', type: ResourceType.BUTTON },
        { name: 'eliminar', displayName: 'Eliminar', code: 'delete', type: ResourceType.BUTTON },
        { name: 'previsualizar', displayName: 'Previsualizar', code: 'preview', type: ResourceType.BUTTON },
      ],
    },
  ];

  let resourceCount = 0;
  const allResources: Record<string, Record<string, any>> = {};

  for (const def of resourceDefs) {
    const pageKey = Object.keys(pages).find(
      (k) => pages[k].name === def.pageName,
    );
    if (!pageKey) continue;
    const page = pages[pageKey];

    allResources[def.pageName] = {};
    for (const res of def.resources) {
      const created = await prisma.resource.upsert({
        where: { pageId_code: { pageId: page.id, code: res.code } },
        update: { displayName: res.displayName, name: res.name },
        create: {
          pageId: page.id,
          name: res.name,
          displayName: res.displayName,
          code: res.code,
          type: res.type,
        },
      });
      allResources[def.pageName][res.code] = created;
      resourceCount++;
    }
  }

  console.log(`Creados ${resourceCount} recursos`);

  // ── Roles ──
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      displayName: 'Administrador',
      description: 'Acceso total al sistema',
      isSystem: true,
    },
  });

  const supervisorRole = await prisma.role.upsert({
    where: { name: 'supervisor' },
    update: {},
    create: {
      name: 'supervisor',
      displayName: 'Supervisor',
      description: 'Puede ver y gestionar usuarios, acceso limitado a administración',
    },
  });

  const operatorRole = await prisma.role.upsert({
    where: { name: 'operator' },
    update: {},
    create: {
      name: 'operator',
      displayName: 'Operador',
      description: 'Acceso básico solo al panel principal',
    },
  });

  console.log('Creados 3 roles');

  // ── Permisos de Páginas por Rol ──
  // Admin obtiene todo (isSystem lo bypasea de todas formas)
  const allPages = Object.values(pages);
  for (const page of allPages) {
    await prisma.rolePagePermission.upsert({
      where: { roleId_pageId: { roleId: adminRole.id, pageId: page.id } },
      update: {},
      create: { roleId: adminRole.id, pageId: page.id, canAccess: true },
    });
  }

  // Supervisor: panel, usuarios, detalle-usuario, roles
  const supervisorPages = ['dashboard', 'users', 'userDetail', 'roles'];
  for (const pageKey of supervisorPages) {
    if (pages[pageKey]) {
      await prisma.rolePagePermission.upsert({
        where: { roleId_pageId: { roleId: supervisorRole.id, pageId: pages[pageKey].id } },
        update: {},
        create: { roleId: supervisorRole.id, pageId: pages[pageKey].id, canAccess: true },
      });
    }
  }

  // Operador: solo panel principal
  await prisma.rolePagePermission.upsert({
    where: { roleId_pageId: { roleId: operatorRole.id, pageId: pages.dashboard.id } },
    update: {},
    create: { roleId: operatorRole.id, pageId: pages.dashboard.id, canAccess: true },
  });

  // ── Permisos de Recursos por Rol ──
  // Admin: todos los recursos
  for (const pageName of Object.keys(allResources)) {
    for (const code of Object.keys(allResources[pageName])) {
      const resource = allResources[pageName][code];
      await prisma.roleResourcePermission.upsert({
        where: { roleId_resourceId: { roleId: adminRole.id, resourceId: resource.id } },
        update: {},
        create: { roleId: adminRole.id, resourceId: resource.id, isAllowed: true },
      });
    }
  }

  // Supervisor: usuarios (crear, editar, ver_detalle)
  if (allResources['users']) {
    for (const code of ['create', 'edit', 'view_detail']) {
      if (allResources['users'][code]) {
        await prisma.roleResourcePermission.upsert({
          where: { roleId_resourceId: { roleId: supervisorRole.id, resourceId: allResources['users'][code].id } },
          update: {},
          create: { roleId: supervisorRole.id, resourceId: allResources['users'][code].id, isAllowed: true },
        });
      }
    }
  }

  // Operador: panel (ver estadísticas y acceso rápido)
  if (allResources['dashboard']) {
    for (const code of ['view_stats', 'quick_access']) {
      if (allResources['dashboard'][code]) {
        await prisma.roleResourcePermission.upsert({
          where: { roleId_resourceId: { roleId: operatorRole.id, resourceId: allResources['dashboard'][code].id } },
          update: {},
          create: { roleId: operatorRole.id, resourceId: allResources['dashboard'][code].id, isAllowed: true },
        });
      }
    }
  }

  console.log('Permisos de roles creados');

  // ── Usuarios ──
  const hashedPassword = await bcrypt.hash('Admin123!', 10);

  await prisma.user.upsert({
    where: { email: 'admin@framework.com' },
    update: {},
    create: {
      email: 'admin@framework.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'Sistema',
      roleId: adminRole.id,
      themeId: themes[0].id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'supervisor@framework.com' },
    update: {},
    create: {
      email: 'supervisor@framework.com',
      password: hashedPassword,
      firstName: 'María',
      lastName: 'García',
      roleId: supervisorRole.id,
      themeId: themes[0].id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'operator@framework.com' },
    update: {},
    create: {
      email: 'operator@framework.com',
      password: hashedPassword,
      firstName: 'Juan',
      lastName: 'Pérez',
      roleId: operatorRole.id,
      themeId: themes[0].id,
    },
  });

  console.log('Creados 3 usuarios');
  console.log('¡Seed completado exitosamente!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
