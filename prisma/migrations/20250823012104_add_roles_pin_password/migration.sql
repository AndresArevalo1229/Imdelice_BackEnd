/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Role` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Role` table. All the data in the column will be lost.
  - You are about to drop the column `key` on the `Role` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Role` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lastLoginAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `pinHash` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Role` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[pinCodeHash]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Made the column `roleId` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `passwordHash` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `User` DROP FOREIGN KEY `User_roleId_fkey`;

-- DropIndex
DROP INDEX `Role_key_key` ON `Role`;

-- AlterTable
ALTER TABLE `Role` DROP COLUMN `createdAt`,
    DROP COLUMN `isActive`,
    DROP COLUMN `key`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `description` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `isActive`,
    DROP COLUMN `lastLoginAt`,
    DROP COLUMN `pinHash`,
    ADD COLUMN `pinCodeHash` VARCHAR(191) NULL,
    MODIFY `roleId` INTEGER NOT NULL,
    MODIFY `passwordHash` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Role_name_key` ON `Role`(`name`);

-- CreateIndex
CREATE UNIQUE INDEX `User_pinCodeHash_key` ON `User`(`pinCodeHash`);

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
