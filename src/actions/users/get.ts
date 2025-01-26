"use server"

import { prisma } from "@/lib/db";

export async function getUsers() : Promise<{ status: number, data: any }> {
    try {
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