import path from "path";

const DEFAULT_PAGE_SIZE = Number(process.env.PAGE_SIZE || 9);
const UPLOAD_DIR = "shared";
const FILES_UPLOAD_PATH = path.join(__dirname, "../..", UPLOAD_DIR);

export {
    DEFAULT_PAGE_SIZE,
    UPLOAD_DIR,
    FILES_UPLOAD_PATH
};