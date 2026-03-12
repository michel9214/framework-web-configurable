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
When asked to "deploy", "start", "run", or "levantar servicios", follow ALL these steps in order:

### Step 0: Check prerequisites
1. Check if Docker is installed: `docker --version`
   - If NOT installed:
     - **Windows**: Download and install Docker Desktop silently:
       ```bash
       winget install -e --id Docker.DockerDesktop --accept-package-agreements --accept-source-agreements
       ```
       After install, tell the user to restart their PC or at minimum log out and back in (required for Docker group permissions).
     - **macOS**: `brew install --cask docker`
     - **Linux**: `curl -fsSL https://get.docker.com | sh && sudo usermod -aG docker $USER`
   - If installed, continue.

2. Check if Docker daemon is running: `docker info > /dev/null 2>&1`
   - If NOT running:
     - **Windows**: Start Docker Desktop:
       ```bash
       cmd.exe /c "start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe""
       ```
       Then wait up to 60 seconds checking `docker info` every 5 seconds until it responds.
     - **macOS**: `open -a Docker` and wait similarly.
     - **Linux**: `sudo systemctl start docker`
   - If running, continue.

3. Check if docker-compose is available: `docker-compose --version || docker compose version`
   - Docker Desktop includes docker-compose. If missing on Linux: `sudo apt install docker-compose-plugin`

### Step 1: Configure environment
```bash
cp .env.example .env   # Skip if .env already exists
```

### Step 2: Start all services
```bash
docker-compose up -d
```

### Step 3: Wait and verify
1. Wait for DB to be healthy: `docker ps` — db should show "(healthy)"
2. Wait for backend to compile (up to 90 seconds):
   ```bash
   docker logs framework-backend --tail 5
   ```
   Expected: "Found 0 errors. Watching for file changes."
   Backend auto-runs migrations and seed on startup. Seed errors on re-run are OK (data already exists).
3. Wait for frontend to compile (up to 120 seconds):
   ```bash
   docker logs framework-frontend --tail 5
   ```
   Expected: "Application bundle generation complete"

### Step 4: Report to user
Tell the user:
- App is ready at **http://localhost:4200**
- Backend API at **http://localhost:3000/api**
- Login credentials (see Default Credentials below)

### Troubleshooting
- Containers exist but stopped: `docker-compose restart`
- Something is broken: `docker-compose down && docker-compose up -d --build`
- Port conflict: Check `netstat -ano | findstr :4200` (Windows) or `lsof -i :4200` (Unix) and kill the process
- Backend fails to start: Check `docker logs framework-backend` for errors

## Default Credentials
| Email | Password | Role |
|---|---|---|
| admin@framework.com | Admin123! | Administrador (system - full access) |
| supervisor@framework.com | Admin123! | Supervisor (users, roles, dashboard) |
| operator@framework.com | Admin123! | Operador (dashboard only) |
