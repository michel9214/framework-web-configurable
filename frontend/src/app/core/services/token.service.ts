import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TokenService {
  private accessToken = signal<string | null>(null);

  getAccessToken(): string | null {
    return this.accessToken();
  }

  setAccessToken(token: string): void {
    this.accessToken.set(token);
  }

  clearAccessToken(): void {
    this.accessToken.set(null);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  setRefreshToken(token: string): void {
    localStorage.setItem('refreshToken', token);
  }

  clearRefreshToken(): void {
    localStorage.removeItem('refreshToken');
  }

  clearAll(): void {
    this.clearAccessToken();
    this.clearRefreshToken();
  }

  hasTokens(): boolean {
    return !!this.accessToken() && !!this.getRefreshToken();
  }
}
