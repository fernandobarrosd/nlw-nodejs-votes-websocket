-- CreateTable
CREATE TABLE "pool_option" (
    "id" TEXT NOT NULL,
    "poolId" TEXT NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "pool_option_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "pool_option" ADD CONSTRAINT "pool_option_poolId_fkey" FOREIGN KEY ("poolId") REFERENCES "pool"("id") ON DELETE RESTRICT ON UPDATE CASCADE;