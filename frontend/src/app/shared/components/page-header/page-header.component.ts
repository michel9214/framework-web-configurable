import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="page-header">
      <div class="header-text">
        <h1>{{ title }}</h1>
        @if (subtitle) {
          <p class="subtitle">{{ subtitle }}</p>
        }
      </div>
      <div class="header-actions">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 500;
    }
    .subtitle {
      margin: 4px 0 0;
      color: rgba(0,0,0,0.54);
      font-size: 14px;
    }
    .header-actions {
      display: flex;
      gap: 8px;
    }
  `],
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() subtitle = '';
}
