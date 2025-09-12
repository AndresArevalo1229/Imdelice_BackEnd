/*
  Warnings:

  - A unique constraint covering the columns `[pinCodeDigest]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `User_pinCodeHash_key` ON `User`;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `pinCodeDigest` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_pinCodeDigest_key` ON `User`(`pinCodeDigest`);
