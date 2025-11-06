-- CreateTable
CREATE TABLE `FileShare` (
    `fileShareId` VARCHAR(191) NOT NULL,
    `fileName` VARCHAR(191) NOT NULL,
    `filePath` VARCHAR(191) NOT NULL,
    `accessType` ENUM('Public', 'Private') NOT NULL DEFAULT 'Public',
    `sharedBy` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,
    `category` ENUM('CategoryA', 'CategoryB', 'CategoryC', 'CategoryD', 'CategoryE') NOT NULL DEFAULT 'CategoryA',

    PRIMARY KEY (`fileShareId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FileShareAccess` (
    `fileShareAccessId` VARCHAR(191) NOT NULL,
    `fileShareId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `sharedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`fileShareAccessId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `FileShare` ADD CONSTRAINT `FileShare_sharedBy_fkey` FOREIGN KEY (`sharedBy`) REFERENCES `Users`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FileShareAccess` ADD CONSTRAINT `FileShareAccess_fileShareId_fkey` FOREIGN KEY (`fileShareId`) REFERENCES `FileShare`(`fileShareId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FileShareAccess` ADD CONSTRAINT `FileShareAccess_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Users`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;
