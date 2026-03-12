import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ApiResponse, Theme } from '../models/interfaces';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private http = inject(HttpClient);

  themes = signal<Theme[]>([]);
  currentTheme = signal<Theme | null>(null);

  async loadThemes(): Promise<void> {
    const res = await firstValueFrom(
      this.http.get<ApiResponse<Theme[]>>('/api/themes')
    );
    this.themes.set(res.data);
  }

  applyTheme(theme: Theme): void {
    this.currentTheme.set(theme);
    const root = document.documentElement;
    root.style.setProperty('--theme-primary', theme.primary);
    root.style.setProperty('--theme-secondary', theme.secondary);
    root.style.setProperty('--theme-accent', theme.accent);
    root.style.setProperty('--theme-background', theme.background);
    root.style.setProperty('--theme-surface', theme.surface);
    root.style.setProperty('--theme-text', theme.text);

    // Remove all theme classes
    document.body.classList.forEach(cls => {
      if (cls.startsWith('theme-')) document.body.classList.remove(cls);
    });
    document.body.classList.add(theme.cssClass);
    localStorage.setItem('selectedTheme', theme.name);
  }

  initializeTheme(userTheme: Theme | null): void {
    const savedThemeName = localStorage.getItem('selectedTheme');
    const themes = this.themes();

    let theme = userTheme;
    if (savedThemeName) {
      theme = themes.find(t => t.name === savedThemeName) || theme;
    }
    if (!theme) {
      theme = themes.find(t => t.isDefault) || themes[0];
    }
    if (theme) {
      this.applyTheme(theme);
    }
  }

  previewTheme(theme: Theme): void {
    this.applyTheme(theme);
  }
}
