-- AlterTable
ALTER TABLE `FileShare` MODIFY `accessType` ENUM('Public', 'Private') NOT NULL DEFAULT 'Private';

-- AlterTable
ALTER TABLE `FileShareAccess` ADD COLUMN `lastViewedAt` DATETIME(3) NULL,
    ADD COLUMN `views` INTEGER NOT NULL DEFAULT 0;
