import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { firstValueFrom } from 'rxjs';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { HasPermissionDirective } from '../../shared/directives/has-permission.directive';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { NotificationService } from '../../core/services/notification.service';
import { PermissionService } from '../../core/services/permission.service';
import { MenuService } from '../../core/services/menu.service';
import { ApiResponse, Module, Page } from '../../core/models/interfaces';

interface PageWithModule extends Page {
  module?: { displayName: string };
  parentPage?: { name: string; displayName: string } | null;
  _count?: { childPages: number; resources: number };
}

interface TreePage extends PageWithModule {
  children: TreePage[];
  depth: number;
}

interface PageDialogData {
  page: PageWithModule | null;
  modules: Module[];
  allPages: PageWithModule[];
  preselectedModuleId?: number;
  preselectedParentId?: number;
}

// ===== Diálogo de Crear/Editar Módulo =====
@Component({
  selector: 'app-module-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data ? 'Editar Módulo' : 'Crear Módulo' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">
        <mat-form-field appearance="outline">
          <mat-label>Nombre (código)</mat-label>
          <input matInput formControlName="name" placeholder="module-name">
          @if (form.get('name')?.hasError('required')) {
            <mat-error>El nombre es requerido</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Nombre a Mostrar</mat-label>
          <input matInput formControlName="displayName" placeholder="Mi Módulo">
          @if (form.get('displayName')?.hasError('required')) {
            <mat-error>El nombre a mostrar es requerido</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Descripción</mat-label>
          <textarea matInput formControlName="description" rows="3"></textarea>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Ícono</mat-label>
          <input matInput formControlName="icon" placeholder="view_module">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Orden</mat-label>
          <input matInput type="number" formControlName="order">
        </mat-form-field>

        <mat-slide-toggle formControlName="isActive">Activo</mat-slide-toggle>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-raised-button color="primary" (click)="save()" [disabled]="form.invalid">Guardar</button>
    </mat-dialog-actions>
  `,
  styles: [`
    ::ng-deep .mat-mdc-dialog-content { padding-top: 16px !important; }
    .dialog-form {
      display: flex;
      flex-direction: column;
      min-width: 400px;
      gap: 4px;
    }
  `],
})
export class ModuleDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<ModuleDialogComponent>);
  data = inject<Module | null>(MAT_DIALOG_DATA);

  form = this.fb.group({
    name: [this.data?.name || '', Validators.required],
    displayName: [this.data?.displayName || '', Validators.required],
    description: [this.data?.description || ''],
    icon: [this.data?.icon || 'view_module'],
    order: [this.data?.order ?? 0],
    isActive: [this.data?.isActive ?? true],
  });

  save(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}

// ===== Diálogo de Crear/Editar Página =====
@Component({
  selector: 'app-page-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatCheckboxModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.page ? 'Editar Página' : 'Crear Página' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">
        <mat-form-field appearance="outline">
          <mat-label>Módulo</mat-label>
          <mat-select formControlName="moduleId" (selectionChange)="onModuleChange()">
            @for (mod of data.modules; track mod.id) {
              <mat-option [value]="mod.id">{{ mod.displayName }}</mat-option>
            }
          </mat-select>
          @if (form.get('moduleId')?.hasError('required')) {
            <mat-error>El módulo es requerido</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Página Padre (opcional)</mat-label>
          <mat-select formControlName="parentPageId" (selectionChange)="onParentChange()">
            <mat-option [value]="null">— Ninguna (raíz) —</mat-option>
            @for (p of availableParentPages(); track p.id) {
              <mat-option [value]="p.id">
                {{ getPagePrefix(p) }}{{ p.displayName }}
              </mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Nombre a Mostrar</mat-label>
          <input matInput formControlName="displayName" placeholder="Mi Página" (input)="onDisplayNameInput()">
          @if (form.get('displayName')?.hasError('required')) {
            <mat-error>El nombre a mostrar es requerido</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Nombre (código)</mat-label>
          <input matInput formControlName="name" placeholder="page-name">
          @if (form.get('name')?.hasError('required')) {
            <mat-error>El nombre es requerido</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Ruta</mat-label>
          <input matInput formControlName="route" placeholder="/admin/page-name">
          @if (form.get('route')?.hasError('required')) {
            <mat-error>La ruta es requerida</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Ícono</mat-label>
          <input matInput formControlName="icon" placeholder="article">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Orden</mat-label>
          <input matInput type="number" formControlName="order">
        </mat-form-field>

        <mat-slide-toggle formControlName="visibleInMenu">Visible en Menú</mat-slide-toggle>
        <mat-slide-toggle formControlName="isActive">Activo</mat-slide-toggle>

        @if (!data.page) {
          <mat-checkbox formControlName="createDefaultResources" class="default-resources">
            Crear recursos CRUD básicos (crear, editar, eliminar)
          </mat-checkbox>
        }
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-raised-button color="primary" (click)="save()" [disabled]="form.invalid">Guardar</button>
    </mat-dialog-actions>
  `,
  styles: [`
    ::ng-deep .mat-mdc-dialog-content { padding-top: 16px !important; }
    .dialog-form {
      display: flex;
      flex-direction: column;
      min-width: 420px;
      gap: 4px;
    }
    mat-slide-toggle {
      margin-bottom: 8px;
    }
    .default-resources {
      margin-top: 8px;
      font-size: 13px;
    }
  `],
})
export class PageDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<PageDialogComponent>);
  data = inject<PageDialogData>(MAT_DIALOG_DATA);

  availableParentPages = signal<PageWithModule[]>([]);

  form = this.fb.group({
    moduleId: [this.data.page?.moduleId || this.data.preselectedModuleId || null, Validators.required],
    parentPageId: [this.data.page?.parentPageId || this.data.preselectedParentId || null],
    name: [this.data.page?.name || '', Validators.required],
    displayName: [this.data.page?.displayName || '', Validators.required],
    route: [this.data.page?.route || '', Validators.required],
    icon: [this.data.page?.icon || 'article'],
    order: [this.data.page?.order ?? 0],
    visibleInMenu: [this.data.page?.visibleInMenu ?? true],
    isActive: [this.data.page?.isActive ?? true],
    createDefaultResources: [!this.data.page],
  });

  moduleLocked = false;
  parentLocked = false;
  private autoName = true;
  private autoRoute = true;

  constructor() {
    if (!this.data.page && this.data.preselectedModuleId) {
      this.form.get('moduleId')?.disable();
      this.moduleLocked = true;
    }
    if (!this.data.page && this.data.preselectedParentId) {
      this.form.get('parentPageId')?.disable();
      this.parentLocked = true;
    }
    // Si es edición, no autocompletar
    if (this.data.page) {
      this.autoName = false;
      this.autoRoute = false;
    }
    // Detectar edición manual de nombre o ruta
    this.form.get('name')?.valueChanges.subscribe(() => {
      if (!this._updatingFromDisplayName) this.autoName = false;
    });
    this.form.get('route')?.valueChanges.subscribe(() => {
      if (!this._updatingFromDisplayName) this.autoRoute = false;
    });
    this.updateAvailableParents();
  }

  private _updatingFromDisplayName = false;

  onDisplayNameInput(): void {
    if (!this.autoName && !this.autoRoute) return;
    const displayName = this.form.get('displayName')?.value || '';
    const kebab = this.toKebabCase(displayName);

    this._updatingFromDisplayName = true;
    if (this.autoName) {
      this.form.get('name')?.setValue(kebab);
    }
    if (this.autoRoute) {
      this.form.get('route')?.setValue(this.buildRoute(kebab));
    }
    this._updatingFromDisplayName = false;
  }

  private toKebabCase(str: string): string {
    return str
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  }

  private buildRoute(kebab: string): string {
    const parentId = this.form.getRawValue().parentPageId;
    if (parentId) {
      const parent = this.data.allPages.find(p => p.id === parentId);
      if (parent?.route) return `${parent.route}/${kebab}`;
    }
    const moduleId = this.form.getRawValue().moduleId;
    const mod = this.data.modules.find(m => m.id === moduleId);
    if (mod) {
      const modPrefix = this.toKebabCase(mod.name || mod.displayName);
      return `/${modPrefix}/${kebab}`;
    }
    return `/${kebab}`;
  }

  onModuleChange(): void {
    this.form.get('parentPageId')?.setValue(null);
    this.updateAvailableParents();
    this.recalcRoute();
  }

  onParentChange(): void {
    this.recalcRoute();
  }

  private recalcRoute(): void {
    if (!this.autoRoute) return;
    const kebab = this.toKebabCase(this.form.get('displayName')?.value || '');
    if (kebab) {
      this._updatingFromDisplayName = true;
      this.form.get('route')?.setValue(this.buildRoute(kebab));
      this._updatingFromDisplayName = false;
    }
  }

  private updateAvailableParents(): void {
    const moduleId = this.form.get('moduleId')?.value;
    const editingId = this.data.page?.id;
    const filtered = this.data.allPages.filter(p =>
      p.moduleId === moduleId && p.id !== editingId
    );
    this.availableParentPages.set(filtered);
  }

  getPagePrefix(page: PageWithModule): string {
    if (page.parentPageId) return '↳ ';
    return '';
  }

  save(): void {
    if (this.form.valid) {
      const value = { ...this.form.getRawValue() };
      if (!value.parentPageId) value.parentPageId = null;
      this.dialogRef.close(value);
    }
  }
}

