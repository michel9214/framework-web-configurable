import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { firstValueFrom } from 'rxjs';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { HasPermissionDirective } from '../../shared/directives/has-permission.directive';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { NotificationService } from '../../core/services/notification.service';
import { PermissionService } from '../../core/services/permission.service';
import { ApiResponse } from '../../core/models/interfaces';

interface Empleado {
  id: number;
  codigo: string;
  dni: string;
  nombres: string;
  apellidos: string;
  cargo: string;
  departamento: string;
  telefono?: string;
  email?: string;
  fechaIngreso: string;
  salario: number;
  estado: string;
  observaciones?: string;
}

@Component({
  selector: 'app-personal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatTooltipModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatPaginatorModule,
    PageHeaderComponent,
    HasPermissionDirective,
  ],
  template: `
    <app-page-header title="Personal" subtitle="Gestión de empleados">
      <button mat-raised-button color="primary" *hasPermission="'create'" (click)="openDialog()">
        <mat-icon>add</mat-icon> Nuevo Empleado
      </button>
    </app-page-header>

    <div class="search-bar">
      <mat-form-field appearance="outline" class="search-field">
        <mat-label>Buscar</mat-label>
        <input matInput placeholder="Nombre, DNI, cargo, departamento..." (input)="onSearch($event)">
        <mat-icon matSuffix>search</mat-icon>
      </mat-form-field>
    </div>

    <div class="table-container">
      <table mat-table [dataSource]="empleados()">
        <ng-container matColumnDef="codigo">
          <th mat-header-cell *matHeaderCellDef>Código</th>
          <td mat-cell *matCellDef="let row">
            <strong>{{ row.codigo }}</strong>
          </td>
        </ng-container>

        <ng-container matColumnDef="dni">
          <th mat-header-cell *matHeaderCellDef>DNI</th>
          <td mat-cell *matCellDef="let row">{{ row.dni }}</td>
        </ng-container>

        <ng-container matColumnDef="nombreCompleto">
          <th mat-header-cell *matHeaderCellDef>Nombre Completo</th>
          <td mat-cell *matCellDef="let row">{{ row.apellidos }}, {{ row.nombres }}</td>
        </ng-container>

        <ng-container matColumnDef="cargo">
          <th mat-header-cell *matHeaderCellDef>Cargo</th>
          <td mat-cell *matCellDef="let row">{{ row.cargo }}</td>
        </ng-container>

        <ng-container matColumnDef="departamento">
          <th mat-header-cell *matHeaderCellDef>Departamento</th>
          <td mat-cell *matCellDef="let row">
            <span class="dept-chip">{{ row.departamento }}</span>
          </td>
        </ng-container>

        <ng-container matColumnDef="fechaIngreso">
          <th mat-header-cell *matHeaderCellDef>F. Ingreso</th>
          <td mat-cell *matCellDef="let row">{{ row.fechaIngreso | date:'dd/MM/yyyy' }}</td>
        </ng-container>

        <ng-container matColumnDef="estado">
          <th mat-header-cell *matHeaderCellDef>Estado</th>
          <td mat-cell *matCellDef="let row">
            <span class="estado-chip" [class]="'estado-' + row.estado">
              {{ row.estado }}
            </span>
          </td>
        </ng-container>

        <ng-container matColumnDef="acciones">
          <th mat-header-cell *matHeaderCellDef>Acciones</th>
          <td mat-cell *matCellDef="let row">
            <button mat-icon-button matTooltip="Editar" *hasPermission="'edit'" (click)="openDialog(row)">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-icon-button matTooltip="Eliminar" *hasPermission="'delete'" (click)="confirmDelete(row)" class="delete-btn">
              <mat-icon>delete</mat-icon>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>

      @if (empleados().length === 0) {
        <div class="empty-state">
          <mat-icon>people_outline</mat-icon>
          <p>No hay empleados registrados</p>
        </div>
      }

      <mat-paginator
        [length]="totalItems()"
        [pageSize]="10"
        [pageSizeOptions]="[5, 10, 25]"
        (page)="onPage($event)"
        showFirstLastButtons>
      </mat-paginator>
    </div>
  `,
  styles: [`
    .search-bar {
      margin-bottom: 16px;
    }
    .search-field {
      width: 100%;
      max-width: 400px;
    }
    .table-container {
      background: #fff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.12);
    }
    table { width: 100%; }
    .dept-chip {
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      background: color-mix(in srgb, var(--theme-primary, #3f51b5) 12%, transparent);
      color: var(--theme-primary, #3f51b5);
    }
    .estado-chip {
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      text-transform: capitalize;
    }
    .estado-activo { background: #e8f5e9; color: #2e7d32; }
    .estado-inactivo { background: #ffebee; color: #c62828; }
    .estado-vacaciones { background: #e3f2fd; color: #1565c0; }
    .estado-licencia { background: #fff3e0; color: #e65100; }
    .delete-btn mat-icon { color: rgba(0,0,0,0.38); }
    .delete-btn:hover mat-icon { color: #f44336; }
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px;
      color: rgba(0,0,0,0.38);
    }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: 8px; }
  `],
})
export class PersonalComponent implements OnInit {
  private http = inject(HttpClient);
  private dialog = inject(MatDialog);
  private fb = inject(FormBuilder);
  private notification = inject(NotificationService);
  private permissionService = inject(PermissionService);

