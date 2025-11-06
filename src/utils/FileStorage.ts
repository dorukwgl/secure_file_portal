import multer from 'multer';
import { randomUUID } from 'node:crypto';
import { FILES_UPLOAD_PATH } from '../entities/constants';
import { existsSync, mkdirSync } from 'node:fs';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, FILES_UPLOAD_PATH)
    },
    filename: function (req, file, cb) {
        cb(null, randomUUID() + "." + file.originalname.split(".").pop())
    }
});

const FileStorage = () => {
    // create if not exists
    if (!existsSync(FILES_UPLOAD_PATH)) 
        mkdirSync(FILES_UPLOAD_PATH);
    
    return multer({ storage: storage }); 
}

export default FileStorage;
