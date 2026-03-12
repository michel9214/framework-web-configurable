import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { firstValueFrom } from 'rxjs';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { DataTableComponent, TableColumn, TableAction } from '../../shared/components/data-table/data-table.component';
import { HasPermissionDirective } from '../../shared/directives/has-permission.directive';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { NotificationService } from '../../core/services/notification.service';
import { PermissionService } from '../../core/services/permission.service';
import { ApiResponse, RoleWithPermissions } from '../../core/models/interfaces';

@Component({
  selector: 'app-role-dialog',
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
    <h2 mat-dialog-title>{{ data ? 'Editar Rol' : 'Crear Rol' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">
        <mat-form-field appearance="outline">
          <mat-label>Nombre</mat-label>
          <input matInput formControlName="name" placeholder="role-name">
          @if (form.get('name')?.hasError('required')) {
            <mat-error>El nombre es requerido</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Nombre a Mostrar</mat-label>
          <input matInput formControlName="displayName" placeholder="Role Name">
          @if (form.get('displayName')?.hasError('required')) {
            <mat-error>El nombre a mostrar es requerido</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Descripción</mat-label>
          <textarea matInput formControlName="description" rows="3"></textarea>
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
    .dialog-form {
      display: flex;
      flex-direction: column;
      min-width: 400px;
      gap: 4px;
    }
  `],
})
export class RoleDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<RoleDialogComponent>);
  data = inject<RoleWithPermissions | null>(MAT_DIALOG_DATA);

  form = this.fb.group({
    name: [this.data?.name || '', Validators.required],
    displayName: [this.data?.displayName || '', Validators.required],
    description: [this.data?.description || ''],
    isActive: [this.data?.isActive ?? true],
  });

  save(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    PageHeaderComponent,
    DataTableComponent,
    HasPermissionDirective,
  ],
  template: `
    <app-page-header title="Gestión de Roles" subtitle="Gestionar roles y permisos">
      <button mat-raised-button color="primary" *hasPermission="'create'" (click)="openDialog()">
        <mat-icon>add</mat-icon> Nuevo Rol
      </button>
    </app-page-header>

    <app-data-table
      [columns]="columns"
      [data]="roles()"
      [actions]="actions"
      (onAction)="handleAction($event)">
    </app-data-table>
  `,
})
export class RolesComponent implements OnInit {
  private http = inject(HttpClient);
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private notification = inject(NotificationService);
  private permissionService = inject(PermissionService);

  roles = signal<RoleWithPermissions[]>([]);

  columns: TableColumn[] = [
    { key: 'name', label: 'Nombre', sortable: true },
    { key: 'displayName', label: 'Nombre a Mostrar', sortable: true },
    { key: 'isSystem', label: 'Sistema', type: 'boolean' },
    { key: 'isActive', label: 'Activo', type: 'boolean' },
    { key: '_count.users', label: 'Usuarios', sortable: true },
    { key: 'actions', label: 'Acciones', type: 'actions', sortable: false },
  ];

  actions: TableAction[] = [
    { icon: 'edit', tooltip: 'Editar', action: 'edit', color: 'primary' },
    { icon: 'security', tooltip: 'Gestionar Permisos', action: 'permissions', color: 'accent' },
    { icon: 'delete', tooltip: 'Eliminar', action: 'delete', color: 'warn' },
  ];

  async ngOnInit(): Promise<void> {
    await this.permissionService.loadPagePermissions('roles');
    this.loadRoles();
  }

  async loadRoles(): Promise<void> {
    try {
      const res = await firstValueFrom(
        this.http.get<ApiResponse<RoleWithPermissions[]>>('/api/roles')
      );
      this.roles.set(res.data);
    } catch {
      this.notification.error('Error al cargar los roles');
    }
  }

  openDialog(role?: RoleWithPermissions): void {
    const dialogRef = this.dialog.open(RoleDialogComponent, {
      data: role || null,
      width: '500px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (role) {
          this.updateRole(role.id, result);
        } else {
          this.createRole(result);
        }
      }
    });
  }

  openPermissionsPage(role: RoleWithPermissions): void {
    this.router.navigate(['/admin/roles', role.id, 'permissions']);
  }

  handleAction(event: { action: string; row: RoleWithPermissions }): void {
    switch (event.action) {
      case 'edit':
        this.openDialog(event.row);
        break;
      case 'permissions':
        this.openPermissionsPage(event.row);
        break;
      case 'delete':
        this.confirmDelete(event.row);
        break;
    }
  }

  private confirmDelete(role: RoleWithPermissions): void {
    if (role.isSystem) {
      this.notification.warning('Los roles del sistema no pueden ser eliminados');
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar Rol',
        message: `¿Estás seguro de que deseas eliminar el rol "${role.displayName}"? Este rol tiene ${role._count?.users || 0} usuarios asignados.`,
        confirmText: 'Eliminar',
      } as ConfirmDialogData,
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.deleteRole(role.id);
      }
    });
  }

  private async createRole(data: Partial<RoleWithPermissions>): Promise<void> {
    try {
      await firstValueFrom(this.http.post('/api/roles', data));
      this.notification.success('Rol creado exitosamente');
      this.loadRoles();
    } catch {
      this.notification.error('Error al crear el rol');
    }
  }

  private async updateRole(id: number, data: Partial<RoleWithPermissions>): Promise<void> {
    try {
      await firstValueFrom(this.http.put(`/api/roles/${id}`, data));
      this.notification.success('Rol actualizado exitosamente');
      this.loadRoles();
    } catch {
      this.notification.error('Error al actualizar el rol');
    }
  }

  private async deleteRole(id: number): Promise<void> {
    try {
      await firstValueFrom(this.http.delete(`/api/roles/${id}`));
      this.notification.success('Rol eliminado exitosamente');
      this.loadRoles();
    } catch {
      this.notification.error('Error al eliminar el rol');
    }
  }
}