// ===== Página Principal: Configuración de Módulos y Páginas =====
@Component({
  selector: 'app-pages-config',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTooltipModule,
    MatDividerModule,
    MatChipsModule,
    PageHeaderComponent,
    HasPermissionDirective,
  ],
  template: `
    <app-page-header title="Configuración de Módulos y Páginas" subtitle="Gestionar módulos y la estructura de páginas">
      <button mat-raised-button color="primary" *hasPermission="'create'" (click)="openModuleDialog()">
        <mat-icon>add</mat-icon> Nuevo Módulo
      </button>
    </app-page-header>

    @for (mod of moduleTree(); track mod.id) {
      <mat-card class="module-card">
        <mat-card-header>
          <mat-icon mat-card-avatar class="module-avatar">{{ mod.icon }}</mat-icon>
          <mat-card-title>{{ mod.displayName }}</mat-card-title>
          <mat-card-subtitle>
            {{ mod.description || 'Módulo' }} · {{ countPages(mod.pages) }} páginas
            @if (!mod.isActive) {
              <span class="badge badge-inactive">inactivo</span>
            }
          </mat-card-subtitle>
          <span class="header-spacer"></span>
          <div class="module-actions">
            <button mat-icon-button matTooltip="Agregar página" *hasPermission="'create'"
              (click)="openPageDialog(undefined, mod.id)">
              <mat-icon>add_circle_outline</mat-icon>
            </button>
            <button mat-icon-button matTooltip="Editar módulo" *hasPermission="'edit'"
              (click)="openModuleDialog(mod)">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-icon-button matTooltip="Eliminar módulo" *hasPermission="'delete'"
              (click)="confirmDeleteModule(mod)" class="delete-btn">
              <mat-icon>delete</mat-icon>
            </button>
          </div>
        </mat-card-header>
        <mat-card-content>
          @if (mod.pages.length === 0) {
            <div class="empty-module">
              <span>Sin páginas asignadas</span>
              <button mat-stroked-button *hasPermission="'create'" (click)="openPageDialog(undefined, mod.id)">
                <mat-icon>add</mat-icon> Agregar Página
              </button>
            </div>
          }
          @for (page of flattenPages(mod.pages); track page.id) {
            <div class="page-row" [style.marginLeft.px]="page.depth * 28">
              <div class="page-header">
                @if (page.depth > 0) {
                  <mat-icon class="indent-icon">subdirectory_arrow_right</mat-icon>
                }
                <mat-icon class="page-icon">{{ page.icon }}</mat-icon>
                <div class="page-info">
                  <strong>{{ page.displayName }}</strong>
                  <span class="page-code">{{ page.name }}</span>
                </div>
                <span class="page-route">{{ page.route }}</span>
                <div class="page-badges">
                  @if (!page.visibleInMenu) {
                    <span class="badge badge-hidden" matTooltip="No visible en menú">oculta</span>
                  }
                  @if (!page.isActive) {
                    <span class="badge badge-inactive">inactiva</span>
                  }
                  @if (page._count?.resources) {
                    <span class="badge badge-resources" matTooltip="Recursos asignados">
                      {{ page._count?.resources }} rec.
                    </span>
                  }
                </div>
                <span class="spacer"></span>
                <div class="page-actions">
                  <button mat-icon-button matTooltip="Agregar hija" *hasPermission="'create'"
                    (click)="openPageDialog(undefined, mod.id, page.id)">
                    <mat-icon>add_circle_outline</mat-icon>
                  </button>
                  <button mat-icon-button matTooltip="Editar" *hasPermission="'edit'"
                    (click)="openPageDialog(page)">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button matTooltip="Eliminar" *hasPermission="'delete'"
                    (click)="confirmDeletePage(page)" class="delete-btn">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </div>
              <mat-divider></mat-divider>
            </div>
          }
        </mat-card-content>
      </mat-card>
    }
  `,
  styles: [`
    .module-card {
      margin-bottom: 24px;
    }
    ::ng-deep .module-card {
      overflow: hidden;
    }
    ::ng-deep .module-card .mat-mdc-card-header {
      padding: 12px 16px;
      background: color-mix(in srgb, var(--theme-primary, #3f51b5) 15%, transparent);
      border-bottom: 1px solid color-mix(in srgb, var(--theme-primary, #3f51b5) 25%, transparent);
    }
    ::ng-deep .module-card .mat-mdc-card-content {
      padding: 8px 16px 16px 40px;
    }
    .module-avatar {
      background: #e8eaf6;
      color: #3949ab;
      border-radius: 50%;
      padding: 8px;
      font-size: 24px;
      width: 40px !important;
      height: 40px !important;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .header-spacer { flex: 1; }
    .module-actions {
      display: flex;
      gap: 0;
      align-items: center;
    }
    .module-actions button {
      width: 36px;
      height: 36px;
      line-height: 36px;
    }
    .module-actions mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
    .page-row {
      padding: 6px 0;
    }
    .page-header {
      display: flex;
      align-items: center;
      gap: 8px;
      min-height: 40px;
    }
    .indent-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: rgba(0,0,0,0.3);
      flex-shrink: 0;
    }
    .page-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: rgba(0,0,0,0.54);
      flex-shrink: 0;
    }
    .page-info {
      display: flex;
      flex-direction: column;
      min-width: 140px;
    }
    .page-info strong {
      font-size: 14px;
      line-height: 1.2;
    }
    .page-code {
      font-size: 11px;
      color: rgba(0,0,0,0.4);
      font-family: monospace;
    }
    .page-route {
      font-size: 12px;
      color: rgba(0,0,0,0.45);
      font-family: monospace;
      background: #f5f5f5;
      padding: 2px 8px;
      border-radius: 4px;
      white-space: nowrap;
    }
    .page-badges {
      display: flex;
      gap: 6px;
      align-items: center;
    }
    .badge {
      font-size: 10px;
      text-transform: uppercase;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 500;
      white-space: nowrap;
    }
    .badge-hidden {
      background: #fff3e0;
      color: #e65100;
    }
    .badge-inactive {
      background: #ffebee;
      color: #c62828;
    }
    .badge-resources {
      background: #e3f2fd;
      color: #1565c0;
    }
    .spacer { flex: 1; }
    .page-actions {
      display: flex;
      gap: 0;
      flex-shrink: 0;
    }
    .page-actions button {
      width: 32px;
      height: 32px;
      line-height: 32px;
    }
    .page-actions mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
    .delete-btn mat-icon {
      color: rgba(0,0,0,0.38);
    }
    .delete-btn:hover mat-icon {
      color: #f44336;
    }
    .empty-module {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      color: rgba(0,0,0,0.38);
    }
mat-divider {
      margin: 2px 0;
    }
  `],
})
export class PagesConfigComponent implements OnInit {
  private http = inject(HttpClient);
  private dialog = inject(MatDialog);
  private notification = inject(NotificationService);
  private permissionService = inject(PermissionService);
  private menuService = inject(MenuService);

