.PHONY: up down logs seed migrate studio reset

up:
	docker-compose up -d

down:
	docker-compose down

logs:
	docker-compose logs -f

logs-backend:
	docker-compose logs -f backend

logs-frontend:
	docker-compose logs -f frontend

seed:
	docker-compose exec backend npx prisma db seed

migrate:
	docker-compose exec backend npx prisma migrate dev

studio:
	docker-compose exec backend npx prisma studio

reset:
	docker-compose exec backend npx prisma migrate reset --force

restart:
	docker-compose restart backend frontend

rebuild:
	docker-compose up -d --build --force-recreate
