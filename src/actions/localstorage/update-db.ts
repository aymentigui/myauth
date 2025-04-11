"use server"
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db";
import { uploadFile } from "./upload";
import { generateRandomFilename, getFileExtension } from "../util/util-public";

export async function updateFilePermissionsDB(
    fileId: string,
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

    try {

        console.log(
            canViewUsers,
            canDownloadUsers,
            canDeleteUsers,
            canViewPermissions,
            canDownloadPermissions,
            canDeletePermissions,
            adminViewOnly,
            adminDownloadOnly,
            adminDeleteOnly
        )
        await prisma.files.update({
            data: {
                canViewUsers: adminViewOnly?null:canViewUsers ? canViewUsers.join(",") : null,
                canDownloadUsers: adminDownloadOnly?null:canDownloadUsers ? canDownloadUsers.join(",") : null,
                canDeleteUsers: adminDeleteOnly?null:canDeleteUsers ? canDeleteUsers.join(",") : null,

                adminDeleteOnly: adminDeleteOnly??false,
                adminDownloadOnly:adminDownloadOnly??false,
                adminViewOnly: adminViewOnly??false,

                canDeletePermissions: adminDeleteOnly?null:canDeletePermissions ? canDeletePermissions.join(",") : null,
                canDownloadPermissions: adminDownloadOnly?null:canDownloadPermissions ? canDownloadPermissions.join(",") : null,
                canViewPermissions: adminViewOnly?null:canViewPermissions ? canViewPermissions.join(",") : null,
            },
            where: {
                id: fileId
            }
        })

        return { status: 200, data: { message: s("createsuccess") } };
    } catch (error) {
        console.error("An error occurred in createUser" + error);
        return { status: 500, data: { message: s("createfail") } };
    }
}