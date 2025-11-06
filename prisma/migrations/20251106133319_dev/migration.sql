-- AlterTable
ALTER TABLE `FileShare` MODIFY `accessType` ENUM('Public', 'Private', 'Closed') NOT NULL DEFAULT 'Private';
