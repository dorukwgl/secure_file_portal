import ModelReturnTypes from "../../entities/ModelReturnTypes";
import FilesUpload from "../../validations/FilesUpload";
import formatValidationErrors from "../../utils/formatValidationErrors";
import { AccessType, FileShare, Prisma } from "@prisma/client";
import { randomUUID } from "crypto";
import prismaClient from "../../utils/prismaClient";
import fs from "fs/promises";
import path from "path";
import { FILES_UPLOAD_PATH } from "../../entities/constants";
import FileParams, { FileParamsType } from "../../validations/FileParams";
import PaginationReturnTypes from "../../entities/PaginationReturnTypes";
import Paginator from "../../utils/paginator";
import { z } from "zod";

const shareFiles = async (userId: string, files: Express.Multer.File[], body: any) => {
    const res = { statusCode: 400 } as ModelReturnTypes;

    const validation = FilesUpload.safeParse(body);
    const error = formatValidationErrors(validation);
    if (error) {
        res.error = error.error;
        return res;
    };

    const data = validation.data!;
    const entry: FileShare[] = [];

    for (const file of files) {
        entry.push({
            category: data.category,
            fileName: data.displayName || randomUUID(),
            filePath: file.filename,
            sharedBy: userId
        } as FileShare)
    }

    await prismaClient.fileShare.createMany({
        data: entry
    });

    res.statusCode = 201;
    res.data = {message: "Files shared successfully"};
    return res;
}

const searchAllFiles = (params: FileParamsType) => {
    const res = { statusCode: 200 } as PaginationReturnTypes;

    const validation = FileParams.safeParse(params);
    const error = formatValidationErrors(validation);
    if (error) {
        res.error = error.error;
        return res;
    };

    const data = validation.data!;
    return new Paginator<Prisma.FileShareFindManyArgs>(
        "fileShare",
        {
            where: {
                category: data.category,
                accessType: data.accessType,
                fileName: data.seed ? { contains: data.seed } : undefined,
            },
            orderBy: {
                createdAt: "desc",
            },
        },
        data
    ).get();
}

const searchSharedFiles = (userId: string, params: FileParamsType) => {
    const res = { statusCode: 200 } as PaginationReturnTypes;

    const validation = FileParams.omit({
        accessType: true,
    }).safeParse(params);
    const error = formatValidationErrors(validation);
    if (error) {
        res.error = error.error;
        return res;
    };

    const data = validation.data!;
    return new Paginator<Prisma.FileShareFindManyArgs>(
        "fileShare",
        {
            where: {
                AND: [
                    {
                        AND: [
                            {
                                category: data.category,
                            },
                            {
                                fileName: data.seed ? { contains: data.seed } : undefined,
                            },
                        ],
                        OR: [ {
                        accessType: AccessType.Public,
                        fileShares: {
                            some: {
                                userId,
                            },
                        },
                    }]
                },
                ]
            },
            orderBy: {
                createdAt: "desc",
            },
        },
        data
    ).get();
}

const changeAccessType = async (fileShareId: string, body: any) => {
    const res = { statusCode: 400 } as ModelReturnTypes;

    const validation = z.object({accessType: z.nativeEnum(AccessType)}).safeParse(body);
    const error = formatValidationErrors(validation);
    if (error) {
        res.error = error.error;
        return res;
    };

    const data = validation.data!;

    const file = await prismaClient.fileShare.findUnique({
        where: {
            fileShareId,
        },
    });

    if (!file) {
        res.error = {error: "File not found"};
        return res;
    }

    res.data = await prismaClient.fileShare.update({
        where: {
            fileShareId,
        },
        data: {
            accessType: data.accessType,
        },
    });

    return res;
}

const deleteFile = async (fileShareId: string) => {
    const res = { statusCode: 400 } as ModelReturnTypes;

    const file = await prismaClient.fileShare.findUnique({
        where: {
            fileShareId,
        },
    });

    if (!file) {
        res.error = {error: "File not found"};
        return res;
    }

    prismaClient.$transaction([
        prismaClient.fileShareAccess.deleteMany({
            where: {
                fileShareId,
            },
        }),
        prismaClient.fileShare.delete({
            where: {
                fileShareId,
            },
        })
    ]);

    const filePath = path.join(FILES_UPLOAD_PATH, file.filePath);
    await fs.unlink(filePath);

    res.statusCode = 200;
    res.data = {message: "File deleted successfully"};
    return res;
}

const getViewrs = async (fileShareId: string) => {
    const res = { statusCode: 400 } as ModelReturnTypes;

    const file = await prismaClient.fileShare.findUnique({
        where: {
            fileShareId,
        },
    });

    if (!file) {
        res.error = {error: "File not found"};
        return res;
    }

    const views = await prismaClient.fileShareAccess.findMany({
        where: {
            fileShareId,
        },
        select: {
            user: {
                select: {
                    userId: true,
                    fullName: true,
                    username: true,
                },
            },
            views: true,
            lastViewedAt: true,
        },
    });

    const totalViews = await prismaClient.fileShareAccess.aggregate({
        where: {
            fileShareId,
        },
        _sum: {
            views: true,
        },
    });

    res.data = {
        viewers: views,
        views: totalViews._sum.views,
    };
    res.statusCode = 200;
    return res;
}

const accessFile = async (fileShareId: string, userId: string) => {
    const fileName = await prismaClient.fileShare.findUnique({
        where: {
            fileShareId,
            fileShares: {
                some: {
                    userId,
                },
            },
        },
        select: {
            fileName: true,
        },
    });

    if (!fileName)
        return null;

    await prismaClient.fileShareAccess.updateMany({
        where: {
            fileShareId,
            userId,
        },
        data: {
            views: {
                increment: 1,
            },
            lastViewedAt: new Date(),
        },
    });

    return fileName.fileName;
}

const changeDisplayName = async (fileShareId: string, body: any) => {
    const res = { statusCode: 400 } as ModelReturnTypes;

    const validation = z.object({displayName: z.string().min(3)}).safeParse(body);
    const error = formatValidationErrors(validation);
    if (error) {
        res.error = error.error;
        return res;
    };

    const file = await prismaClient.fileShare.findUnique({
        where: {
            fileShareId,
        },
    });

    if (!file) {
        res.error = {error: "File not found"};
        return res;
    }

    await prismaClient.fileShare.update({
        where: {
            fileShareId,
        },
        data: {
            fileName: validation.data?.displayName,
        },
    });

    res.statusCode = 200;
    res.data = {message: "File name changed successfully"};
    return res;
}

const accessFileAdmin = async (fileShareId: string): Promise<string | undefined> => {
    const fileName = await prismaClient.fileShare.findUnique({
        where: {
            fileShareId,
        },
        select: {
            fileName: true,
        },
    });

    return fileName?.fileName;
}

export {
    shareFiles,
    changeDisplayName,
    changeAccessType,
    deleteFile,
    searchAllFiles,
    searchSharedFiles,
    getViewrs,
    accessFile,
    accessFileAdmin
}