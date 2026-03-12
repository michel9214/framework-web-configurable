import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule, FormBuilder, FormArray, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { firstValueFrom } from 'rxjs';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { HasPermissionDirective } from '../../shared/directives/has-permission.directive';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { NotificationService } from '../../core/services/notification.service';
import { PermissionService } from '../../core/services/permission.service';
import { ApiResponse } from '../../core/models/interfaces';

interface PedidoItem {
  id?: number;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

interface Pedido {
  id: number;
  numero: string;
  cliente: string;
  observaciones?: string;
  total: number;
  estado: string;
  createdAt: string;
  items: PedidoItem[];
}

@Component({
  selector: 'app-pedidos',
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
    MatPaginatorModule,
    PageHeaderComponent,
    HasPermissionDirective,
  ],
  template: `
    <app-page-header title="Pedidos" subtitle="Gestión de pedidos comerciales">
      <button mat-raised-button color="primary" *hasPermission="'create'" (click)="openDialog()">
        <mat-icon>add</mat-icon> Nuevo Pedido
      </button>
    </app-page-header>

    <div class="table-container">
      <table mat-table [dataSource]="pedidos()">
        <ng-container matColumnDef="numero">
          <th mat-header-cell *matHeaderCellDef>N° Pedido</th>
          <td mat-cell *matCellDef="let row">
            <strong>{{ row.numero }}</strong>
          </td>
        </ng-container>

        <ng-container matColumnDef="cliente">
          <th mat-header-cell *matHeaderCellDef>Cliente</th>
          <td mat-cell *matCellDef="let row">{{ row.cliente }}</td>
        </ng-container>

        <ng-container matColumnDef="items">
          <th mat-header-cell *matHeaderCellDef>Items</th>
          <td mat-cell *matCellDef="let row">{{ row.items?.length || 0 }}</td>
        </ng-container>

        <ng-container matColumnDef="total">
          <th mat-header-cell *matHeaderCellDef>Total</th>
          <td mat-cell *matCellDef="let row">
            <strong>{{ row.total | number:'1.2-2' }}</strong>
          </td>
        </ng-container>

        <ng-container matColumnDef="estado">
          <th mat-header-cell *matHeaderCellDef>Estado</th>
          <td mat-cell *matCellDef="let row">
            <span class="estado-chip" [class]="'estado-' + row.estado">
              {{ row.estado }}
            </span>
          </td>
        </ng-container>

        <ng-container matColumnDef="fecha">
          <th mat-header-cell *matHeaderCellDef>Fecha</th>
          <td mat-cell *matCellDef="let row">{{ row.createdAt | date:'dd/MM/yyyy HH:mm' }}</td>
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

      @if (pedidos().length === 0) {
        <div class="empty-state">
          <mat-icon>inbox</mat-icon>
          <p>No hay pedidos registrados</p>
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

    <!-- Diálogo de Crear/Editar incrustado como ng-template -->
    <ng-template #pedidoDialog let-dialogRef="dialogRef" let-data="data">
      <h2 mat-dialog-title>{{ data.pedido ? 'Editar Pedido' : 'Nuevo Pedido' }}</h2>
      <mat-dialog-content>
        <form [formGroup]="form" class="dialog-form">
          <mat-form-field appearance="outline">
            <mat-label>Cliente</mat-label>
            <input matInput formControlName="cliente" placeholder="Nombre del cliente">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Observaciones</mat-label>
            <textarea matInput formControlName="observaciones" rows="2"></textarea>
          </mat-form-field>

          @if (!data.pedido) {
            <h3>Items del pedido</h3>
            @for (item of itemsArray.controls; track $index) {
              <div class="item-row" [formGroupName]="$index">
                <mat-form-field appearance="outline" class="item-desc">
                  <mat-label>Descripción</mat-label>
                  <input matInput formControlName="descripcion">
                </mat-form-field>
                <mat-form-field appearance="outline" class="item-num">
                  <mat-label>Cant.</mat-label>
                  <input matInput type="number" formControlName="cantidad">
                </mat-form-field>
                <mat-form-field appearance="outline" class="item-num">
                  <mat-label>Precio</mat-label>
                  <input matInput type="number" formControlName="precioUnitario">
                </mat-form-field>
                <button mat-icon-button color="warn" (click)="removeItem($index)" [disabled]="itemsArray.length <= 1">
                  <mat-icon>close</mat-icon>
                </button>
              </div>
            }
            <button mat-stroked-button type="button" (click)="addItem()">
              <mat-icon>add</mat-icon> Agregar Item
            </button>
          }

          @if (data.pedido) {
            <mat-form-field appearance="outline">
              <mat-label>Estado</mat-label>
              <input matInput formControlName="estado">
            </mat-form-field>
          }
        </form>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>Cancelar</button>
        <button mat-raised-button color="primary" (click)="save(dialogRef, data.pedido)" [disabled]="form.invalid">Guardar</button>
      </mat-dialog-actions>
    </ng-template>
  `,
  styles: [`
    .table-container {
      background: #fff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.12);
    }
    table { width: 100%; }
    .estado-chip {
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      text-transform: capitalize;
    }
    .estado-pendiente { background: #fff3e0; color: #e65100; }
    .estado-confirmado { background: #e3f2fd; color: #1565c0; }
    .estado-enviado { background: #e8f5e9; color: #2e7d32; }
    .estado-cancelado { background: #ffebee; color: #c62828; }
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
    .dialog-form {
      display: flex;
      flex-direction: column;
      min-width: 500px;
      gap: 4px;
    }
    ::ng-deep .mat-mdc-dialog-content { padding-top: 16px !important; }
    h3 { margin: 8px 0; font-size: 14px; color: rgba(0,0,0,0.6); }
    .item-row {
      display: flex;
      gap: 8px;
      align-items: flex-start;
    }
    .item-desc { flex: 3; }
    .item-num { flex: 1; }
  `],
})
export class PedidosComponent implements OnInit {
  private http = inject(HttpClient);
  private dialog = inject(MatDialog);
  private fb = inject(FormBuilder);
  private notification = inject(NotificationService);
  private permissionService = inject(PermissionService);

