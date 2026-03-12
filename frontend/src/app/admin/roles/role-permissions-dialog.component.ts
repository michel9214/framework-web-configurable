import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { firstValueFrom } from 'rxjs';
import { NotificationService } from '../../core/services/notification.service';
import { PermissionService } from '../../core/services/permission.service';
import { ApiResponse, Module, Page, Resource, RoleWithPermissions } from '../../core/models/interfaces';

interface PermissionPage {
  id: number;
  moduleId: number;
  parentPageId: number | null;
  name: string;
  displayName: string;
  route: string;
  icon: string;
  order: number;
  visibleInMenu: boolean;
  isActive: boolean;
  resources: Resource[];
  canAccess: boolean;
  children: PermissionPage[];
  depth: number;
}

interface PermissionModule extends Module {
  pages: PermissionPage[];
}

@Component({
  selector: 'app-role-permissions-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>Permisos para {{ data.displayName }}</h2>
    <mat-dialog-content class="permissions-content">
      @if (loading()) {
        <div class="loading">
          <mat-spinner diameter="40"></mat-spinner>
          <span>Cargando permisos...</span>
        </div>
      } @else {
        <div class="toolbar">
          <button mat-stroked-button color="primary" (click)="selectAll()">
            <mat-icon>check_box</mat-icon> Seleccionar Todo
          </button>
          <button mat-stroked-button (click)="deselectAll()">
            <mat-icon>check_box_outline_blank</mat-icon> Deseleccionar Todo
          </button>
        </div>

        @for (mod of permissionModules(); track mod.id) {
          <div class="module-group">
            <h3 class="module-title">
              <mat-icon>{{ mod.icon }}</mat-icon>
              {{ mod.displayName }}
            </h3>

            <table class="permissions-table">
              <thead>
                <tr>
                  <th class="page-col">Página</th>
                  <th class="access-col">Acceso</th>
                  <th class="resources-col">Recursos</th>
                </tr>
              </thead>
              <tbody>
                @for (page of flattenPages(mod.pages); track page.id) {
                  <tr [class.child-row]="page.depth > 0">
                    <td class="page-col">
                      <span class="page-indent" [style.paddingLeft.px]="page.depth * 24">
                        @if (page.depth > 0) {
                          <mat-icon class="child-icon">subdirectory_arrow_right</mat-icon>
                        }
                        <mat-icon class="page-icon">{{ page.icon }}</mat-icon>
                        {{ page.displayName }}
                      </span>
                    </td>
                    <td class="access-col">
                      <mat-checkbox
                        [checked]="page.canAccess"
                        (change)="togglePageAccess(page, $event.checked)">
                      </mat-checkbox>
                    </td>
                    <td class="resources-col">
                      @for (resource of page.resources; track resource.id) {
                        <mat-checkbox
                          [checked]="resourcePermissions()[resource.id] || false"
                          (change)="toggleResource(resource.id, $event.checked)"
                          [disabled]="!page.canAccess"
                          class="resource-checkbox">
                          {{ resource.displayName }}
                        </mat-checkbox>
                      }
                      @if (page.resources.length === 0) {
                        <span class="no-resources">Sin recursos</span>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-raised-button color="primary" (click)="save()" [disabled]="saving()">
        @if (saving()) {
          Guardando...
        } @else {
          Guardar Permisos
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .permissions-content {
      min-width: 750px;
      max-height: 70vh;
    }
    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      padding: 40px;
    }
    .toolbar {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
    }
    .module-group {
      margin-bottom: 24px;
    }
    .module-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 8px;
      padding: 8px 12px;
      background: #f5f5f5;
      border-radius: 4px;
      font-size: 16px;
    }
    .permissions-table {
      width: 100%;
      border-collapse: collapse;
    }
    .permissions-table th,
    .permissions-table td {
      padding: 8px 12px;
      text-align: left;
      border-bottom: 1px solid #e0e0e0;
    }
    .permissions-table th {
      font-weight: 500;
      color: rgba(0,0,0,0.6);
      font-size: 13px;
    }
    .page-col { width: 240px; }
    .access-col { width: 80px; text-align: center; }
    .resources-col { display: flex; flex-wrap: wrap; gap: 4px; }
    .page-indent {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .child-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: rgba(0,0,0,0.38);
    }
    .page-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: rgba(0,0,0,0.54);
    }
    .child-row {
      background: rgba(0,0,0,0.02);
    }
    .resource-checkbox {
      margin-right: 12px;
      font-size: 13px;
    }
    .no-resources {
      color: rgba(0,0,0,0.38);
      font-size: 13px;
    }
  `],
})
export class RolePermissionsDialogComponent implements OnInit {
  private http = inject(HttpClient);
  private dialogRef = inject(MatDialogRef<RolePermissionsDialogComponent>);
  private notification = inject(NotificationService);
  private permissionService = inject(PermissionService);
  data = inject<RoleWithPermissions>(MAT_DIALOG_DATA);

  loading = signal(true);
  saving = signal(false);
  permissionModules = signal<PermissionModule[]>([]);
  resourcePermissions = signal<Record<number, boolean>>({});

  // Flat map for quick page lookups
  private allPermPages: PermissionPage[] = [];

  async ngOnInit(): Promise<void> {
    await this.loadPermissionData();
  }

  /** Flatten a tree of pages into a list preserving depth for display */
  flattenPages(pages: PermissionPage[]): PermissionPage[] {
    const result: PermissionPage[] = [];
    const walk = (list: PermissionPage[]) => {
      for (const p of list) {
        result.push(p);
        if (p.children.length > 0) {
          walk(p.children);
        }
      }
    };
    walk(pages);
    return result;
  }

  private async loadPermissionData(): Promise<void> {
    try {
      // Fetch full role details with existing permissions
      const roleRes = await firstValueFrom(
        this.http.get<ApiResponse<RoleWithPermissions>>(`/api/roles/${this.data.id}`)
      );
      const fullRole = roleRes.data;

      const [modulesRes, pagesRes, resourcesRes] = await Promise.all([
        firstValueFrom(this.http.get<ApiResponse<Module[]>>('/api/modules-config')),
        firstValueFrom(this.http.get<ApiResponse<Page[]>>('/api/pages-config')),
        firstValueFrom(this.http.get<ApiResponse<Resource[]>>('/api/resources-config')),
      ]);

      // Build page permission map from existing role data
      const pagePermMap = new Map<number, boolean>();
      for (const rpp of fullRole.rolePagePermissions || []) {
        pagePermMap.set(rpp.pageId, rpp.canAccess);
      }

      // Build resource permission map
      const resourcePermMap: Record<number, boolean> = {};
      for (const rrp of fullRole.roleResourcePermissions || []) {
        resourcePermMap[rrp.resourceId] = rrp.isAllowed;
      }
      this.resourcePermissions.set(resourcePermMap);

      // Group resources by page
      const allResources = resourcesRes.data || [];
      const resourcesByPage = new Map<number, Resource[]>();
      for (const r of allResources) {
        if (!resourcesByPage.has(r.pageId)) {
          resourcesByPage.set(r.pageId, []);
        }
        resourcesByPage.get(r.pageId)!.push(r);
      }

      // Build flat PermissionPage map
      const allPages = pagesRes.data || [];
      const pageMap = new Map<number, PermissionPage>();
      for (const p of allPages) {
        const permPage: PermissionPage = {
          ...p,
          parentPageId: p.parentPageId || null,
          resources: resourcesByPage.get(p.id) || [],
          canAccess: pagePermMap.get(p.id) || false,
          children: [],
          depth: 0,
        };
        pageMap.set(p.id, permPage);
      }

      // Build tree: assign children to parents
      const rootPagesByModule = new Map<number, PermissionPage[]>();
      for (const page of pageMap.values()) {
        if (page.parentPageId && pageMap.has(page.parentPageId)) {
          pageMap.get(page.parentPageId)!.children.push(page);
        } else {
          // Root page (no parent or parent not found)
          if (!rootPagesByModule.has(page.moduleId)) {
            rootPagesByModule.set(page.moduleId, []);
          }
          rootPagesByModule.get(page.moduleId)!.push(page);
        }
      }

      // Sort children and assign depths recursively
      const assignDepths = (pages: PermissionPage[], depth: number) => {
        pages.sort((a, b) => a.order - b.order);
        for (const p of pages) {
          p.depth = depth;
          assignDepths(p.children, depth + 1);
        }
      };

      for (const pages of rootPagesByModule.values()) {
        assignDepths(pages, 0);
      }

      // Build module list
      const modules: PermissionModule[] = (modulesRes.data || [])
        .filter(m => rootPagesByModule.has(m.id))
        .map(m => ({
          ...m,
          pages: rootPagesByModule.get(m.id) || [],
        }));

      this.permissionModules.set(modules);

      // Store flat list of all pages for save
      this.allPermPages = Array.from(pageMap.values());
    } catch (err) {
      console.error('Error loading permissions:', err);
      this.notification.error('Error al cargar los datos de permisos');
    } finally {
      this.loading.set(false);
    }
  }

  togglePageAccess(page: PermissionPage, checked: boolean): void {
    page.canAccess = checked;
    if (!checked) {
      // Cascade: uncheck all resources of this page
      const perms = { ...this.resourcePermissions() };
      for (const r of page.resources) {
        perms[r.id] = false;
      }
      // Also cascade to all children recursively
      const uncheckChildren = (children: PermissionPage[]) => {
        for (const child of children) {
          child.canAccess = false;
          for (const r of child.resources) {
            perms[r.id] = false;
          }
          uncheckChildren(child.children);
        }
      };
      uncheckChildren(page.children);
      this.resourcePermissions.set(perms);
    }
    // Force UI refresh
    this.permissionModules.set([...this.permissionModules()]);
  }

  toggleResource(resourceId: number, checked: boolean): void {
    this.resourcePermissions.set({
      ...this.resourcePermissions(),
      [resourceId]: checked,
    });
  }

  selectAll(): void {
    const perms: Record<number, boolean> = {};
    const walkSelect = (pages: PermissionPage[]) => {
      for (const page of pages) {
        page.canAccess = true;
        for (const r of page.resources) {
          perms[r.id] = true;
        }
        walkSelect(page.children);
      }
    };
    for (const mod of this.permissionModules()) {
      walkSelect(mod.pages);
    }
    this.permissionModules.set([...this.permissionModules()]);
    this.resourcePermissions.set(perms);
  }

  deselectAll(): void {
    const walkDeselect = (pages: PermissionPage[]) => {
      for (const page of pages) {
        page.canAccess = false;
        walkDeselect(page.children);
      }
    };
    for (const mod of this.permissionModules()) {
      walkDeselect(mod.pages);
    }
    this.permissionModules.set([...this.permissionModules()]);
    this.resourcePermissions.set({});
  }

  async save(): Promise<void> {
    this.saving.set(true);
    try {
      const pagePermissions: { pageId: number; canAccess: boolean }[] = [];
      const resourcePerms: { resourceId: number; isAllowed: boolean }[] = [];

      // Collect from ALL pages (flat list)
      for (const page of this.allPermPages) {
        pagePermissions.push({ pageId: page.id, canAccess: page.canAccess });
        for (const r of page.resources) {
          resourcePerms.push({
            resourceId: r.id,
            isAllowed: this.resourcePermissions()[r.id] || false,
          });
        }
      }

      await firstValueFrom(
        this.http.post(`/api/roles/${this.data.id}/permissions`, {
          pages: pagePermissions,
          resources: resourcePerms,
        })
      );

      this.permissionService.clearPermissions();
      this.notification.success('Permisos guardados exitosamente');
      this.dialogRef.close(true);
    } catch {
      this.notification.error('Error al guardar los permisos');
    } finally {
      this.saving.set(false);
    }
  }
}
