import { Component, Input, Output, EventEmitter, ViewChild, AfterViewInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  type?: 'text' | 'boolean' | 'date' | 'actions';
}

export interface TableAction {
  icon: string;
  tooltip: string;
  color?: string;
  action: string;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  template: `
    @if (searchable) {
      <mat-form-field appearance="outline" class="search-field">
        <mat-label>Buscar</mat-label>
        <input matInput (keyup)="applyFilter($event)" placeholder="Buscar...">
        <mat-icon matSuffix>search</mat-icon>
      </mat-form-field>
    }

    <div class="table-container mat-elevation-z2">
      <table mat-table [dataSource]="dataSource" matSort>
        @for (col of columns; track col.key) {
          <ng-container [matColumnDef]="col.key">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>
              {{ col.label }}
            </th>
            <td mat-cell *matCellDef="let row">
              @switch (col.type) {
                @case ('boolean') {
                  <mat-icon [style.color]="row[col.key] ? '#4caf50' : '#f44336'">
                    {{ row[col.key] ? 'check_circle' : 'cancel' }}
                  </mat-icon>
                }
                @case ('date') {
                  {{ row[col.key] | date:'short' }}
                }
                @case ('actions') {
                  @for (action of actions; track action.action) {
                    <button mat-icon-button [matTooltip]="action.tooltip" [color]="action.color || 'primary'" (click)="onAction.emit({action: action.action, row: row})">
                      <mat-icon>{{ action.icon }}</mat-icon>
                    </button>
                  }
                }
                @default {
                  {{ getNestedValue(row, col.key) }}
                }
              }
            </td>
          </ng-container>
        }

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

        <tr class="no-data" *matNoDataRow>
          <td [colSpan]="columns.length">No se encontraron datos</td>
        </tr>
      </table>

      <mat-paginator [pageSizeOptions]="[5, 10, 25, 50]" [pageSize]="10" showFirstLastButtons></mat-paginator>
    </div>
  `,
  styles: [`
    .search-field {
      width: 100%;
      max-width: 400px;
      margin-bottom: 16px;
    }
    .table-container {
      border-radius: 8px;
      overflow: hidden;
    }
    table {
      width: 100%;
    }
    .no-data td {
      text-align: center;
      padding: 24px;
      color: rgba(0,0,0,0.54);
    }
  `],
})
export class DataTableComponent implements AfterViewInit, OnChanges {
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() actions: TableAction[] = [];
  @Input() searchable = true;
  @Output() onAction = new EventEmitter<{ action: string; row: any }>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource = new MatTableDataSource<any>();

  get displayedColumns(): string[] {
    return this.columns.map(c => c.key);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnChanges() {
    this.dataSource.data = this.data;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((o, p) => o?.[p], obj) ?? '';
  }
}
