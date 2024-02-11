/*
  Warnings:

  - You are about to drop the `pool` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `pool_option` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "pool_option" DROP CONSTRAINT "pool_option_poolId_fkey";

-- DropTable
DROP TABLE "pool";

-- DropTable
DROP TABLE "pool_option";

-- CreateTable
CREATE TABLE "poll" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "poll_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "poll_option" (
    "id" TEXT NOT NULL,
    "poolId" TEXT NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "poll_option_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "poll_option" ADD CONSTRAINT "poll_option_poolId_fkey" FOREIGN KEY ("poolId") REFERENCES "poll"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
