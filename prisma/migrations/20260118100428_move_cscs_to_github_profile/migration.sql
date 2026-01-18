/*
  Warnings:

  - You are about to drop the column `cscs` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "GitHubProfile" ADD COLUMN     "cscs" INTEGER NOT NULL DEFAULT 500;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "cscs";
