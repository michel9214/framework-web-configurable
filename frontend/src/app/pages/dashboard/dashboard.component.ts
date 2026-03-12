import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatIconModule, MatButtonModule, PageHeaderComponent],
  template: `
    <app-page-header title="Panel Principal" [subtitle]="greeting()"></app-page-header>

    <div class="cards-grid">
      <mat-card class="stat-card">
        <mat-card-content>
          <div class="stat-icon" style="background: #e3f2fd;">
            <mat-icon style="color: #1565c0;">people</mat-icon>
          </div>
          <div class="stat-info">
            <h3>{{ stats().users }}</h3>
            <p>Usuarios</p>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card class="stat-card">
        <mat-card-content>
          <div class="stat-icon" style="background: #e8f5e9;">
            <mat-icon style="color: #2e7d32;">view_module</mat-icon>
          </div>
          <div class="stat-info">
            <h3>{{ stats().modules }}</h3>
            <p>Módulos</p>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card class="stat-card">
        <mat-card-content>
          <div class="stat-icon" style="background: #fff3e0;">
            <mat-icon style="color: #e65100;">security</mat-icon>
          </div>
          <div class="stat-info">
            <h3>{{ stats().roles }}</h3>
            <p>Roles</p>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card class="stat-card">
        <mat-card-content>
          <div class="stat-icon" style="background: #f3e5f5;">
            <mat-icon style="color: #7b1fa2;">article</mat-icon>
          </div>
          <div class="stat-info">
            <h3>{{ stats().pages }}</h3>
            <p>Páginas</p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>

    <div class="quick-access">
      <h2>Acceso Rápido</h2>
      <div class="quick-links">
        <a mat-raised-button routerLink="/admin/users" color="primary">
          <mat-icon>people</mat-icon> Gestionar Usuarios
        </a>
        <a mat-raised-button routerLink="/admin/roles" color="accent">
          <mat-icon>security</mat-icon> Gestionar Roles
        </a>
        <a mat-raised-button routerLink="/admin/pages-config">
          <mat-icon>view_module</mat-icon> Configurar Módulos y Páginas
        </a>
      </div>
    </div>
  `,
  styles: [`
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 16px;
      margin-bottom: 32px;
    }
    .stat-card mat-card-content {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
    }
    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .stat-icon mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }
    .stat-info h3 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .stat-info p {
      margin: 0;
      color: rgba(0,0,0,0.54);
    }
    .quick-access h2 {
      margin-bottom: 16px;
    }
    .quick-links {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }
    .quick-links a mat-icon {
      margin-right: 4px;
    }
  `],
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private http = inject(HttpClient);

  stats = signal({ users: 0, modules: 0, roles: 0, pages: 0 });
  greeting = signal('');

  ngOnInit() {
    const user = this.authService.currentUser();
    this.greeting.set(`Bienvenido de nuevo, ${user?.firstName || 'Usuario'}!`);
    this.loadStats();
  }

  private async loadStats() {
    try {
      const results = await Promise.allSettled([
        firstValueFrom(this.http.get<any>('/api/users?limit=1')),
        firstValueFrom(this.http.get<any>('/api/modules-config')),
        firstValueFrom(this.http.get<any>('/api/roles')),
      ]);

      const getValue = (r: PromiseSettledResult<any>) =>
        r.status === 'fulfilled' ? r.value : null;

      const usersRes = getValue(results[0]);
      const modulesRes = getValue(results[1]);
      const rolesRes = getValue(results[2]);

      this.stats.set({
        users: usersRes?.data?.total || usersRes?.data?.data?.length || 0,
        modules: modulesRes?.data?.length || 0,
        roles: rolesRes?.data?.length || 0,
        pages: 0,
      });
    } catch {}
  }
}
