import { AccessType, FileCategory } from "@prisma/client";
import { z } from "zod";
import PaginationParams from "./PaginationParams";


const FileParams = PaginationParams.omit({
    status: true,
}).extend({
    category: z.nativeEnum(FileCategory),
    accessType: z.nativeEnum(AccessType),
});

export type FileParamsType = z.infer<typeof FileParams>;
export default FileParams;