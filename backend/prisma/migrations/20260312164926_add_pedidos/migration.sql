-- CreateTable
CREATE TABLE "pedidos" (
    "id" SERIAL NOT NULL,
    "numero" TEXT NOT NULL,
    "cliente" TEXT NOT NULL,
    "observaciones" TEXT,
    "total" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pedidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedido_items" (
    "id" SERIAL NOT NULL,
    "pedidoId" INTEGER NOT NULL,
    "descripcion" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precioUnitario" DOUBLE PRECISION NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "pedido_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pedidos_numero_key" ON "pedidos"("numero");

-- AddForeignKey
ALTER TABLE "pedido_items" ADD CONSTRAINT "pedido_items_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "pedidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
