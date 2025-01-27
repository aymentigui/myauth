"use server"

import { prisma } from "@/lib/db";
import { verifySession } from "../auth/auth";
import { getTranslations } from "next-intl/server";
import { ISADMIN, withAuthorizationPermission2 } from "../permissions";

export async function getUsers(): Promise<{ status: number, data: any }> {
    const e = await getTranslations('Error');
    try {
        const session = await verifySession()
        if (!session || session.status != 200) {
            return { status: 401, data: { message: e('unauthorized') } }
        }
        const hasPermissionAdd = await withAuthorizationPermission2(session.data.user.id, ['users_view']);

        if (hasPermissionAdd.status != 200 || !hasPermissionAdd.data.hasPermission) {
            return { status: 403, data: { message: e('forbidden') } };
        }
        const users = await prisma.user.findMany({
            select: {
                id: true,
                firstname: true,
                lastname: true,
                username: true,
                email: true,
                image: true,
                isAdmin: true,
                roles: {
                    select: {
                        role: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        const formattedUsers = users.map((user) => ({
            ...user,
            roles: user.roles.map((userRole) => userRole.role.name),
        }));
        return { status: 200, data: formattedUsers };
    } catch (error) {
        console.error("Error fetching users:", error);
        return { status: 500, data: null };
    }
}

export async function getUserByid(id: string): Promise<{ status: number, data: any }> {
    const e = await getTranslations('Error');
    try {
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            return { status: 400, data: { message: e("usernotfound") } };
        }
        return { status: 200, data: user };
    } catch (error) {
        console.error("An error occurred in getUserByid");
        return { status: 500, data: { message: e("error") } };
    }
}

export async function getUserByEmailOrUsername(emailOrUsername: string): Promise<{ status: number, data: any }> {
    const e = await getTranslations('Error');
    try {
        const user = await prisma.user.findFirst(
            { where: { OR: [{ email: emailOrUsername }, { username: emailOrUsername }] } }
        );
        if (!user) {
            return { status: 400, data: { message: e("usernotfound") } };
        }
        return { status: 200, data: user };
    } catch (error) {
        console.error("An error occurred in getUserByid");
        return { status: 500, data: { message: e("error") } };
    }
}
