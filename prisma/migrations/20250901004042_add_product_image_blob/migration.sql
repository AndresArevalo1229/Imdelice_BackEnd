/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Product` DROP COLUMN `imageUrl`,
    ADD COLUMN `imageData` LONGBLOB NULL,
    ADD COLUMN `imageFilename` VARCHAR(255) NULL,
    ADD COLUMN `imageMime` VARCHAR(100) NULL,
    ADD COLUMN `imageSize` INTEGER NULL;
