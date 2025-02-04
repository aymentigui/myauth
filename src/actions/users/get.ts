"use server"

import { prisma } from "@/lib/db";
import { verifySession } from "../auth/auth";
import { getTranslations } from "next-intl/server";
import { ISADMIN, withAuthorizationPermission2 } from "../permissions";
import { getTemporaryUrl } from "../superbase/download";
import { addStringToFilenameWithNewExtension } from "../util/util-public";

export async function getUsers(page: number = 1, pageSize: number = 10, searchQuery?: string): Promise<{ status: number, data: any }> {
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

        // Calculer le nombre d'éléments à sauter
        const skip = (page - 1) * pageSize;

        const searchConditions = searchQuery
            ? {
                OR: [
                    { firstname: { contains: searchQuery } },
                    { lastname: { contains: searchQuery } },
                    { username: { contains: searchQuery } },
                    { email: { contains: searchQuery } },
                ],
            }
            : {};

        const users = await prisma.user.findMany({
            skip: skip, // Nombre d'éléments à sauter
            take: pageSize, // Nombre d'éléments à prendre
            where: searchConditions,
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

        for (const user of users) {
            if (user.image) {
                const urlImage = await getTemporaryUrl(user.image);
                const urlImageCompressed = await getTemporaryUrl(addStringToFilenameWithNewExtension(user.image, "compressed", "jpg"));
                if (urlImage && urlImage.status === 200 && urlImage.data.url && urlImageCompressed && urlImageCompressed.status === 200 && urlImageCompressed.data.url) {
                    user.image = urlImage.data.url as string;
                    (user as any).imageCompressed = urlImageCompressed.data.url
                } else {
                    user.image = null as never
                    (user as any).imageCompressed = null
                }
            }
        }

        const formattedUsers = users.map((user) => ({
            ...user,
            roles: user.roles.map((role) => role.role.name),
        }));

        return { status: 200, data: formattedUsers };
    } catch (error) {
        console.error("Error fetching users:", error);
        return { status: 500, data: null };
    }
}

export async function getCountUsers(): Promise<{ status: number, data: any }> {
    const e = await getTranslations('Error');
    try {
        const count = await prisma.user.count();
        return { status: 200, data: count };
    } catch (error) {
        console.error("Error fetching count users:", error);
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


export async function getUserSettingsByid(id: string): Promise<{ status: number, data: any }> {
    const e = await getTranslations('Error');
    try {
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            return { status: 400, data: { message: e("usernotfound") } };
        }

        if (user.image) {
            const urlImage = await getTemporaryUrl(user.image);
            const urlImageCompressed = await getTemporaryUrl(addStringToFilenameWithNewExtension(user.image, "compressed", "jpg"));
            if (urlImage && urlImage.status === 200 && urlImage.data.url && urlImageCompressed && urlImageCompressed.status === 200 && urlImageCompressed.data.url) {
                user.image = urlImage.data.url as string;
                (user as any).imageCompressed = urlImageCompressed.data.url
            } else {
                user.image = null as never
                (user as any).imageCompressed = null
            }
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
