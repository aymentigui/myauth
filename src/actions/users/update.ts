"use server"
import { prisma } from "@/lib/db";
import { getTranslations } from "next-intl/server";
import { z } from "zod";
import bcrypt from "bcrypt";
import { verifySession } from "../auth/auth";
import { ISADMIN, withAuthorizationPermission2 } from "../permissions";

export async function updateUser(id: string, data: any): Promise<{ status: number, data: any }> {
    const u = await getTranslations("Users");
    const s = await getTranslations("System");
    const e=await getTranslations('Error');
    try {
        const session = await verifySession()
        if (!session || session.status != 200) {
            return { status: 401, data: { message: e('unauthorized') } }
        }
        const hasPermissionAdd = await withAuthorizationPermission2(session.data.user.id, ['users_update']);

        if (hasPermissionAdd.status != 200 || !hasPermissionAdd.data.hasPermission) {
            return { status: 403, data: { message: e('forbidden') } };
        }
        const userSchema = z.object({
            firstname: z.string().min(1, u("firstnamerequired")),
            lastname: z.string().min(1, u("lastnamerequired")),
            username: z.string().min(1, u("usernamerequired")),
            email: z.string().email(u("emailinvalid")),
            password: z.string().optional(),
            isAdmin: z.boolean().default(false),
            roles: z.array(z.string()).optional(),
        }).refine((data) => {
            if (!(!data.password || data.password === "" || data.password === null)) {
                return true;
            } else {
                return String(data.password).length < 6;
            }
        }, {
            path: ["password"],
            message: u("password6"),
        });

        if (id == "" || id == undefined) return { status: 400, data: { message: u("usernotfound") } }

        const result = userSchema.safeParse(data);
        if (!result.success) {
            console.log(result.error.errors);
            return { status: 400, data: { errors: result.error.errors } };
        }

        const { firstname, lastname, username, email, password, isAdmin, roles } = result.data;

        const emailExists = await prisma.user.findUnique({ where: { email } });
        if (emailExists && emailExists.id !== id) {
            return { status: 400, data: { message: u("emailexists") } };
        }

        const usernameExists = await prisma.user.findUnique({ where: { username } });
        if (usernameExists && usernameExists.id !== id) {
            return { status: 400, data: { message: u("usernameexists") } };
        }

        await prisma.user.update({
            where: { id },
            data: {
                firstname,
                lastname,
                username,
                email,
                isAdmin,
            },
        })

        if(password){
            const hashedPassword = await bcrypt.hash(password, 10);
            await prisma.user.update({
                where: { id },
                data: {
                    password: hashedPassword,
                },
            })
        }

        await prisma.userRole.deleteMany({ where: { userId: id } })
        if (roles && roles.length > 0) {
            await prisma.userRole.createMany({
                data: roles.map((role: string) => ({
                    userId: id,
                    roleId: role,
                })),
            })
        }
        return { status: 200, data: { message: s("updatesuccess") } }
    } catch (error) {
        console.error("An error occurred in updateUser")
        return { status: 500, data: { message: s("error") } }
    }
}