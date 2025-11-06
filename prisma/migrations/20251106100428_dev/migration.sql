/*
  Warnings:

  - You are about to drop the `Todos` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `role` to the `Sessions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Todos` DROP FOREIGN KEY `Todos_userId_fkey`;

-- AlterTable
ALTER TABLE `Sessions` ADD COLUMN `role` ENUM('Admin', 'User') NOT NULL;

-- AlterTable
ALTER TABLE `Users` ADD COLUMN `role` ENUM('Admin', 'User') NOT NULL DEFAULT 'User',
    ADD COLUMN `status` ENUM('Active', 'Disabled') NOT NULL DEFAULT 'Active';

-- DropTable
DROP TABLE `Todos`;

-- CreateTable
CREATE TABLE `Samples` (
    `sampleId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `body` VARCHAR(191) NULL,
    `userId` VARCHAR(191) NOT NULL,
    `status` ENUM('Active', 'Disabled') NOT NULL DEFAULT 'Active',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    FULLTEXT INDEX `Samples_title_body_idx`(`title`, `body`),
    PRIMARY KEY (`sampleId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Samples` ADD CONSTRAINT `Samples_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Users`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;