  modules = signal<Module[]>([]);
  allPages = signal<PageWithModule[]>([]);
  moduleTree = signal<(Module & { pages: TreePage[] })[]>([]);

  async ngOnInit(): Promise<void> {
    await this.permissionService.loadPagePermissions('pages-config');
    await this.loadData();
  }

  async loadData(): Promise<void> {
    try {
      const [modulesRes, pagesRes] = await Promise.all([
        firstValueFrom(this.http.get<ApiResponse<Module[]>>('/api/modules-config')),
        firstValueFrom(this.http.get<ApiResponse<PageWithModule[]>>('/api/pages-config')),
      ]);
      this.modules.set(modulesRes.data);
      this.allPages.set(pagesRes.data);
      this.buildTree(modulesRes.data, pagesRes.data);
      this.menuService.loadMenu();
    } catch {
      this.notification.error('Error al cargar los datos');
    }
  }

  private buildTree(modules: Module[], pages: PageWithModule[]): void {
    const pageMap = new Map<number, TreePage>();
    for (const p of pages) {
      pageMap.set(p.id, { ...p, children: [], depth: 0 });
    }

    const rootsByModule = new Map<number, TreePage[]>();
    for (const page of pageMap.values()) {
      if (page.parentPageId && pageMap.has(page.parentPageId)) {
        pageMap.get(page.parentPageId)!.children.push(page);
      } else {
        if (!rootsByModule.has(page.moduleId)) rootsByModule.set(page.moduleId, []);
        rootsByModule.get(page.moduleId)!.push(page);
      }
    }

    const assignDepths = (list: TreePage[], depth: number) => {
      list.sort((a, b) => a.order - b.order);
      for (const p of list) {
        p.depth = depth;
        assignDepths(p.children, depth + 1);
      }
    };
    for (const list of rootsByModule.values()) assignDepths(list, 0);

    const tree = modules
      .sort((a, b) => a.order - b.order)
      .map(m => ({
        ...m,
        pages: rootsByModule.get(m.id) || [],
      }));

    this.moduleTree.set(tree);
  }

