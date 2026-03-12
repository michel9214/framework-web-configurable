import { Directive, Input, ElementRef, inject, OnInit } from '@angular/core';
import { PermissionService } from '../../core/services/permission.service';

@Directive({
  selector: '[disableIfNoPermission]',
  standalone: true,
})
export class DisableIfNoPermissionDirective implements OnInit {
  private el = inject(ElementRef);
  private permissionService = inject(PermissionService);

  @Input() disableIfNoPermission = '';

  ngOnInit(): void {
    const hasPermission = this.permissionService.hasPermission(this.disableIfNoPermission);
    if (!hasPermission) {
      this.el.nativeElement.disabled = true;
      this.el.nativeElement.style.opacity = '0.5';
      this.el.nativeElement.style.pointerEvents = 'none';
    }
  }
}