  empleados = signal<Empleado[]>([]);
  totalItems = signal(0);
  currentPage = 1;
  searchTerm = '';
  displayedColumns = ['codigo', 'dni', 'nombreCompleto', 'cargo', 'departamento', 'fechaIngreso', 'estado', 'acciones'];

  form = this.fb.group({
    dni: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(15)]],
    nombres: ['', Validators.required],
    apellidos: ['', Validators.required],
    cargo: ['', Validators.required],
    departamento: ['', Validators.required],
    telefono: [''],
    email: [''],
    fechaIngreso: ['', Validators.required],
    salario: [0],
    estado: ['activo'],
    observaciones: [''],
  });

  async ngOnInit() {
    await this.permissionService.loadPagePermissions('personal');
    await this.loadData();
  }

  async loadData(page = 1) {
    try {
      const search = this.searchTerm ? `&search=${this.searchTerm}` : '';
      const res = await firstValueFrom(
        this.http.get<ApiResponse<any>>(`/api/personal?page=${page}&limit=10${search}`)
      );
      this.empleados.set(res.data.data);
      this.totalItems.set(res.data.total);
      this.currentPage = page;
    } catch {
      this.notification.error('Error al cargar personal');
    }
  }

  onPage(event: PageEvent) {
    this.loadData(event.pageIndex + 1);
  }

  onSearch(event: Event) {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.loadData(1);
  }

  openDialog(empleado?: Empleado) {
    this.form.reset({ estado: 'activo', salario: 0 });

    if (empleado) {
      this.form.patchValue({
        ...empleado,
        fechaIngreso: empleado.fechaIngreso.split('T')[0],
      });
    }

    const dialogRef = this.dialog.open(EmpleadoDialogComponent, {
      width: '600px',
      data: { empleado, form: this.form, component: this },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadData(this.currentPage);
    });
  }

  async save(dialogRef: any, empleado?: Empleado) {
    if (this.form.invalid) return;

    try {
      const values = this.form.value;
      if (empleado) {
        await firstValueFrom(
          this.http.put(`/api/personal/${empleado.id}`, values)
        );
        this.notification.success('Empleado actualizado');
      } else {
        await firstValueFrom(
          this.http.post('/api/personal', values)
        );
        this.notification.success('Empleado creado');
      }
      dialogRef.close(true);
    } catch (e: any) {
      this.notification.error(e?.error?.message || 'Error al guardar');
    }
  }

  confirmDelete(empleado: Empleado) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar Empleado',
        message: `¿Estás seguro de eliminar a ${empleado.nombres} ${empleado.apellidos} (${empleado.codigo})?`,
        confirmText: 'Eliminar',
      } as ConfirmDialogData,
    });

    dialogRef.afterClosed().subscribe(async confirmed => {
      if (confirmed) {
        try {
          await firstValueFrom(this.http.delete(`/api/personal/${empleado.id}`));
          this.notification.success('Empleado eliminado');
          await this.loadData(this.currentPage);
        } catch (e: any) {
          this.notification.error(e?.error?.message || 'Error al eliminar');
        }
      }
    });
  }
}

// ===== Dialog Component =====
@Component({
  selector: 'app-empleado-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.empleado ? 'Editar Empleado' : 'Nuevo Empleado' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="data.form" class="dialog-form">
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>DNI</mat-label>
            <input matInput formControlName="dni" placeholder="Documento de identidad">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Fecha de Ingreso</mat-label>
            <input matInput formControlName="fechaIngreso" type="date">
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Nombres</mat-label>
            <input matInput formControlName="nombres">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Apellidos</mat-label>
            <input matInput formControlName="apellidos">
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Cargo</mat-label>
            <input matInput formControlName="cargo">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Departamento</mat-label>
            <input matInput formControlName="departamento">
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Teléfono</mat-label>
            <input matInput formControlName="telefono">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput formControlName="email" type="email">
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Salario</mat-label>
            <input matInput formControlName="salario" type="number">
          </mat-form-field>
          @if (data.empleado) {
            <mat-form-field appearance="outline">
              <mat-label>Estado</mat-label>
              <mat-select formControlName="estado">
                <mat-option value="activo">Activo</mat-option>
                <mat-option value="inactivo">Inactivo</mat-option>
                <mat-option value="vacaciones">Vacaciones</mat-option>
                <mat-option value="licencia">Licencia</mat-option>
              </mat-select>
            </mat-form-field>
          }
        </div>

        <mat-form-field appearance="outline">
          <mat-label>Observaciones</mat-label>
          <textarea matInput formControlName="observaciones" rows="2"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-raised-button color="primary" (click)="data.component.save(dialogRef, data.empleado)"
        [disabled]="data.form.invalid">Guardar</button>
    </mat-dialog-actions>
  `,
  styles: [`
    ::ng-deep .mat-mdc-dialog-content { padding-top: 16px !important; }
    .dialog-form {
      display: flex;
      flex-direction: column;
      min-width: 500px;
      gap: 4px;
    }
    .form-row {
      display: flex;
      gap: 12px;
    }
    .form-row mat-form-field {
      flex: 1;
    }
  `],
})
export class EmpleadoDialogComponent {
  dialogRef = inject(MatDialogRef<EmpleadoDialogComponent>);
  data = inject<any>(MAT_DIALOG_DATA);
}
