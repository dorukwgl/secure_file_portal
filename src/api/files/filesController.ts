import express, { Response } from "express";
import { authAdmin, authorize } from "../../middlewares/auth";
import SessionRequest from "../../entities/SessionRequest";
import FileStorage from "../../utils/FileStorage";
import { accessFile, accessFileAdmin, changeAccessType, changeDisplayName, deleteFile, getViewrs, searchAllFiles, searchSharedFiles, shareFiles } from "./filesModel";
import { EUserRoles } from "@prisma/client";
import path from "path";
import { FILES_UPLOAD_PATH } from "../../entities/constants";
import fs from "fs";

const files = express.Router();

files.post("/", [authAdmin, FileStorage().array("sharedFiles")], async (req: SessionRequest, res: Response) => {
    if (!req.files?.length) {
        res.json({error: "No Files Uploaded"});
        return;
    }

    const {data, error, statusCode} = await shareFiles(req.session!.userId, (req.files as any)["sharedFiles"], req.body);
    res.status(statusCode).json(error || data);
});

files.put("/display-name", authAdmin, async (req: SessionRequest, res: Response) => {
    const {data, error, statusCode} = await changeDisplayName(req.session!.userId, req.body);
    res.status(statusCode).json(error || data);
});

files.put("/update-access/:fileShareId", authAdmin, async (req: SessionRequest<{fileShareId: string}>, res: Response) => {
    const {data, error, statusCode} = await changeAccessType(req.params.fileShareId, req.body);
    res.status(statusCode).json(error || data);
});

files.delete("/", authAdmin, async (req: SessionRequest<{fileShareId: string}>, res: Response) => {
    const {data, error, statusCode} = await deleteFile(req.params.fileShareId);
    res.status(statusCode).json(error || data);
});

files.get("/", authorize, async (req: SessionRequest<{fileShareId: string}>, res: Response) => {
    const {data, error, statusCode, info} = req.session!.role === EUserRoles.Admin ? 
        await searchAllFiles(req.query as any) : 
        await searchSharedFiles(req.session!.userId, req.query as any);
    res.status(statusCode).json(error || {data, info});
});

files.get("/viewers/:fileShareId", authAdmin, async (req: SessionRequest<{fileShareId: string}>, res: Response) => {
    const {data, error, statusCode} = await getViewrs(req.params.fileShareId);
    res.status(statusCode).json(error || data);
});

files.get("/shared-file/:fileShareId", authorize, async (req: SessionRequest<{fileShareId: string}>, res: Response) => {
    const fileName = await accessFile(req.params.fileShareId, req.session!.userId);
    if (!fileName) {
        res.json({error: "File not found"});
        return;
    }

    // check if file is pdf
    if (!fileName.toLocaleLowerCase().endsWith(".pdf")) {
        res.download(path.join(FILES_UPLOAD_PATH, fileName));
        return;
    }
    res.setHeader("Content-Type", "application/pdf");
    fs.createReadStream(path.join(FILES_UPLOAD_PATH, fileName))
        .pipe(res);
});

files.get("/file/:fileShareId", authAdmin, async (req: SessionRequest<{fileShareId: string}>, res: Response) => {
    const fileName = await accessFileAdmin(req.params.fileShareId);
    if (!fileName) {
        res.json({error: "File not found"});
        return;
    }

    // check if file is pdf
    if (!fileName.toLocaleLowerCase().endsWith(".pdf")) {
        res.download(path.join(FILES_UPLOAD_PATH, fileName));
        return;
    }
    
    res.setHeader("Content-Type", "application/pdf");
    fs.createReadStream(path.join(FILES_UPLOAD_PATH, fileName))
        .pipe(res);
});

export default files;