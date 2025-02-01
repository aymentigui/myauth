"use server"

import { getTranslations } from "next-intl/server";
import { verifySession } from "../auth/auth"
import { prisma } from "@/lib/db";
import { ISADMIN, withAuthorizationPermission2 } from "../permissions";
import { deleteFile } from "../superbase/delete";
import { addStringToFilenameWithNewExtension } from "../util-public";

export async function deleteUsers(ids: string[]): Promise<{ status: number, data: any }> {
    const e = await getTranslations('Error');
    const s = await getTranslations('System');
    try {
        const session = await verifySession()
        if (!session || session.status != 200) {
            return { status: 401, data: { message: e('unauthorized') } }
        }
        const hasPermissionAdd = await withAuthorizationPermission2(session.data.user.id, ['users_delete']);

        if (hasPermissionAdd.status != 200 || !hasPermissionAdd.data.hasPermission) {
            return { status: 403, data: { message: e('forbidden') } };
        }

        const users = await prisma.user.findMany({
            where: {
                id: {
                    in: ids
                }
            }
        })

        users.map(async (user) => {
            if (user.image) {
                const success1 = await deleteFile(user.image)
                if (success1.status != 200) return { status: 500, data: { message: e("error") } };
                const success2 = await deleteFile(addStringToFilenameWithNewExtension(user.image, "compressed", "jpg"))
                if (success2.status != 200) return { status: 500, data: { message: e("error") } };
            }
        })

        await prisma.user.deleteMany({
            where: {
                id: {
                    in: ids
                }
            }
        })
        return { status: 200, data: { message: s('deletesuccess') } }
    } catch (error) {
        // @ts-ignore
        console.error(error.message);
        return { status: 500, data: { message: e('error') } }
    }
}