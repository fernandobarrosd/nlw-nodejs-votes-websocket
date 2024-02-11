/*
  Warnings:

  - You are about to drop the column `poolId` on the `poll_option` table. All the data in the column will be lost.
  - Added the required column `poll_id` to the `poll_option` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "poll_option" DROP CONSTRAINT "poll_option_poolId_fkey";

-- AlterTable
ALTER TABLE "poll_option" DROP COLUMN "poolId",
ADD COLUMN     "poll_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "vote" (
    "id" SERIAL NOT NULL,
    "session_id" TEXT NOT NULL,
    "poll_option_id" TEXT NOT NULL,
    "poll_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vote_session_id_poll_id_key" ON "vote"("session_id", "poll_id");

-- AddForeignKey
ALTER TABLE "poll_option" ADD CONSTRAINT "poll_option_poll_id_fkey" FOREIGN KEY ("poll_id") REFERENCES "poll"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vote" ADD CONSTRAINT "vote_poll_option_id_fkey" FOREIGN KEY ("poll_option_id") REFERENCES "poll_option"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vote" ADD CONSTRAINT "vote_poll_id_fkey" FOREIGN KEY ("poll_id") REFERENCES "poll"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
