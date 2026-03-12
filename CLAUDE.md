# Framework Web Configurable

## Overview
Full-stack configurable web framework where **modules, pages, permissions, and roles are defined in the database**, not hardcoded. Each new project is configured from the DB without modifying source code.

## Stack
- **Frontend**: Angular 18+ (standalone components, signals, inject())
- **Backend**: NestJS + Prisma ORM
- **Database**: PostgreSQL 16
- **Auth**: JWT (access token 15min + refresh token 7d)
- **Infrastructure**: Docker Compose for development

## Project Structure
```
/
├── backend/          # NestJS API
│   ├── prisma/       # Schema and migrations
│   └── src/
│       ├── auth/     # JWT authentication
│       ├── permissions/ # RBAC guards and services
│       ├── prisma/   # Prisma module (global)
│       └── modules/  # CRUD modules (modules, pages, resources, roles, users, themes)
├── frontend/         # Angular 18 SPA
│   └── src/app/
│       ├── core/     # Services, interceptors, guards
│       ├── shared/   # Directives, components, pipes
│       ├── auth/     # Login page
│       ├── layout/   # Main layout, sidebar, toolbar
│       ├── admin/    # Administration pages
│       └── pages/    # Dashboard, 404, access-denied
├── docker-compose.yml
├── Makefile
└── .env
```

## Key Architectural Decisions
- All API routes prefixed with `/api`
- Standard response format: `{ data, message, statusCode }`
- JwtAuthGuard is global; use `@Public()` decorator for public routes
- PermissionGuard is global; use `@RequiresPermission(pageCode, resourceCode?)` decorator
- Roles with `isSystem=true` bypass all permission checks
- Frontend uses signals for state management (no NgRx)
- Themes use CSS custom properties applied to `:root`
- Angular Material for UI components

## Database Models
Theme, Module, Page, Resource, Role, RolePagePermission, RoleResourcePermission, User, RefreshToken

## Conventions
- Backend: kebab-case file names, PascalCase classes, camelCase methods
- Frontend: kebab-case file names, standalone components, functional guards/interceptors
- All DTOs use class-validator decorators
- Prisma transactions for multi-table operations
- Lazy-loaded routes in frontend

## Docker
- PostgreSQL on port 5432
- Backend on port 3000 (hot-reload)
- Frontend on port 4200 (hot-reload)
- Named volumes for node_modules (Windows performance)

## Default Credentials
- Admin: admin@framework.com / Admin123!
