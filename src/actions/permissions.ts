"use server"

import { prisma } from "@/lib/db";
import { getSession } from "./user";
import { getTranslations } from "next-intl/server";


export async function getUserPermissions(userId: string): Promise<string[]> {
    const userRoles = await prisma.userRole.findMany({
        where: { userId },
        include: { role: true },
    });

    const permissions = userRoles.flatMap((role) => role.role.permissions);

    return permissions;
}

export async function withAuthorization(
    requiredPermission: string,
) {
    const session = await getSession();
    const e = await getTranslations('Error');

    if (!session?.data?.user) {
        return { status: 401, data: { message: e("unauthorized") } };
    }

    const permissions = await getUserPermissions(session.data.user.id);

    if (!permissions.includes(requiredPermission) && !session.data.user.isAdmin) {
        return { status: 403, data: { message: e("forbidden") } };
    }

    return { status: 200, data: { message: true } };
}

export async function ISADMIN() {
    const e = await getTranslations('Error');
    try {
        const session = await getSession();
        if (!session?.data?.user) {
            return { status: 401, data: { message: e("unauthorized") } };
        }
        return { status: 200, data: { isAdmin: session.data.user.isAdmin } };
    } catch (error) {
        console.error("An error occurred in ISADMIN");
        return { status: 500, data: { message: e("error") } };
    }
}

export async function getRoles(): Promise<{ status: number, data: any }> {
    const e = await getTranslations('Error');
    try {
        const session = await getSession();
        if (!session?.data?.user) {
            return { status: 401, data: { message: e("unauthorized") } };
        }
        const roles = await prisma.role.findMany({
            include: {
                users: {
                    select: {
                        userId: true
                    }
                }
            }
        });

        const formattedRoles = roles.map(role => ({
            id: role.id,
            name: role.name,
            userCount: role.users.length
        }));

        return { status: 200, data: formattedRoles };
    } catch (error) {
        console.error("An error occurred in getRoles");
        return { status: 500, data: { message: e("error") } };
    }
}

export async function getRole(id: string): Promise<{ status: number, data: any }> {
    const e = await getTranslations('Error');
    try {
        const session = await getSession();
        if (!session?.data?.user) {
            return { status: 401, data: { message: e("unauthorized") } };
        }
        const role = await prisma.role.findUnique({ where: { id } });
        return { status: 200, data: role };
    } catch (error) {
        console.error("An error occurred in getRole");
        return { status: 500, data: { message: e("error") } };
    }
}

export async function AddRole(name: string, permission: string) {
    const e = await getTranslations('Error');
    const s = await getTranslations('System');
    try {
        const session = await getSession();
        if (!session?.data?.user) {
            return { status: 401, data: { message: e("unauthorized") } };
        }
        await prisma.role.create({
            data: {
                name: name,
                permissions: permission,
            },
        })
        return { status: 200, data: { message: s("createsuccess") } };
    } catch (error) {
        console.error("An error occurred in AddRolePermission");
        return { status: 500, data: { message: e("error") } };
    }
}

export async function UpdateRole(id: string, name: string, permission: string) {
    const e = await getTranslations('Error');
    const s = await getTranslations('System');
    try {
        const session = await getSession();
        if (!session?.data?.user) {
            return { status: 401, data: { message: e("unauthorized") } };
        }
        await prisma.role.update({
            where: { id },
            data: {
                name: name,
                permissions: permission,
            },
        })
        return { status: 200, data: { message: s("updatesuccess") } };
    } catch (error) {
        console.error("An error occurred in UpdateRolePermission");
        return { status: 500, data: { message: e("error") } };
    }
}

export async function deleteRole(roleId: string) : Promise<{ status: number, data: { message: string} }> {
    const e = await getTranslations('Error');
    const s = await getTranslations('System');
    try {
        const session = await getSession();
        if (!session?.data?.user) {
            return { status: 401, data: { message: e("unauthorized") } };
        }
        await prisma.role.delete({ where: { id: roleId } });
        return { status: 200, data: { message: s("deletesuccess") } };
    } catch (error) {
        console.error("An error occurred in deleteRole");
        return { status: 500, data: { message: e("error") } };
    }
}