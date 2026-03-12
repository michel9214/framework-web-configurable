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
import { firstValueFrom } from 'rxjs';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { DataTableComponent, TableColumn, TableAction } from '../../shared/components/data-table/data-table.component';
import { HasPermissionDirective } from '../../shared/directives/has-permission.directive';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { NotificationService } from '../../core/services/notification.service';
import { PermissionService } from '../../core/services/permission.service';
import { ApiResponse, User, Role, PaginatedData } from '../../core/models/interfaces';

interface UserDialogData {
  user: User | null;
  roles: Role[];
}

@Component({
  selector: 'app-user-dialog',
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
  ],
  template: `
    <h2 mat-dialog-title>{{ data.user ? 'Editar Usuario' : 'Crear Usuario' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">
        <mat-form-field appearance="outline">
          <mat-label>Correo</mat-label>
          <input matInput formControlName="email" type="email" placeholder="user@example.com">
          @if (form.get('email')?.hasError('required')) {
            <mat-error>El correo es requerido</mat-error>
          }
          @if (form.get('email')?.hasError('email')) {
            <mat-error>Formato de correo inválido</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Contraseña</mat-label>
          <input matInput formControlName="password" type="password" placeholder="Ingrese contraseña">
          @if (form.get('password')?.hasError('required')) {
            <mat-error>La contraseña es requerida</mat-error>
          }
          @if (form.get('password')?.hasError('minlength')) {
            <mat-error>La contraseña debe tener al menos 6 caracteres</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Nombre</mat-label>
          <input matInput formControlName="firstName">
          @if (form.get('firstName')?.hasError('required')) {
            <mat-error>El nombre es requerido</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Apellido</mat-label>
          <input matInput formControlName="lastName">
          @if (form.get('lastName')?.hasError('required')) {
            <mat-error>El apellido es requerido</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Rol</mat-label>
          <mat-select formControlName="roleId">
            @for (role of data.roles; track role.id) {
              <mat-option [value]="role.id">{{ role.displayName }}</mat-option>
            }
          </mat-select>
          @if (form.get('roleId')?.hasError('required')) {
            <mat-error>El rol es requerido</mat-error>
          }
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
export class UserDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<UserDialogComponent>);
  data = inject<UserDialogData>(MAT_DIALOG_DATA);

  isEdit = !!this.data.user;

  form = this.fb.group({
    email: [this.data.user?.email || '', [Validators.required, Validators.email]],
    password: ['', this.isEdit ? [Validators.minLength(6)] : [Validators.required, Validators.minLength(6)]],
    firstName: [this.data.user?.firstName || '', Validators.required],
    lastName: [this.data.user?.lastName || '', Validators.required],
    roleId: [this.data.user?.role?.id || null, Validators.required],
    isActive: [this.data.user?.isActive ?? true],
  });

  save(): void {
    if (this.form.valid) {
      const value = { ...this.form.value };
      // Don't send empty password on edit
      if (this.isEdit && !value.password) {
        delete (value as any).password;
      }
      this.dialogRef.close(value);
    }
  }
}

@Component({
  selector: 'app-users',
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
    <app-page-header title="Gestión de Usuarios" subtitle="Gestionar usuarios del sistema">
      <button mat-raised-button color="primary" *hasPermission="'create'" (click)="openDialog()">
        <mat-icon>add</mat-icon> Nuevo Usuario
      </button>
    </app-page-header>

    <app-data-table
      [columns]="columns"
      [data]="users()"
      [actions]="actions"
      [searchable]="true"
      (onAction)="handleAction($event)">
    </app-data-table>
  `,
})
export class UsersComponent implements OnInit {
  private http = inject(HttpClient);
  private dialog = inject(MatDialog);
  private notification = inject(NotificationService);
  private permissionService = inject(PermissionService);

  users = signal<User[]>([]);
  roles = signal<Role[]>([]);

  columns: TableColumn[] = [
    { key: 'email', label: 'Correo', sortable: true },
    { key: 'firstName', label: 'Nombre', sortable: true },
    { key: 'lastName', label: 'Apellido', sortable: true },
    { key: 'role.displayName', label: 'Rol', sortable: true },
    { key: 'isActive', label: 'Activo', type: 'boolean' },
    { key: 'lastLogin', label: 'Último Acceso', type: 'date', sortable: true },
    { key: 'actions', label: 'Acciones', type: 'actions', sortable: false },
  ];

  actions: TableAction[] = [
    { icon: 'edit', tooltip: 'Editar', action: 'edit', color: 'primary' },
    { icon: 'delete', tooltip: 'Eliminar', action: 'delete', color: 'warn' },
  ];

  async ngOnInit(): Promise<void> {
    await this.permissionService.loadPagePermissions('users');
    this.loadRoles();
    this.loadUsers();
  }

  async loadUsers(): Promise<void> {
    try {
      const res = await firstValueFrom(
        this.http.get<ApiResponse<PaginatedData<User> | User[]>>('/api/users')
      );
      // Handle both paginated and array responses
      const data = res.data;
      if (Array.isArray(data)) {
        this.users.set(data);
      } else {
        this.users.set(data.data);
      }
    } catch {
      this.notification.error('Error al cargar los usuarios');
    }
  }

  async loadRoles(): Promise<void> {
    try {
      const res = await firstValueFrom(
        this.http.get<ApiResponse<Role[]>>('/api/roles')
      );
      this.roles.set(res.data);
    } catch {
      this.notification.error('Error al cargar los roles');
    }
  }

  openDialog(user?: User): void {
    const dialogRef = this.dialog.open(UserDialogComponent, {
      data: { user: user || null, roles: this.roles() } as UserDialogData,
      width: '500px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (user) {
          this.updateUser((user as any).id, result);
        } else {
          this.createUser(result);
        }
      }
    });
  }

  handleAction(event: { action: string; row: User }): void {
    switch (event.action) {
      case 'edit':
        this.openDialog(event.row);
        break;
      case 'delete':
        this.confirmDelete(event.row);
        break;
    }
  }

  private confirmDelete(user: User): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar Usuario',
        message: `¿Estás seguro de que deseas eliminar al usuario "${user.email}"?`,
        confirmText: 'Eliminar',
      } as ConfirmDialogData,
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.deleteUser((user as any).id);
      }
    });
  }

  private async createUser(data: any): Promise<void> {
    try {
      await firstValueFrom(this.http.post('/api/users', data));
      this.notification.success('Usuario creado exitosamente');
      this.loadUsers();
    } catch {
      this.notification.error('Error al crear el usuario');
    }
  }

  private async updateUser(id: number, data: any): Promise<void> {
    try {
      await firstValueFrom(this.http.put(`/api/users/${id}`, data));
      this.notification.success('Usuario actualizado exitosamente');
      this.loadUsers();
    } catch {
      this.notification.error('Error al actualizar el usuario');
    }
  }

  private async deleteUser(id: number): Promise<void> {
    try {
      await firstValueFrom(this.http.delete(`/api/users/${id}`));
      this.notification.success('Usuario eliminado exitosamente');
      this.loadUsers();
    } catch {
      this.notification.error('Error al eliminar el usuario');
    }
  }
}
