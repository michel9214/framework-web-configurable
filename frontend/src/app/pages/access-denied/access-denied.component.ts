import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-access-denied',
  standalone: true,
  imports: [RouterModule, MatButtonModule, MatIconModule],
  template: `
    <div class="denied-container">
      <mat-icon class="denied-icon">block</mat-icon>
      <h1>Acceso Denegado</h1>
      <p>No tienes permiso para acceder a esta página.</p>
      <a mat-raised-button color="primary" routerLink="/dashboard">
        <mat-icon>home</mat-icon> Volver al Panel
      </a>
    </div>
  `,
  styles: [`
    .denied-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
      text-align: center;
    }
    .denied-icon {
      font-size: 80px;
      width: 80px;
      height: 80px;
      color: #f44336;
      margin-bottom: 16px;
    }
    h1 { margin-bottom: 8px; }
    p { color: rgba(0,0,0,0.54); margin-bottom: 24px; }
  `],
})
export class AccessDeniedComponent {}
