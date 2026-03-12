# Framework Web Configurable

Full-stack configurable web framework where modules, pages, permissions, and roles are defined in the database.

## Stack

- **Frontend**: Angular 18 + Angular Material
- **Backend**: NestJS + Prisma ORM
- **Database**: PostgreSQL 16
- **Auth**: JWT (access + refresh tokens)

## Setup (3 steps)

### 1. Clone and configure

```bash
git clone <repo-url>
cd proyecto-framework
cp .env.example .env
```

### 2. Start services

```bash
docker-compose up -d
```

### 3. Run migrations and seed

```bash
make migrate
make seed
```

The app is now running:
- **Frontend**: http://localhost:4200
- **Backend**: http://localhost:3000/api
- **Database**: localhost:5432

## Default Credentials

| Email               | Password  | Role  |
| ------------------- | --------- | ----- |
| admin@framework.com | Admin123! | Admin |

## Available Commands

| Command          | Description                        |
| ---------------- | ---------------------------------- |
| `make up`        | Start all services                 |
| `make down`      | Stop all services                  |
| `make logs`      | View logs from all services        |
| `make migrate`   | Run Prisma migrations              |
| `make seed`      | Seed the database                  |
| `make studio`    | Open Prisma Studio                 |
| `make reset`     | Reset database (migrate + seed)    |
| `make restart`   | Restart backend and frontend       |
