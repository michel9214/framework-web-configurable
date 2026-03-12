import { Directive, Input, TemplateRef, ViewContainerRef, inject, effect } from '@angular/core';
import { PermissionService } from '../../core/services/permission.service';
import { AuthService } from '../../core/services/auth.service';

@Directive({
  selector: '[hasPermission]',
  standalone: true,
})
export class HasPermissionDirective {
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);
  private permissionService = inject(PermissionService);
  private authService = inject(AuthService);

  @Input() hasPermission = '';

  private hasView = false;

  constructor() {
    effect(() => {
      // Reading these signals triggers re-evaluation when they change
      const resources = this.permissionService.resources();
      const user = this.authService.currentUser();

      const isSystem = user?.role?.isSystem === true;
      const allowed = isSystem || this.permissionService.hasPermission(this.hasPermission);

      if (allowed && !this.hasView) {
        this.viewContainer.createEmbeddedView(this.templateRef);
        this.hasView = true;
      } else if (!allowed && this.hasView) {
        this.viewContainer.clear();
        this.hasView = false;
      }
    });
  }
}
