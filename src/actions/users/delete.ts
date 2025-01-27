"use server"

import { getTranslations } from "next-intl/server";
import { verifySession } from "../auth/auth"
import { prisma } from "@/lib/db";
import { ISADMIN, withAuthorizationPermission2 } from "../permissions";

export async function deleteUsers(ids: string[]) : Promise<{ status: number, data: any }> {
    const e=await getTranslations('Error');
    const s=await getTranslations('System');
    try {
        const session = await verifySession()
        if(!session || session.status != 200) {
            return { status: 401, data: { message: e('unauthorized') } }
        }
        const hasPermissionAdd = await withAuthorizationPermission2(session.data.user.id, ['users_delete']);

        if (hasPermissionAdd.status != 200 || !hasPermissionAdd.data.hasPermission) {
            return { status: 403, data: { message: e('forbidden') } };
        }
        const user = await prisma.user.deleteMany({
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
        return { status: 500, data: { message: e('error')} }
    }
}