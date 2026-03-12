-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('BUTTON', 'ACTION', 'SECTION', 'FIELD');

-- CreateTable
CREATE TABLE "themes" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "cssClass" TEXT NOT NULL,
    "primary" TEXT NOT NULL,
    "secondary" TEXT NOT NULL,
    "accent" TEXT NOT NULL,
    "background" TEXT NOT NULL,
    "surface" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "themes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modules" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT NOT NULL DEFAULT 'folder',
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pages" (
    "id" SERIAL NOT NULL,
    "moduleId" INTEGER NOT NULL,
    "parentPageId" INTEGER,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT 'description',
    "order" INTEGER NOT NULL DEFAULT 0,
    "visibleInMenu" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resources" (
    "id" SERIAL NOT NULL,
    "pageId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "ResourceType" NOT NULL DEFAULT 'BUTTON',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_page_permissions" (
    "id" SERIAL NOT NULL,
    "roleId" INTEGER NOT NULL,
    "pageId" INTEGER NOT NULL,
    "canAccess" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "role_page_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_resource_permissions" (
    "id" SERIAL NOT NULL,
    "roleId" INTEGER NOT NULL,
    "resourceId" INTEGER NOT NULL,
    "isAllowed" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "role_resource_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "roleId" INTEGER NOT NULL,
    "themeId" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "themes_name_key" ON "themes"("name");

-- CreateIndex
CREATE UNIQUE INDEX "modules_name_key" ON "modules"("name");

-- CreateIndex
CREATE UNIQUE INDEX "pages_name_key" ON "pages"("name");

-- CreateIndex
CREATE UNIQUE INDEX "resources_pageId_code_key" ON "resources"("pageId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "role_page_permissions_roleId_pageId_key" ON "role_page_permissions"("roleId", "pageId");

-- CreateIndex
CREATE UNIQUE INDEX "role_resource_permissions_roleId_resourceId_key" ON "role_resource_permissions"("roleId", "resourceId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- AddForeignKey
ALTER TABLE "pages" ADD CONSTRAINT "pages_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pages" ADD CONSTRAINT "pages_parentPageId_fkey" FOREIGN KEY ("parentPageId") REFERENCES "pages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resources" ADD CONSTRAINT "resources_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_page_permissions" ADD CONSTRAINT "role_page_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_page_permissions" ADD CONSTRAINT "role_page_permissions_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_resource_permissions" ADD CONSTRAINT "role_resource_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_resource_permissions" ADD CONSTRAINT "role_resource_permissions_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "themes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
