"use server"
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db";
import { uploadFile } from "./upload";
import { generateRandomFilename, getFileExtension } from "../util/util-public";

export async function uploadFileDB(
    file: File,
    userId: string,
    canViewUsers?: string[],
    canViewPermissions?: string[],
    adminViewOnly?: boolean,

    canDownloadUsers?: string[],
    canDownloadPermissions?: string[],
    adminDownloadOnly?: boolean,

    canDeleteUsers?: string[],
    canDeletePermissions?: string[],
    adminDeleteOnly?: boolean,

): Promise<{ status: number, data: { message?: string, file?: any } }> {

    const s = await getTranslations("System");
    const f = await getTranslations("Files");
    const e = await getTranslations('Error');

    try {
        if (!file) {
            return { status: 400, data: { message: e('badrequest') } }
        }

        const filename = generateRandomFilename()

        if (file.size > 10000000) {
            return { status: 400, data: { message: f('filesizemax') + "10 mo" } }
        }

        const fileUploaded = await uploadFile("uploads/" + filename + "." + getFileExtension(file.name), file)
        if (fileUploaded.status !== 200 || !fileUploaded.data?.path) {
            if (fileUploaded.status === 409) {
                return { status: 409, data: { message: f("fileexists") } };
            }
            return { status: 500, data: { message: e('error') } };
        }

        const fileCreated = await prisma.files.create({
            data: {
                name: filename,
                mimeType: file.type,
                size: file.size,
                extention: getFileExtension(file.name),
                path: fileUploaded.data.path,
                addedFrom: userId,
                canViewUsers: canViewUsers ? canViewUsers.join(",")  : null,
                canDownloadUsers: canDownloadUsers ? canDownloadUsers.join(",") : null,
                canDeleteUsers: canDeleteUsers ? canDeleteUsers.join(",") : null,

                adminDeleteOnly: adminDeleteOnly??false,
                adminDownloadOnly:adminDownloadOnly??false,
                adminViewOnly: adminViewOnly??false,

                canDeletePermissions: canDeletePermissions ? canDeletePermissions.join(",") : null,
                canDownloadPermissions: canDownloadPermissions ? canDownloadPermissions.join(",") : null,
                canViewPermissions: canViewPermissions ? canViewPermissions.join(",") : null,
            },
        })

        return { status: 200, data: { message: s("createsuccess"), file: fileCreated } };
    } catch (error) {
        console.error("An error occurred in uploadFileDB" + error);
        return { status: 500, data: { message: s("createfail") } };
    }
}