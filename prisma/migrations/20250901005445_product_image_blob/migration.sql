/*
  Warnings:

  - You are about to drop the column `imageData` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `imageFilename` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `imageMime` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Product` DROP COLUMN `imageData`,
    DROP COLUMN `imageFilename`,
    DROP COLUMN `imageMime`,
    ADD COLUMN `image` LONGBLOB NULL,
    ADD COLUMN `imageMimeType` VARCHAR(191) NULL;
