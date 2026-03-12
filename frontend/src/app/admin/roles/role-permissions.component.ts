import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { firstValueFrom } from 'rxjs';
import { NotificationService } from '../../core/services/notification.service';
import { PermissionService } from '../../core/services/permission.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/components/confirm-dialog/confirm-dialog.component';
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

// ===== Resource Dialog =====
@Component({
  selector: 'app-add-resource-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  template: `
    <h2 mat-dialog-title>Agregar Recurso</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">
        <mat-form-field appearance="outline">
          <mat-label>Página</mat-label>
          <mat-select formControlName="pageId">
            @for (p of data.pages; track p.id) {
              <mat-option [value]="p.id">{{ p.displayName }} ({{ p.name }})</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Nombre</mat-label>
          <input matInput formControlName="name" placeholder="Crear Registro">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Nombre a Mostrar</mat-label>
          <input matInput formControlName="displayName" placeholder="Crear">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Código</mat-label>
          <input matInput formControlName="code" placeholder="create">
          <mat-hint>Código único por página (ej: create, edit, delete, export)</mat-hint>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Tipo</mat-label>
          <mat-select formControlName="type">
            <mat-option value="BUTTON">Botón</mat-option>
            <mat-option value="ACTION">Acción</mat-option>
            <mat-option value="SECTION">Sección</mat-option>
            <mat-option value="FIELD">Campo</mat-option>
          </mat-select>
        </mat-form-field>

        <div class="quick-add">
          <span class="quick-label">Recursos comunes:</span>
          <div class="quick-buttons">
            <button mat-stroked-button type="button" (click)="quickFill('create', 'Crear', 'BUTTON')">Crear</button>
            <button mat-stroked-button type="button" (click)="quickFill('edit', 'Editar', 'BUTTON')">Editar</button>
            <button mat-stroked-button type="button" (click)="quickFill('delete', 'Eliminar', 'BUTTON')">Eliminar</button>
            <button mat-stroked-button type="button" (click)="quickFill('export', 'Exportar', 'BUTTON')">Exportar</button>
            <button mat-stroked-button type="button" (click)="quickFill('view', 'Ver', 'SECTION')">Ver</button>
            <button mat-stroked-button type="button" (click)="quickFill('approve', 'Aprobar', 'ACTION')">Aprobar</button>
          </div>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-raised-button color="primary" (click)="save()" [disabled]="form.invalid">Agregar</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-form {
      display: flex;
      flex-direction: column;
      min-width: 420px;
      gap: 4px;
    }
    .quick-add {
      margin-top: 8px;
    }
    .quick-label {
      font-size: 13px;
      color: rgba(0,0,0,0.6);
      display: block;
      margin-bottom: 8px;
    }
    .quick-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .quick-buttons button {
      font-size: 12px;
    }
  `],
})
export class AddResourceDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<AddResourceDialogComponent>);
  data = inject<{ pages: { id: number; name: string; displayName: string }[]; preselectedPageId?: number }>(MAT_DIALOG_DATA);

  form = this.fb.group({
    pageId: [this.data.preselectedPageId || null, Validators.required],
    name: ['', Validators.required],
    displayName: ['', Validators.required],
    code: ['', Validators.required],
    type: ['BUTTON', Validators.required],
  });

  quickFill(code: string, displayName: string, type: string): void {
    this.form.patchValue({ code, name: displayName, displayName, type });
  }

  save(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}

// ===== Main Role Permissions Page =====
@Component({
  selector: 'app-role-permissions',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatChipsModule,
    MatTooltipModule,
    MatDividerModule,
    PageHeaderComponent,
  ],
  template: `
    @if (loading()) {
      <div class="loading-container">
        <mat-spinner diameter="48"></mat-spinner>
        <span>Cargando permisos...</span>
      </div>
    } @else if (role()) {
      <app-page-header
        [title]="'Permisos: ' + role()!.displayName"
        [subtitle]="'Configurar accesos y recursos para el rol ' + role()!.name">
        <button mat-stroked-button routerLink="/admin/roles">
          <mat-icon>arrow_back</mat-icon> Volver a Roles
        </button>
        <button mat-raised-button color="primary" (click)="save()" [disabled]="saving()">
          <mat-icon>save</mat-icon>
          {{ saving() ? 'Guardando...' : 'Guardar Permisos' }}
        </button>
      </app-page-header>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <button mat-stroked-button color="primary" (click)="selectAll()">
          <mat-icon>check_box</mat-icon> Seleccionar Todo
        </button>
        <button mat-stroked-button (click)="deselectAll()">
          <mat-icon>check_box_outline_blank</mat-icon> Deseleccionar Todo
        </button>
        <span class="spacer"></span>
        <button mat-raised-button color="accent" (click)="openAddResourceDialog()">
          <mat-icon>add_circle</mat-icon> Agregar Recurso
        </button>
      </div>

      <!-- Modules -->
      @for (mod of permissionModules(); track mod.id) {
        <mat-card class="module-card">
          <mat-card-header>
            <mat-icon mat-card-avatar class="module-avatar">{{ mod.icon }}</mat-icon>
            <mat-card-title>{{ mod.displayName }}</mat-card-title>
            <mat-card-subtitle>{{ mod.description || 'Módulo' }}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            @for (page of flattenPages(mod.pages); track page.id) {
              <div class="page-row" [style.marginLeft.px]="page.depth * 28">
                <div class="page-header">
                  @if (page.depth > 0) {
                    <mat-icon class="indent-icon">subdirectory_arrow_right</mat-icon>
                  }
                  <mat-checkbox
                    [checked]="page.canAccess"
                    (change)="togglePageAccess(page, $event.checked)"
                    class="page-checkbox">
                    <mat-icon class="page-icon">{{ page.icon }}</mat-icon>
                    <strong>{{ page.displayName }}</strong>
                    <span class="page-code">({{ page.name }})</span>
                  </mat-checkbox>
                </div>

                @if (page.resources.length > 0) {
                  <div class="resources-container" [class.disabled]="!page.canAccess">
                    @for (resource of page.resources; track resource.id) {
                      <div class="resource-item">
                        <mat-checkbox
                          [checked]="resourcePermissions()[resource.id] || false"
                          (change)="toggleResource(resource.id, $event.checked)"
                          [disabled]="!page.canAccess">
                          {{ resource.displayName }}
                        </mat-checkbox>
                        <span class="resource-type">{{ getResourceTypeLabel(resource.type) }}</span>
                        <span class="resource-code">{{ resource.code }}</span>
                        <button mat-icon-button
                          class="delete-resource-btn"
                          matTooltip="Eliminar recurso"
                          (click)="confirmDeleteResource(resource)">
                          <mat-icon>close</mat-icon>
                        </button>
                      </div>
                    }
                    <button mat-stroked-button class="add-resource-inline"
                      (click)="openAddResourceDialog(page.id)"
                      matTooltip="Agregar recurso a esta página">
                      <mat-icon>add</mat-icon> Recurso
                    </button>
                  </div>
                } @else {
                  <div class="no-resources">
                    <span>Sin recursos</span>
                    <button mat-stroked-button class="add-resource-inline"
                      (click)="openAddResourceDialog(page.id)">
                      <mat-icon>add</mat-icon> Agregar Recurso
                    </button>
                  </div>
                }
                <mat-divider></mat-divider>
              </div>
            }
          </mat-card-content>
        </mat-card>
      }

      <!-- Floating Save -->
      <div class="floating-save">
        <button mat-fab color="primary" (click)="save()" [disabled]="saving()" matTooltip="Guardar Permisos">
          <mat-icon>save</mat-icon>
        </button>
      </div>
    }
  `,
  styles: [`
    .loading-container {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      padding: 80px;
      font-size: 16px;
    }
    .quick-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }
    .spacer { flex: 1; }
    .module-card {
      margin-bottom: 24px;
    }
    .module-card mat-card-header {
      margin-bottom: 16px;
    }
    .module-avatar {
      background: #e3f2fd;
      color: #1565c0;
      border-radius: 50%;
      padding: 8px;
      font-size: 24px;
      width: 40px !important;
      height: 40px !important;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .page-row {
      padding: 8px 0;
    }
    .page-header {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-bottom: 8px;
    }
    .indent-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: rgba(0,0,0,0.38);
    }
    .page-checkbox {
      font-size: 14px;
    }
    .page-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      vertical-align: middle;
      margin-right: 4px;
    }
    .page-code {
      font-size: 12px;
      color: rgba(0,0,0,0.45);
      margin-left: 4px;
    }
    .resources-container {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-left: 40px;
      margin-bottom: 8px;
      align-items: center;
    }
    .resources-container.disabled {
      opacity: 0.5;
    }
    .resource-item {
      display: flex;
      align-items: center;
      gap: 4px;
      background: #f5f5f5;
      border-radius: 8px;
      padding: 4px 8px 4px 4px;
    }
    .resource-type {
      font-size: 10px;
      text-transform: uppercase;
      padding: 2px 6px;
      border-radius: 4px;
      background: #e0e0e0;
      color: rgba(0,0,0,0.6);
    }
    .resource-code {
      font-size: 11px;
      color: rgba(0,0,0,0.4);
      font-family: monospace;
    }
    .delete-resource-btn {
      width: 24px;
      height: 24px;
      line-height: 24px;
    }
    .delete-resource-btn mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: rgba(0,0,0,0.38);
    }
    .delete-resource-btn:hover mat-icon {
      color: #f44336;
    }
    .no-resources {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-left: 40px;
      margin-bottom: 8px;
      color: rgba(0,0,0,0.38);
      font-size: 13px;
    }
    .add-resource-inline {
      font-size: 12px;
      line-height: 28px;
      height: 28px;
    }
    .add-resource-inline mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }
    .floating-save {
      position: fixed;
      bottom: 32px;
      right: 32px;
      z-index: 100;
    }
    mat-divider {
      margin: 4px 0;
    }
  `],
})
export class RolePermissionsComponent implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private notification = inject(NotificationService);
  private permissionService = inject(PermissionService);

  loading = signal(true);
  saving = signal(false);
  role = signal<RoleWithPermissions | null>(null);
  permissionModules = signal<PermissionModule[]>([]);
  resourcePermissions = signal<Record<number, boolean>>({});

  private allPermPages: PermissionPage[] = [];
  private allFlatPages: { id: number; name: string; displayName: string }[] = [];

  async ngOnInit(): Promise<void> {
    await this.permissionService.loadPagePermissions('roles');
    const roleId = +this.route.snapshot.params['id'];
    if (!roleId) {
      this.router.navigate(['/admin/roles']);
      return;
    }
    await this.loadPermissionData(roleId);
  }

  flattenPages(pages: PermissionPage[]): PermissionPage[] {
    const result: PermissionPage[] = [];
    const walk = (list: PermissionPage[]) => {
      for (const p of list) {
        result.push(p);
        if (p.children.length > 0) walk(p.children);
      }
    };
    walk(pages);
    return result;
  }

  getResourceTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      BUTTON: 'Botón',
      ACTION: 'Acción',
      SECTION: 'Sección',
      FIELD: 'Campo',
    };
    return labels[type] || type;
  }

  private async loadPermissionData(roleId: number): Promise<void> {
    try {
      const roleRes = await firstValueFrom(
        this.http.get<ApiResponse<RoleWithPermissions>>(`/api/roles/${roleId}`)
      );
      this.role.set(roleRes.data);

      const [modulesRes, pagesRes, resourcesRes] = await Promise.all([
        firstValueFrom(this.http.get<ApiResponse<Module[]>>('/api/modules-config')),
        firstValueFrom(this.http.get<ApiResponse<Page[]>>('/api/pages-config')),
        firstValueFrom(this.http.get<ApiResponse<Resource[]>>('/api/resources-config')),
      ]);

      this.allFlatPages = (pagesRes.data || []).map(p => ({
        id: p.id, name: p.name, displayName: p.displayName,
      }));

      this.buildPermissionTree(roleRes.data, modulesRes.data || [], pagesRes.data || [], resourcesRes.data || []);
    } catch (err) {
      console.error('Error loading permissions:', err);
      this.notification.error('Error al cargar los datos de permisos');
    } finally {
      this.loading.set(false);
    }
  }

  private buildPermissionTree(
    fullRole: RoleWithPermissions,
    modules: Module[],
    allPages: Page[],
    allResources: Resource[],
  ): void {
    const pagePermMap = new Map<number, boolean>();
    for (const rpp of fullRole.rolePagePermissions || []) {
      pagePermMap.set(rpp.pageId, rpp.canAccess);
    }

    const resourcePermMap: Record<number, boolean> = {};
    for (const rrp of fullRole.roleResourcePermissions || []) {
      resourcePermMap[rrp.resourceId] = rrp.isAllowed;
    }
    this.resourcePermissions.set(resourcePermMap);

    const resourcesByPage = new Map<number, Resource[]>();
    for (const r of allResources) {
      if (!resourcesByPage.has(r.pageId)) resourcesByPage.set(r.pageId, []);
      resourcesByPage.get(r.pageId)!.push(r);
    }

    const pageMap = new Map<number, PermissionPage>();
    for (const p of allPages) {
      pageMap.set(p.id, {
        ...p,
        parentPageId: p.parentPageId || null,
        resources: resourcesByPage.get(p.id) || [],
        canAccess: pagePermMap.get(p.id) || false,
        children: [],
        depth: 0,
      });
    }

    const rootPagesByModule = new Map<number, PermissionPage[]>();
    for (const page of pageMap.values()) {
      if (page.parentPageId && pageMap.has(page.parentPageId)) {
        pageMap.get(page.parentPageId)!.children.push(page);
      } else {
        if (!rootPagesByModule.has(page.moduleId)) rootPagesByModule.set(page.moduleId, []);
        rootPagesByModule.get(page.moduleId)!.push(page);
      }
    }

    const assignDepths = (pages: PermissionPage[], depth: number) => {
      pages.sort((a, b) => a.order - b.order);
      for (const p of pages) {
        p.depth = depth;
        assignDepths(p.children, depth + 1);
      }
    };
    for (const pages of rootPagesByModule.values()) assignDepths(pages, 0);

    const result: PermissionModule[] = modules
      .filter(m => rootPagesByModule.has(m.id))
      .map(m => ({ ...m, pages: rootPagesByModule.get(m.id) || [] }));

    this.permissionModules.set(result);
    this.allPermPages = Array.from(pageMap.values());
  }

  togglePageAccess(page: PermissionPage, checked: boolean): void {
    page.canAccess = checked;
    if (!checked) {
      const perms = { ...this.resourcePermissions() };
      const uncheckRecursive = (p: PermissionPage) => {
        p.canAccess = false;
        for (const r of p.resources) perms[r.id] = false;
        for (const child of p.children) uncheckRecursive(child);
      };
      for (const r of page.resources) perms[r.id] = false;
      for (const child of page.children) uncheckRecursive(child);
      this.resourcePermissions.set(perms);
    }
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
    const walk = (pages: PermissionPage[]) => {
      for (const p of pages) {
        p.canAccess = true;
        for (const r of p.resources) perms[r.id] = true;
        walk(p.children);
      }
    };
    for (const mod of this.permissionModules()) walk(mod.pages);
    this.permissionModules.set([...this.permissionModules()]);
    this.resourcePermissions.set(perms);
  }

  deselectAll(): void {
    const walk = (pages: PermissionPage[]) => {
      for (const p of pages) {
        p.canAccess = false;
        walk(p.children);
      }
    };
    for (const mod of this.permissionModules()) walk(mod.pages);
    this.permissionModules.set([...this.permissionModules()]);
    this.resourcePermissions.set({});
  }

  openAddResourceDialog(preselectedPageId?: number): void {
    const dialogRef = this.dialog.open(AddResourceDialogComponent, {
      data: {
        pages: this.allFlatPages,
        preselectedPageId: preselectedPageId || null,
      },
      width: '520px',
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        try {
          await firstValueFrom(this.http.post('/api/resources-config', result));
          this.notification.success('Recurso creado exitosamente');
          // Reload all data
          const roleId = this.role()!.id;
          this.loading.set(true);
          await this.loadPermissionData(roleId);
        } catch {
          this.notification.error('Error al crear el recurso');
        }
      }
    });
  }

  confirmDeleteResource(resource: Resource): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar Recurso',
        message: `¿Eliminar el recurso "${resource.displayName}" (${resource.code})? Esto afectará a todos los roles.`,
        confirmText: 'Eliminar',
      } as ConfirmDialogData,
    });

    dialogRef.afterClosed().subscribe(async (confirmed) => {
      if (confirmed) {
        try {
          await firstValueFrom(this.http.delete(`/api/resources-config/${resource.id}`));
          this.notification.success('Recurso eliminado');
          const roleId = this.role()!.id;
          this.loading.set(true);
          await this.loadPermissionData(roleId);
        } catch {
          this.notification.error('Error al eliminar el recurso');
        }
      }
    });
  }

  async save(): Promise<void> {
    this.saving.set(true);
    try {
      const pagePermissions: { pageId: number; canAccess: boolean }[] = [];
      const resourcePerms: { resourceId: number; isAllowed: boolean }[] = [];

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
        this.http.post(`/api/roles/${this.role()!.id}/permissions`, {
          pages: pagePermissions,
          resources: resourcePerms,
        })
      );

      this.permissionService.clearPermissions();
      this.notification.success('Permisos guardados exitosamente');
    } catch {
      this.notification.error('Error al guardar los permisos');
    } finally {
      this.saving.set(false);
    }
  }
}
