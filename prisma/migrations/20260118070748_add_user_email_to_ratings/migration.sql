/*
  Warnings:

  - A unique constraint covering the columns `[userEmail,githubProfileId]` on the table `Rating` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userEmail` to the `Rating` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Rating" ADD COLUMN     "userEmail" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Rating_userEmail_githubProfileId_key" ON "Rating"("userEmail", "githubProfileId");
