/*
  Warnings:

  - You are about to drop the column `userId` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Rating` table. All the data in the column will be lost.
  - You are about to drop the column `avatarUrl` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[githubProfileId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `githubProfileId` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `githubProfileId` to the `Rating` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- DropForeignKey
ALTER TABLE "PullRequest" DROP CONSTRAINT "PullRequest_authorId_fkey";

-- DropForeignKey
ALTER TABLE "Rating" DROP CONSTRAINT "Rating_userId_fkey";

-- DropIndex
DROP INDEX "User_username_idx";

-- DropIndex
DROP INDEX "User_username_key";

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "userId",
ADD COLUMN     "githubProfileId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Rating" DROP COLUMN "userId",
ADD COLUMN     "githubProfileId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "avatarUrl",
DROP COLUMN "username",
ADD COLUMN     "githubProfileId" TEXT;

-- CreateTable
CREATE TABLE "GitHubProfile" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "bio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GitHubProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GitHubProfile_username_key" ON "GitHubProfile"("username");

-- CreateIndex
CREATE INDEX "GitHubProfile_username_idx" ON "GitHubProfile"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_githubProfileId_key" ON "User"("githubProfileId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_githubProfileId_fkey" FOREIGN KEY ("githubProfileId") REFERENCES "GitHubProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PullRequest" ADD CONSTRAINT "PullRequest_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "GitHubProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_githubProfileId_fkey" FOREIGN KEY ("githubProfileId") REFERENCES "GitHubProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_githubProfileId_fkey" FOREIGN KEY ("githubProfileId") REFERENCES "GitHubProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
