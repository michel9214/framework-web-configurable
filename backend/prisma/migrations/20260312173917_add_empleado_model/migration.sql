-- CreateTable
CREATE TABLE "empleados" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "dni" TEXT NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "departamento" TEXT NOT NULL,
    "telefono" TEXT,
    "email" TEXT,
    "fechaIngreso" TIMESTAMP(3) NOT NULL,
    "salario" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "estado" TEXT NOT NULL DEFAULT 'activo',
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "empleados_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "empleados_codigo_key" ON "empleados"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "empleados_dni_key" ON "empleados"("dni");
