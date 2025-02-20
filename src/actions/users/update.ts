"use server"
import { prisma } from "@/lib/db";
import { getTranslations } from "next-intl/server";
import { z } from "zod";
import bcrypt from "bcrypt";
import { verifySession } from "../auth/auth";
import { withAuthorizationPermission2 } from "../permissions";
import { compressImage } from "../util/util";
import { uploadFileDB } from "../localstorage/upload-db";
import { deleteFileDb } from "../localstorage/delete-db";

export async function updateUser(id: string, data: any): Promise<{ status: number, data: any }> {
    const u = await getTranslations("Users");
    const s = await getTranslations("System");
    const e = await getTranslations('Error');
    const f = await getTranslations("Files")

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
            image: z.instanceof(File, { message: u("avatarinvalid") }).optional().refine((file) => !file || file.type.startsWith("image/"), {
                message: u("avatarinvalid")
            })
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

        const { firstname, lastname, username, email, password, isAdmin, roles, image } = result.data;

        const emailExists = await prisma.user.findUnique({ where: { email } });
        if (emailExists && emailExists.id !== id) {
            return { status: 400, data: { message: u("emailexists") } };
        }

        const usernameExists = await prisma.user.findUnique({ where: { username } });
        if (usernameExists && usernameExists.id !== id) {
            return { status: 400, data: { message: u("usernameexists") } };
        }

        const user = await prisma.user.update({
            where: { id },
            data: {
                firstname,
                lastname,
                username,
                email,
                isAdmin: (isAdmin && session.data.user.isAdmin) ? true : false,
            },
        })

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            await prisma.user.update({
                where: { id },
                data: {
                    password: hashedPassword,
                },
            })
        }

        await prisma.userrole.deleteMany({ where: { userId: id } })
        if (isAdmin) {
            if (roles && roles.length > 0) {
                await prisma.userrole.createMany({
                    data: roles.map((role: string) => ({
                        userId: id,
                        roleId: role,
                    })),
                })
            }
        }

        if (image && image.size > 0) {

            if (user.image)
                await deleteFileDb(user.image)
            if (user.imageCompressed)
                await deleteFileDb(user.imageCompressed)


            let imageId = null
            let imageCompressedUrl = null
            if (image?.size > 10000000) {
                return { status: 400, data: { message: f("filesizemax") + "10 mo" } };
            }

            const arrayBuffer = await image.arrayBuffer();

            const result = await compressImage(arrayBuffer, 0.1);
            if (result === null) return { status: 500, data: { message: e("error") } };

            const res = await uploadFileDB(image, session.data.user.id)
            const resCompressed = await uploadFileDB(result, session.data.user.id)

            if (res.status === 200 || res.data.file) imageId = res.data.file.id;
            if (resCompressed.status === 200 || resCompressed.data.file) imageCompressedUrl = resCompressed.data.file.id;

            await prisma.user.update({
                where: { id },
                data: {
                    image: imageId,
                    imageCompressed: imageCompressedUrl,
                },
            })
        }

        return { status: 200, data: { message: s("updatesuccess") } }
    } catch (error) {
        console.error("An error occurred in updateUser")
        return { status: 500, data: { message: e("error") } }
    }
}