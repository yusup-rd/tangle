import { AppFileRouter } from "@/app/api/uploadthing/core";
import { generateReactHelpers } from "@uploadthing/react";

export const { uploadFiles } = generateReactHelpers<AppFileRouter>();
