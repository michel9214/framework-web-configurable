import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterModule, MatButtonModule, MatIconModule],
  template: `
    <div class="notfound-container">
      <mat-icon class="notfound-icon">search_off</mat-icon>
      <h1>404 - Página No Encontrada</h1>
      <p>La página que buscas no existe.</p>
      <a mat-raised-button color="primary" routerLink="/dashboard">
        <mat-icon>home</mat-icon> Volver al Panel
      </a>
    </div>
  `,
  styles: [`
    .notfound-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
      text-align: center;
    }
    .notfound-icon {
      font-size: 80px;
      width: 80px;
      height: 80px;
      color: #ff9800;
      margin-bottom: 16px;
    }
    h1 { margin-bottom: 8px; }
    p { color: rgba(0,0,0,0.54); margin-bottom: 24px; }
  `],
})
export class NotFoundComponent {}