  pedidos = signal<Pedido[]>([]);
  totalItems = signal(0);
  currentPage = 1;
  displayedColumns = ['numero', 'cliente', 'items', 'total', 'estado', 'fecha', 'acciones'];

  form = this.fb.group({
    cliente: ['', Validators.required],
    observaciones: [''],
    estado: [''],
    items: this.fb.array([this.createItemGroup()]),
  });

  get itemsArray(): FormArray {
    return this.form.get('items') as FormArray;
  }

  async ngOnInit() {
    await this.permissionService.loadPagePermissions('pedidos');
    await this.loadData();
  }

  async loadData(page = 1) {
    try {
      const res = await firstValueFrom(
        this.http.get<ApiResponse<any>>(`/api/pedidos?page=${page}&limit=10`)
      );
      this.pedidos.set(res.data.data);
      this.totalItems.set(res.data.total);
      this.currentPage = page;
    } catch {
      this.notification.error('Error al cargar pedidos');
    }
  }

  onPage(event: PageEvent) {
    this.loadData(event.pageIndex + 1);
  }

  createItemGroup() {
    return this.fb.group({
      descripcion: ['', Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      precioUnitario: [0, [Validators.required, Validators.min(0)]],
    });
  }

  addItem() {
    this.itemsArray.push(this.createItemGroup());
  }

  removeItem(index: number) {
    this.itemsArray.removeAt(index);
  }

  openDialog(pedido?: Pedido) {
    this.form.reset();
    this.itemsArray.clear();

    if (pedido) {
      this.form.patchValue({
        cliente: pedido.cliente,
        observaciones: pedido.observaciones || '',
        estado: pedido.estado,
      });
    } else {
      this.form.patchValue({ cliente: '', observaciones: '', estado: '' });
      this.addItem();
    }

    const dialogRef = this.dialog.open(PedidoDialogWrapperComponent, {
      width: '650px',
      data: { pedido, form: this.form, component: this },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadData(this.currentPage);
    });
  }

  async save(dialogRef: any, pedido?: Pedido) {
    if (this.form.invalid) return;

    try {
      if (pedido) {
        const { cliente, observaciones, estado } = this.form.value;
        await firstValueFrom(
          this.http.put(`/api/pedidos/${pedido.id}`, { cliente, observaciones, estado })
        );
        this.notification.success('Pedido actualizado');
      } else {
        const { cliente, observaciones, items } = this.form.value;
        await firstValueFrom(
          this.http.post('/api/pedidos', { cliente, observaciones, items })
        );
        this.notification.success('Pedido creado');
      }
      dialogRef.close(true);
    } catch (e: any) {
      this.notification.error(e?.error?.message || 'Error al guardar');
    }
  }

  confirmDelete(pedido: Pedido) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar Pedido',
        message: `¿Estás seguro de eliminar el pedido ${pedido.numero}?`,
        confirmText: 'Eliminar',
      } as ConfirmDialogData,
    });

    dialogRef.afterClosed().subscribe(async confirmed => {
      if (confirmed) {
        try {
          await firstValueFrom(this.http.delete(`/api/pedidos/${pedido.id}`));
          this.notification.success('Pedido eliminado');
          await this.loadData(this.currentPage);
        } catch (e: any) {
          this.notification.error(e?.error?.message || 'Error al eliminar');
        }
      }
    });
  }
}

