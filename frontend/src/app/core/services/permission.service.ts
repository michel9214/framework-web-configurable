import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ApiResponse, PageResource } from '../models/interfaces';

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private http = inject(HttpClient);

  private currentPageCode = signal<string>('');
  private pageResources = signal<PageResource[]>([]);

  // Expose as readonly signal for reactive directives
  resources = computed(() => this.pageResources());

  async loadPagePermissions(pageCode: string, forceReload = false): Promise<void> {
    if (!forceReload && this.currentPageCode() === pageCode && this.pageResources().length > 0) {
      return;
    }
    this.currentPageCode.set(pageCode);
    try {
      const res = await firstValueFrom(
        this.http.get<ApiResponse<PageResource[]>>(`/api/permissions/page/${pageCode}`)
      );
      this.pageResources.set(res.data);
    } catch {
      this.pageResources.set([]);
    }
  }

  hasPermission(resourceCode: string): boolean {
    const resource = this.pageResources().find(r => r.code === resourceCode);
    return resource?.isAllowed ?? false;
  }

  getResources(): PageResource[] {
    return this.pageResources();
  }

  clearPermissions(): void {
    this.currentPageCode.set('');
    this.pageResources.set([]);
  }
}
