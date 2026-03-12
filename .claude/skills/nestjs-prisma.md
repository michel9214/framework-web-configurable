# NestJS + Prisma Conventions

## File Structure
- One module per feature: `module/`, `controller/`, `service/`, `dto/`
- kebab-case file names: `user.service.ts`, `create-user.dto.ts`
- PascalCase for classes: `UserService`, `CreateUserDto`

## NestJS Patterns
- Use `@Module()` with proper imports/exports
- Controllers handle HTTP, services handle business logic
- Use `class-validator` decorators on all DTOs
- Global validation pipe with `whitelist: true, transform: true`
- Standard response interceptor: `{ data, message, statusCode }`
- Global exception filter for consistent error responses

## Prisma Patterns
- `PrismaService` extends `PrismaClient` with `onModuleInit`
- `PrismaModule` is `@Global()` — available everywhere
- Use transactions for multi-table writes: `prisma.$transaction()`
- Soft delete pattern: `isActive: false` (not actual deletion)
- Always select only needed fields in queries

## Auth Patterns
- `JwtAuthGuard` as global guard via `APP_GUARD`
- `@Public()` decorator to skip auth
- JWT payload: `{ sub: userId, email, roleId, isSystem }`
- Access token: 15min, Refresh token: 7d
- Refresh tokens stored in DB, revocable

## Permission Patterns
- `PermissionGuard` as global guard (after JwtAuthGuard)
- `@RequiresPermission(pageCode)` for page-level access
- `@RequiresPermission(pageCode, resourceCode)` for resource-level
- `isSystem: true` roles bypass all permission checks
