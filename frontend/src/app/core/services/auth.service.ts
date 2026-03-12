import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { TokenService } from './token.service';
import { ApiResponse, LoginResponse, User } from '../models/interfaces';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private tokenService = inject(TokenService);

  currentUser = signal<User | null>(null);
  isAuthenticated = computed(() => !!this.currentUser());
  sessionRestored = signal(0);

  async login(email: string, password: string): Promise<User> {
    const res = await firstValueFrom(
      this.http.post<ApiResponse<LoginResponse>>('/api/auth/login', { email, password })
    );
    this.tokenService.setAccessToken(res.data.accessToken);
    this.tokenService.setRefreshToken(res.data.refreshToken);
    this.currentUser.set(res.data.user);
    return res.data.user;
  }

  async refresh(): Promise<string> {
    const refreshToken = this.tokenService.getRefreshToken();
    const res = await firstValueFrom(
      this.http.post<ApiResponse<{ accessToken: string }>>('/api/auth/refresh', { refreshToken })
    );
    this.tokenService.setAccessToken(res.data.accessToken);
    return res.data.accessToken;
  }

  async loadProfile(): Promise<User> {
    const res = await firstValueFrom(
      this.http.get<ApiResponse<User>>('/api/auth/profile')
    );
    this.currentUser.set(res.data);
    return res.data;
  }

  async logout(): Promise<void> {
    const refreshToken = this.tokenService.getRefreshToken();
    try {
      await firstValueFrom(
        this.http.post('/api/auth/logout', { refreshToken })
      );
    } catch {}
    this.tokenService.clearAll();
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  async tryRestoreSession(): Promise<boolean> {
    const refreshToken = this.tokenService.getRefreshToken();
    if (!refreshToken) return false;
    try {
      await this.refresh();
      const user = await this.loadProfile();
      // Notify listeners that session was restored
      this.sessionRestored.set(this.sessionRestored() + 1);
      return true;
    } catch {
      this.tokenService.clearAll();
      return false;
    }
  }
}
