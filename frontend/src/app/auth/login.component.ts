import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../core/services/auth.service';
import { MenuService } from '../core/services/menu.service';
import { ThemeService } from '../core/services/theme.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon class="login-icon">lock</mat-icon>
            Inicio de Sesión
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Correo electrónico</mat-label>
              <input matInput formControlName="email" type="email" placeholder="admin@framework.com">
              @if (form.get('email')?.hasError('required') && form.get('email')?.touched) {
                <mat-error>El correo es requerido</mat-error>
              }
              @if (form.get('email')?.hasError('email') && form.get('email')?.touched) {
                <mat-error>Formato de correo inválido</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Contraseña</mat-label>
              <input matInput formControlName="password" [type]="hidePassword() ? 'password' : 'text'">
              <button mat-icon-button matSuffix type="button" (click)="hidePassword.set(!hidePassword())">
                <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (form.get('password')?.hasError('required') && form.get('password')?.touched) {
                <mat-error>La contraseña es requerida</mat-error>
              }
            </mat-form-field>

            @if (errorMessage()) {
              <div class="error-message">{{ errorMessage() }}</div>
            }

            <button mat-raised-button color="primary" type="submit" class="full-width login-btn" [disabled]="loading()">
              @if (loading()) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                Iniciar Sesión
              }
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background: var(--theme-background, #fafafa);
    }
    .login-card {
      width: 400px;
      max-width: 90vw;
      padding: 24px;
    }
    mat-card-header {
      justify-content: center;
      margin-bottom: 24px;
    }
    mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 24px;
    }
    .login-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }
    .full-width {
      width: 100%;
    }
    .login-btn {
      margin-top: 16px;
      height: 48px;
    }
    .error-message {
      color: #f44336;
      text-align: center;
      margin: 8px 0;
      font-size: 14px;
    }
    mat-spinner {
      display: inline-block;
    }
  `],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private menuService = inject(MenuService);
  private themeService = inject(ThemeService);
  private router = inject(Router);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  loading = signal(false);
  errorMessage = signal('');
  hidePassword = signal(true);

  async onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    try {
      const { email, password } = this.form.value;
      const user = await this.authService.login(email!, password!);
      await this.menuService.loadMenu();
      await this.themeService.loadThemes();
      this.themeService.initializeTheme(user.theme);
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      this.errorMessage.set(
        error?.error?.message || 'Error al iniciar sesión. Verifica tus credenciales.'
      );
    } finally {
      this.loading.set(false);
    }
  }
}
