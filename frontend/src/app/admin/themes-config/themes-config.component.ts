import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
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
import { ApiResponse, Theme } from '../../core/models/interfaces';

@Component({
  selector: 'app-theme-dialog',
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
    <h2 mat-dialog-title>{{ data ? 'Editar Tema' : 'Crear Tema' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">
        <mat-form-field appearance="outline">
          <mat-label>Nombre</mat-label>
          <input matInput formControlName="name" placeholder="theme-name">
          @if (form.get('name')?.hasError('required')) {
            <mat-error>El nombre es requerido</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Nombre a Mostrar</mat-label>
          <input matInput formControlName="displayName" placeholder="Theme Name">
          @if (form.get('displayName')?.hasError('required')) {
            <mat-error>El nombre a mostrar es requerido</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Clase CSS</mat-label>
          <input matInput formControlName="cssClass" placeholder="theme-class">
        </mat-form-field>

        <div class="color-row">
          <div class="color-field">
            <label>Primario</label>
            <input type="color" [value]="form.get('primary')?.value" (input)="form.get('primary')?.setValue($any($event.target).value)">
            <input matInput formControlName="primary" placeholder="#1976d2" class="color-text">
          </div>
          <div class="color-field">
            <label>Secundario</label>
            <input type="color" [value]="form.get('secondary')?.value" (input)="form.get('secondary')?.setValue($any($event.target).value)">
            <input matInput formControlName="secondary" placeholder="#424242" class="color-text">
          </div>
        </div>

        <div class="color-row">
          <div class="color-field">
            <label>Acento</label>
            <input type="color" [value]="form.get('accent')?.value" (input)="form.get('accent')?.setValue($any($event.target).value)">
            <input matInput formControlName="accent" placeholder="#ff4081" class="color-text">
          </div>
          <div class="color-field">
            <label>Fondo</label>
            <input type="color" [value]="form.get('background')?.value" (input)="form.get('background')?.setValue($any($event.target).value)">
            <input matInput formControlName="background" placeholder="#fafafa" class="color-text">
          </div>
        </div>

        <div class="color-row">
          <div class="color-field">
            <label>Superficie</label>
            <input type="color" [value]="form.get('surface')?.value" (input)="form.get('surface')?.setValue($any($event.target).value)">
            <input matInput formControlName="surface" placeholder="#ffffff" class="color-text">
          </div>
          <div class="color-field">
            <label>Texto</label>
            <input type="color" [value]="form.get('text')?.value" (input)="form.get('text')?.setValue($any($event.target).value)">
            <input matInput formControlName="text" placeholder="#212121" class="color-text">
          </div>
        </div>

        <mat-slide-toggle formControlName="isDefault">Tema Predeterminado</mat-slide-toggle>
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
      min-width: 450px;
      gap: 4px;
    }
    .color-row {
      display: flex;
      gap: 16px;
      margin-bottom: 12px;
    }
    .color-field {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .color-field label {
      font-size: 13px;
      color: rgba(0,0,0,0.6);
      min-width: 70px;
    }
    .color-field input[type="color"] {
      width: 36px;
      height: 36px;
      border: 1px solid #ccc;
      border-radius: 4px;
      padding: 2px;
      cursor: pointer;
    }
    .color-text {
      flex: 1;
      border: 1px solid #ccc;
      border-radius: 4px;
      padding: 6px 8px;
      font-size: 13px;
      font-family: monospace;
    }
  `],
})
export class ThemeDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<ThemeDialogComponent>);
  data = inject<Theme | null>(MAT_DIALOG_DATA);

  form = this.fb.group({
    name: [this.data?.name || '', Validators.required],
    displayName: [this.data?.displayName || '', Validators.required],
    cssClass: [this.data?.cssClass || ''],
    primary: [this.data?.primary || '#1976d2'],
    secondary: [this.data?.secondary || '#424242'],
    accent: [this.data?.accent || '#ff4081'],
    background: [this.data?.background || '#fafafa'],
    surface: [this.data?.surface || '#ffffff'],
    text: [this.data?.text || '#212121'],
    isDefault: [this.data?.isDefault ?? false],
    isActive: [this.data?.isActive ?? true],
  });

  save(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}

@Component({
  selector: 'app-themes-config',
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
    <app-page-header title="Configuración de Temas" subtitle="Gestionar temas de la aplicación">
      <button mat-raised-button color="primary" *hasPermission="'create'" (click)="openDialog()">
        <mat-icon>add</mat-icon> Nuevo Tema
      </button>
    </app-page-header>

    <app-data-table
      [columns]="columns"
      [data]="themes()"
      [actions]="actions"
      (onAction)="handleAction($event)">
    </app-data-table>
  `,
  styles: [`
    :host ::ng-deep .color-dot {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: inline-block;
      border: 2px solid #e0e0e0;
    }
  `],
})
export class ThemesConfigComponent implements OnInit {
  private http = inject(HttpClient);
  private dialog = inject(MatDialog);
  private notification = inject(NotificationService);
  private permissionService = inject(PermissionService);

  themes = signal<Theme[]>([]);

  columns: TableColumn[] = [
    { key: 'name', label: 'Nombre', sortable: true },
    { key: 'displayName', label: 'Nombre a Mostrar', sortable: true },
    { key: 'primary', label: 'Primario' },
    { key: 'isDefault', label: 'Predeterminado', type: 'boolean' },
    { key: 'isActive', label: 'Activo', type: 'boolean' },
    { key: 'actions', label: 'Acciones', type: 'actions', sortable: false },
  ];

  actions: TableAction[] = [
    { icon: 'edit', tooltip: 'Editar', action: 'edit', color: 'primary' },
    { icon: 'delete', tooltip: 'Eliminar', action: 'delete', color: 'warn' },
  ];

  async ngOnInit(): Promise<void> {
    await this.permissionService.loadPagePermissions('themes-config');
    this.loadThemes();
  }

  async loadThemes(): Promise<void> {
    try {
      const res = await firstValueFrom(
        this.http.get<ApiResponse<Theme[]>>('/api/themes/admin')
      );
      this.themes.set(res.data);
    } catch {
      this.notification.error('Error al cargar los temas');
    }
  }

  openDialog(theme?: Theme): void {
    const dialogRef = this.dialog.open(ThemeDialogComponent, {
      data: theme || null,
      width: '600px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (theme) {
          this.updateTheme(theme.id, result);
        } else {
          this.createTheme(result);
        }
      }
    });
  }

  handleAction(event: { action: string; row: Theme }): void {
    switch (event.action) {
      case 'edit':
        this.openDialog(event.row);
        break;
      case 'delete':
        this.confirmDelete(event.row);
        break;
    }
  }

  private confirmDelete(theme: Theme): void {
    if (theme.isDefault) {
      this.notification.warning('El tema predeterminado no puede ser eliminado');
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar Tema',
        message: `¿Estás seguro de que deseas eliminar el tema "${theme.displayName}"?`,
        confirmText: 'Eliminar',
      } as ConfirmDialogData,
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.deleteTheme(theme.id);
      }
    });
  }

  private async createTheme(data: Partial<Theme>): Promise<void> {
    try {
      await firstValueFrom(this.http.post('/api/themes', data));
      this.notification.success('Tema creado exitosamente');
      this.loadThemes();
    } catch {
      this.notification.error('Error al crear el tema');
    }
  }

  private async updateTheme(id: number, data: Partial<Theme>): Promise<void> {
    try {
      await firstValueFrom(this.http.put(`/api/themes/${id}`, data));
      this.notification.success('Tema actualizado exitosamente');
      this.loadThemes();
    } catch {
      this.notification.error('Error al actualizar el tema');
    }
  }

  private async deleteTheme(id: number): Promise<void> {
    try {
      await firstValueFrom(this.http.delete(`/api/themes/${id}`));
      this.notification.success('Tema eliminado exitosamente');
      this.loadThemes();
    } catch {
      this.notification.error('Error al eliminar el tema');
    }
  }
}
