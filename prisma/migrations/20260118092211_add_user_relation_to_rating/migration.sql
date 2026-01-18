/*
  Warnings:

  - A unique constraint covering the columns `[userId,githubProfileId]` on the table `Rating` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Rating` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Rating_userEmail_githubProfileId_key";

-- AlterTable
ALTER TABLE "Rating" ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Rating_userId_githubProfileId_key" ON "Rating"("userId", "githubProfileId");

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
