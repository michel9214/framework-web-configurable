import { Component, inject, signal, ViewChild, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AuthService } from '../core/services/auth.service';
import { MenuService } from '../core/services/menu.service';
import { ThemeService } from '../core/services/theme.service';
import { Theme } from '../core/models/interfaces';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
    MatTooltipModule,
    MatProgressBarModule,
  ],
  template: `
    <mat-sidenav-container class="layout-container">
      <mat-sidenav #sidenav mode="side" [opened]="sidenavOpened()" class="sidenav">
        <div class="sidenav-header">
          <mat-icon>widgets</mat-icon>
          <span>Framework</span>
        </div>
        <mat-nav-list>
          @for (module of menuService.menuItems(); track module.id) {
            <div class="module-group">
              <div class="module-label">
                <mat-icon>{{ module.icon }}</mat-icon>
                <span>{{ module.displayName }}</span>
              </div>
              @for (page of module.pages; track page.id) {
                <ng-container *ngTemplateOutlet="menuItem; context: { $implicit: page, depth: 0 }"></ng-container>
              }
            </div>
          }
        </mat-nav-list>

        <!-- Template recursivo para items del menú -->
        <ng-template #menuItem let-page let-depth="depth">
          <div class="nav-item-row" [style.paddingLeft.px]="depth * 12">
            <a mat-list-item
               [routerLink]="page.route"
               routerLinkActive="active-link"
               class="nav-link"
               [class.is-child]="depth > 0">
              <mat-icon matListItemIcon [class.child-icon]="depth > 0">{{ page.icon }}</mat-icon>
              <span matListItemTitle>{{ page.displayName }}</span>
            </a>
            @if (page.children?.length > 0) {
              <button mat-icon-button class="expand-btn" (click)="toggleExpand(page.id)">
                <mat-icon>{{ isExpanded(page.id) ? 'expand_less' : 'expand_more' }}</mat-icon>
              </button>
            }
          </div>
          @if (page.children?.length > 0 && isExpanded(page.id)) {
            <div class="children-block" [style.marginLeft.px]="depth * 12 + 16">
              @for (child of page.children; track child.id) {
                <ng-container *ngTemplateOutlet="menuItem; context: { $implicit: child, depth: depth + 1 }"></ng-container>
              }
            </div>
          }
        </ng-template>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar color="primary" class="toolbar">
          <button mat-icon-button (click)="sidenavOpened.set(!sidenavOpened())">
            <mat-icon>menu</mat-icon>
          </button>
          <span class="toolbar-title">Framework</span>
          <span class="toolbar-spacer"></span>

          <!-- Theme Switcher -->
          <button mat-icon-button [matMenuTriggerFor]="themeMenu" matTooltip="Cambiar Tema">
            <mat-icon>palette</mat-icon>
          </button>
          <mat-menu #themeMenu="matMenu">
            @for (theme of themeService.themes(); track theme.id) {
              <button mat-menu-item (click)="switchTheme(theme)">
                <span class="theme-dot" [style.background]="theme.primary"></span>
                {{ theme.displayName }}
              </button>
            }
          </mat-menu>

          <!-- User Menu -->
          <button mat-icon-button [matMenuTriggerFor]="userMenu">
            <mat-icon>account_circle</mat-icon>
          </button>
          <mat-menu #userMenu="matMenu">
            <div class="user-info" mat-menu-item disabled>
              <strong>{{ authService.currentUser()?.firstName }} {{ authService.currentUser()?.lastName }}</strong>
              <br>
              <small>{{ authService.currentUser()?.email }}</small>
              <br>
              <small>{{ authService.currentUser()?.role?.displayName }}</small>
            </div>
            <mat-divider></mat-divider>
            <button mat-menu-item (click)="logout()">
              <mat-icon>exit_to_app</mat-icon>
              <span>Cerrar Sesión</span>
            </button>
          </mat-menu>
        </mat-toolbar>

        <div class="content">
          <router-outlet></router-outlet>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .layout-container {
      height: 100vh;
    }
    .sidenav {
      width: 260px;
      background: var(--theme-surface, #fff);
    }
    .sidenav-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 20px;
      font-size: 20px;
      font-weight: 500;
      border-bottom: 1px solid rgba(0,0,0,0.12);
    }
    .module-group {
      margin-bottom: 8px;
    }
    .module-label {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px 4px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      color: rgba(0,0,0,0.54);
      letter-spacing: 0.5px;
    }
    .module-label mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
    .active-link {
      background: rgba(var(--theme-primary-rgb, 63, 81, 181), 0.12) !important;
      color: var(--theme-primary, #3f51b5) !important;
    }
    .nav-item-row {
      display: flex;
      align-items: center;
    }
    .nav-item-row .nav-link {
      flex: 1;
      min-width: 0;
    }
    .nav-item-row .expand-btn {
      width: 32px;
      height: 32px;
      line-height: 32px;
      flex-shrink: 0;
      margin-right: 4px;
    }
    .nav-item-row .expand-btn mat-icon {
      font-size: 18px;
      color: rgba(0,0,0,0.4);
    }
    .children-block {
      border-left: 2px solid rgba(0,0,0,0.08);
      padding-left: 4px;
    }
    .is-child {
      font-size: 14px;
    }
    .child-icon {
      font-size: 18px !important;
      width: 18px !important;
      height: 18px !important;
      color: rgba(0,0,0,0.5);
    }
    .toolbar {
      position: sticky;
      top: 0;
      z-index: 10;
    }
    .toolbar-title {
      margin-left: 8px;
      font-size: 18px;
    }
    .toolbar-spacer {
      flex: 1;
    }
    .content {
      padding: 24px;
      background: var(--theme-background, #fafafa);
      min-height: calc(100vh - 64px);
    }
    .user-info {
      line-height: 1.5;
      white-space: normal;
    }
    .theme-dot {
      display: inline-block;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      margin-right: 8px;
      vertical-align: middle;
    }
    mat-divider {
      margin: 4px 0;
    }
  `],
})
export class MainLayoutComponent implements OnInit {
  authService = inject(AuthService);
  menuService = inject(MenuService);
  themeService = inject(ThemeService);

