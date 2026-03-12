import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ApiResponse, MenuItem } from '../models/interfaces';

@Injectable({ providedIn: 'root' })
export class MenuService {
  private http = inject(HttpClient);

  menuItems = signal<MenuItem[]>([]);

  async loadMenu(): Promise<void> {
    const res = await firstValueFrom(
      this.http.get<ApiResponse<MenuItem[]>>('/api/menu')
    );
    this.menuItems.set(res.data);
  }

  clearMenu(): void {
    this.menuItems.set([]);
  }
}
