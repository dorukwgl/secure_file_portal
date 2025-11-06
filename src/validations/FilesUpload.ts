import { FileCategory } from "@prisma/client";
import { z } from "zod";

const FilesUpload = z.object({
    displayName: z.string()
    .min(3, "Display name must be at least 3 characters long")
    .optional(),
    category: z.nativeEnum(FileCategory)
});

export type FilesUploadType = z.infer<typeof FilesUpload>;
export default FilesUpload;