// ===== Wrapper Dialog Component =====
@Component({
  selector: 'app-pedido-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.pedido ? 'Editar Pedido' : 'Nuevo Pedido' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="data.form" class="dialog-form">
        <mat-form-field appearance="outline">
          <mat-label>Cliente</mat-label>
          <input matInput formControlName="cliente" placeholder="Nombre del cliente">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Observaciones</mat-label>
          <textarea matInput formControlName="observaciones" rows="2"></textarea>
        </mat-form-field>

        @if (!data.pedido) {
          <h3>Items del pedido</h3>
          <div formArrayName="items">
            @for (item of data.component.itemsArray.controls; track $index) {
              <div class="item-row" [formGroupName]="$index">
                <mat-form-field appearance="outline" class="item-desc">
                  <mat-label>Descripción</mat-label>
                  <input matInput formControlName="descripcion">
                </mat-form-field>
                <mat-form-field appearance="outline" class="item-num">
                  <mat-label>Cant.</mat-label>
                  <input matInput type="number" formControlName="cantidad">
                </mat-form-field>
                <mat-form-field appearance="outline" class="item-num">
                  <mat-label>Precio</mat-label>
                  <input matInput type="number" formControlName="precioUnitario">
                </mat-form-field>
                <button mat-icon-button color="warn" type="button" (click)="data.component.removeItem($index)"
                  [disabled]="data.component.itemsArray.length <= 1">
                  <mat-icon>close</mat-icon>
                </button>
              </div>
            }
          </div>
          <button mat-stroked-button type="button" (click)="data.component.addItem()">
            <mat-icon>add</mat-icon> Agregar Item
          </button>
        }

        @if (data.pedido) {
          <mat-form-field appearance="outline">
            <mat-label>Estado</mat-label>
            <input matInput formControlName="estado">
          </mat-form-field>
        }
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-raised-button color="primary" (click)="data.component.save(dialogRef, data.pedido)"
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
    h3 { margin: 8px 0; font-size: 14px; color: rgba(0,0,0,0.6); }
    .item-row { display: flex; gap: 8px; align-items: flex-start; }
    .item-desc { flex: 3; }
    .item-num { flex: 1; }
  `],
})
export class PedidoDialogWrapperComponent {
  dialogRef = inject(MatDialogRef<PedidoDialogWrapperComponent>);
  data = inject<any>(MAT_DIALOG_DATA);
}

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
