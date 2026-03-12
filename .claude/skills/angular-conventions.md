# Angular 18+ Conventions

## Component Style
- Always standalone components: `standalone: true`
- Use `inject()` instead of constructor injection
- Use signals for state: `signal()`, `computed()`, `effect()`
- Functional guards and interceptors (not class-based)
- Lazy-loaded routes with `loadComponent` / `loadChildren`

## File Naming
- kebab-case: `user-list.component.ts`
- Components: `*.component.ts/html/scss`
- Services: `*.service.ts`
- Guards: `*.guard.ts`
- Interceptors: `*.interceptor.ts`
- Directives: `*.directive.ts`

## Project Structure
```
src/app/
├── core/           # Singleton services, interceptors, guards
│   ├── services/   # AuthService, MenuService, ThemeService, PermissionService
│   ├── interceptors/
│   └── guards/
├── shared/         # Reusable components, directives, pipes
│   ├── components/ # DataTable, PageHeader, ConfirmDialog
│   └── directives/ # hasPermission, disableIfNoPermission
├── auth/           # Login component
├── layout/         # MainLayout, Sidebar, Toolbar, ThemeSwitcher
├── admin/          # Administration module (modules, pages, roles, users, themes)
└── pages/          # Dashboard, 404, AccessDenied
```

## Angular Material
- Import only needed Material modules in each component
- Use mat-form-field with appearance="outline"
- Use mat-snack-bar via NotificationService wrapper
- Responsive sidenav with mat-sidenav-container

## State Management
- Signals for local/service state (no NgRx)
- TokenService: access token in signal, refresh in localStorage
- MenuService: menu items in signal, loaded from API
- PermissionService: page permissions in signal

## Theming
- CSS custom properties on :root
- Theme bridge SCSS for Angular Material integration
- Smooth transitions between themes
