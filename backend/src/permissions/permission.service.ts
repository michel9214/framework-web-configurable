import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PermissionService {
  constructor(private prisma: PrismaService) {}

  async getUserPermissions(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user) return { pages: [], resources: [] };

    const pagePermissions = await this.prisma.rolePagePermission.findMany({
      where: { roleId: user.roleId, canAccess: true },
      include: { page: true },
    });

    const resourcePermissions =
      await this.prisma.roleResourcePermission.findMany({
        where: { roleId: user.roleId, isAllowed: true },
        include: { resource: { include: { page: true } } },
      });

    return {
      pages: pagePermissions.map((pp) => pp.page),
      resources: resourcePermissions.map((rp) => ({
        ...rp.resource,
        pageName: rp.resource.page.name,
      })),
    };
  }

  async canAccessPage(roleId: number, pageCode: string): Promise<boolean> {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (role?.isSystem) return true;

    const page = await this.prisma.page.findUnique({
      where: { name: pageCode },
    });

    if (!page) return false;

    const permission = await this.prisma.rolePagePermission.findUnique({
      where: { roleId_pageId: { roleId, pageId: page.id } },
    });

    return permission?.canAccess ?? false;
  }

  async canUseResource(
    roleId: number,
    pageCode: string,
    resourceCode: string,
  ): Promise<boolean> {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (role?.isSystem) return true;

    const page = await this.prisma.page.findUnique({
      where: { name: pageCode },
    });

    if (!page) return false;

    const resource = await this.prisma.resource.findUnique({
      where: { pageId_code: { pageId: page.id, code: resourceCode } },
    });

    if (!resource) return false;

    const permission = await this.prisma.roleResourcePermission.findUnique({
      where: { roleId_resourceId: { roleId, resourceId: resource.id } },
    });

    return permission?.isAllowed ?? false;
  }

  async getMenuForUser(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user) return [];

    const isSystem = user.role.isSystem;

    // Get ALL active, visible pages for each module
    const modules = await this.prisma.module.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      include: {
        pages: {
          where: { isActive: true, visibleInMenu: true },
          orderBy: { order: 'asc' },
        },
      },
    });

    // Get accessible page IDs if not system role
    let accessiblePageIds: Set<number> | null = null;
    if (!isSystem) {
      const accessiblePages = await this.prisma.rolePagePermission.findMany({
        where: { roleId: user.roleId, canAccess: true },
        select: { pageId: true },
      });
      accessiblePageIds = new Set(accessiblePages.map((p) => p.pageId));
    }

    // Build recursive tree for each module
    const buildTree = (pages: any[], parentId: number | null): any[] => {
      return pages
        .filter((p) => p.parentPageId === parentId)
        .filter((p) => isSystem || accessiblePageIds!.has(p.id))
        .map((page) => {
          const children = buildTree(pages, page.id);
          return {
            id: page.id,
            name: page.name,
            displayName: page.displayName,
            route: page.route,
            icon: page.icon,
            order: page.order,
            children,
          };
        });
    };

    // For non-system roles, also include a page if any of its descendants are accessible
    const buildTreeWithDescendants = (pages: any[], parentId: number | null): any[] => {
      return pages
        .filter((p) => p.parentPageId === parentId)
        .map((page) => {
          const children = buildTreeWithDescendants(pages, page.id);
          const selfAccessible = accessiblePageIds!.has(page.id);
          const hasAccessibleChildren = children.length > 0;

          if (!selfAccessible && !hasAccessibleChildren) return null;

          return {
            id: page.id,
            name: page.name,
            displayName: page.displayName,
            route: page.route,
            icon: page.icon,
            order: page.order,
            children,
          };
        })
        .filter(Boolean);
    };

    return modules
      .map((mod) => {
        const tree = isSystem
          ? buildTree(mod.pages, null)
          : buildTreeWithDescendants(mod.pages, null);

        if (tree.length === 0) return null;

        return {
          id: mod.id,
          name: mod.name,
          displayName: mod.displayName,
          icon: mod.icon,
          order: mod.order,
          pages: tree,
        };
      })
      .filter(Boolean);
  }

  async getPageResources(roleId: number, pageCode: string) {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    const page = await this.prisma.page.findUnique({
      where: { name: pageCode },
      include: { resources: { where: { isActive: true } } },
    });

    if (!page) return [];

    if (role?.isSystem) {
      return page.resources.map((r) => ({
        code: r.code,
        displayName: r.displayName,
        type: r.type,
        isAllowed: true,
      }));
    }

    const permissions = await this.prisma.roleResourcePermission.findMany({
      where: {
        roleId,
        resourceId: { in: page.resources.map((r) => r.id) },
      },
    });

    const permissionMap = new Map(
      permissions.map((p) => [p.resourceId, p.isAllowed]),
    );

    return page.resources.map((r) => ({
      code: r.code,
      displayName: r.displayName,
      type: r.type,
      isAllowed: permissionMap.get(r.id) ?? false,
    }));
  }
}