  sidenavOpened = signal(true);
  expandedPages = signal<Set<number>>(new Set());

  @ViewChild('sidenav') sidenav!: MatSidenav;

  private menuLoaded = false;

  constructor() {
    // React to user changes (login, session restore) to load menu/themes
    effect(() => {
      const user = this.authService.currentUser();
      if (user && !this.menuLoaded) {
        this.menuLoaded = true;
        this.loadMenuAndThemes();
      } else if (!user) {
        this.menuLoaded = false;
      }
    });
  }

  async ngOnInit(): Promise<void> {
    // Initial load if already authenticated
    if (this.authService.isAuthenticated() && this.menuService.menuItems().length === 0) {
      await this.loadMenuAndThemes();
    }
  }

  private async loadMenuAndThemes(): Promise<void> {
    try {
      await Promise.all([
        this.menuService.loadMenu(),
        this.themeService.loadThemes(),
      ]);
      this.themeService.initializeTheme(this.authService.currentUser()?.theme || null);
    } catch {
      // Silently handle - menu/themes will be empty
    }
  }

  toggleExpand(pageId: number): void {
    const current = new Set(this.expandedPages());
    if (current.has(pageId)) {
      current.delete(pageId);
    } else {
      current.add(pageId);
    }
    this.expandedPages.set(current);
  }

  isExpanded(pageId: number): boolean {
    return this.expandedPages().has(pageId);
  }

  switchTheme(theme: Theme): void {
    this.themeService.applyTheme(theme);
  }

  async logout(): Promise<void> {
    this.menuService.clearMenu();
    await this.authService.logout();
  }
}
