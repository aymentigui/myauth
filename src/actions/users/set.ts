"use server"
import { prisma } from "@/lib/db";
import { getTranslations } from "next-intl/server";
import { z } from "zod";
import bcrypt from "bcrypt";

export async function createUser(data: any) {
    const u = await getTranslations("Users");
    const s = await getTranslations("System");

    const userSchema = z.object({
        firstname: z.string().min(1, u("firstnamerequired")),
        lastname: z.string().min(1, u("lastnamerequired")),
        username: z.string().min(1, u("usernamerequired")),
        email: z.string().email(u("emailinvalid")),
        password: z.string().min(6, u("password6")),
        isAdmin: z.boolean().default(false),
        roles: z.array(z.string()).optional(),
    });
    try {
        const result = userSchema.safeParse(data);

        if (!result.success) {
            console.log(result.error.errors);
            return { status: 400, data: { errors: result.error.errors } };
        }
        const { firstname, lastname, username, email, password, isAdmin, roles } = result.data;

        const usernameExists = await prisma.user.findUnique({ where: { username } });
        if (usernameExists) {
            return { status: 400, data: { message: u("usernameexists") } };
        }

        const emailExists = await prisma.user.findUnique({ where: { email } });
        if (emailExists) {
            return { status: 400, data: { message: u("emailexists") } };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                firstname,
                lastname,
                username,
                email,
                password:hashedPassword,
                isAdmin,
            },
        });

        if (!isAdmin) {
            const rolesFound = await prisma.role.findMany({ where: { id: { in: roles } } });
            await prisma.userRole.createMany({
                data: rolesFound.map((role) => ({
                    userId: user.id,
                    roleId: role.id,
                })),
            })
        }

        return { status: 200, data: { message: s("createsuccess") } };
    } catch (error) {
        console.error("An error occurred in createUser");
        return { status: 500, data: { message: s("createfail") } };
    }
}