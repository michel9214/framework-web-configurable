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

## Quick Start (deploy & run)
When asked to "deploy", "start", or "run" the project, follow these steps:
1. Ensure `.env` exists: `cp .env.example .env` (skip if already exists)
2. Ensure Docker Desktop is running (on Windows the user must start it manually)
3. Run: `docker-compose up -d`
4. Wait for containers to be healthy: `docker ps` (db, backend, frontend should be "Up")
5. Backend auto-runs migrations and seed on startup. If seed fails (already seeded), that's OK.
6. Verify backend is ready: `docker logs framework-backend --tail 5` (should show "Found 0 errors")
7. Verify frontend is ready: `docker logs framework-frontend --tail 5` (should show "Application bundle generation complete")
8. App is ready at http://localhost:4200

If containers already exist and just need restarting: `docker-compose restart`
If something is broken: `docker-compose down && docker-compose up -d --build`

## Default Credentials
| Email | Password | Role |
|---|---|---|
| admin@framework.com | Admin123! | Administrador (system - full access) |
| supervisor@framework.com | Admin123! | Supervisor (users, roles, dashboard) |
| operator@framework.com | Admin123! | Operador (dashboard only) |