  flattenPages(pages: TreePage[]): TreePage[] {
    const result: TreePage[] = [];
    const walk = (list: TreePage[]) => {
      for (const p of list) {
        result.push(p);
        if (p.children.length > 0) walk(p.children);
      }
    };
    walk(pages);
    return result;
  }

  countPages(pages: TreePage[]): number {
    let count = 0;
    const walk = (list: TreePage[]) => {
      for (const p of list) {
        count++;
        walk(p.children);
      }
    };
    walk(pages);
    return count;
  }

  // ── Module CRUD ──

  openModuleDialog(mod?: Module): void {
    const dialogRef = this.dialog.open(ModuleDialogComponent, {
      data: mod || null,
      width: '500px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (mod) {
          this.updateModule(mod.id, result);
        } else {
          this.createModule(result);
        }
      }
    });
  }

  confirmDeleteModule(mod: Module & { pages: TreePage[] }): void {
    if (mod.pages.length > 0) {
      this.notification.warning(
        `No se puede eliminar el módulo "${mod.displayName}" porque tiene ${this.countPages(mod.pages)} página(s). Elimina las páginas primero.`
      );
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar Módulo',
        message: `¿Estás seguro de que deseas eliminar el módulo "${mod.displayName}"?`,
        confirmText: 'Eliminar',
      } as ConfirmDialogData,
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) this.deleteModule(mod.id);
    });
  }

  private async createModule(data: Partial<Module>): Promise<void> {
    try {
      await firstValueFrom(this.http.post('/api/modules-config', data));
      this.notification.success('Módulo creado exitosamente');
      await this.loadData();
    } catch (e: any) {
      const msg = e?.error?.message || 'Error al crear el módulo';
      this.notification.error(msg);
    }
  }

  private async updateModule(id: number, data: Partial<Module>): Promise<void> {
    try {
      await firstValueFrom(this.http.put(`/api/modules-config/${id}`, data));
      this.notification.success('Módulo actualizado exitosamente');
      await this.loadData();
    } catch (e: any) {
      const msg = e?.error?.message || 'Error al actualizar el módulo';
      this.notification.error(msg);
    }
  }

  private async deleteModule(id: number): Promise<void> {
    try {
      await firstValueFrom(this.http.delete(`/api/modules-config/${id}`));
      this.notification.success('Módulo eliminado exitosamente');
      await this.loadData();
    } catch (e: any) {
      const msg = e?.error?.message || 'Error al eliminar el módulo';
      this.notification.error(msg);
    }
  }

  // ── Page CRUD ──

  openPageDialog(page?: PageWithModule, preselectedModuleId?: number, preselectedParentId?: number): void {
    const dialogRef = this.dialog.open(PageDialogComponent, {
      data: {
        page: page || null,
        modules: this.modules(),
        allPages: this.allPages(),
        preselectedModuleId,
        preselectedParentId,
      } as PageDialogData,
      width: '550px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (page) {
          this.updatePage(page.id, result);
        } else {
          this.createPage(result);
        }
      }
    });
  }

  confirmDeletePage(page: PageWithModule): void {
    const treePage = page as TreePage;
    const childCount = treePage.children?.length || 0;

    if (childCount > 0) {
      this.notification.warning(
        `No se puede eliminar la página "${page.displayName}" porque tiene ${childCount} página(s) hija(s). Elimina las páginas hijas primero.`
      );
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar Página',
        message: `¿Estás seguro de que deseas eliminar la página "${page.displayName}"?`,
        confirmText: 'Eliminar',
      } as ConfirmDialogData,
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) this.deletePage(page.id);
    });
  }

  private async createPage(data: Partial<Page>): Promise<void> {
    try {
      await firstValueFrom(this.http.post('/api/pages-config', data));
      this.notification.success('Página creada exitosamente');
      await this.loadData();
    } catch (e: any) {
      const msg = e?.error?.message || 'Error al crear la página';
      this.notification.error(msg);
    }
  }

  private async updatePage(id: number, data: Partial<Page>): Promise<void> {
    try {
      await firstValueFrom(this.http.put(`/api/pages-config/${id}`, data));
      this.notification.success('Página actualizada exitosamente');
      await this.loadData();
    } catch (e: any) {
      const msg = e?.error?.message || 'Error al actualizar la página';
      this.notification.error(msg);
    }
  }

  private async deletePage(id: number): Promise<void> {
    try {
      await firstValueFrom(this.http.delete(`/api/pages-config/${id}`));
      this.notification.success('Página eliminada exitosamente');
      await this.loadData();
    } catch (e: any) {
      const msg = e?.error?.message || 'Error al eliminar la página';
      this.notification.error(msg);
    }
  }
}
