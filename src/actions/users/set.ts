"use server"
import { prisma } from "@/lib/db";
import { getTranslations } from "next-intl/server";
import { z } from "zod";
import bcrypt from "bcrypt";
import { withAuthorizationPermission, verifySession } from "../permissions";
import { compressImage } from "../util/util";
import { uploadFileDB } from "../localstorage/upload-db";


export async function createUser(data: any) {
    const u = await getTranslations("Users");
    const s = await getTranslations("System");
    const e = await getTranslations('Error');
    const f = await getTranslations('Files');

    const userSchema = z.object({
        firstname: z.string().min(1, u("firstnamerequired")),
        lastname: z.string().min(1, u("lastnamerequired")),
        username: z.string().min(1, u("usernamerequired")),
        email: z.string().email(u("emailinvalid")),
        password: z.string().min(6, u("password6")),
        isAdmin: z.boolean().default(false),
        roles: z.array(z.string()).optional(),
        image: z.instanceof(File, { message: u("avatarinvalid") }).optional().refine((file) => !file || file.type.startsWith("image/"), {
            message: u("avatarinvalid")
        })
    });
    try {
        const session = await verifySession()
        if (!session || session.status != 200) {
            return { status: 401, data: { message: e('unauthorized') } }
        }
        const hasPermissionAdd = await withAuthorizationPermission( ['users_create']);

        if (hasPermissionAdd.status != 200 || !hasPermissionAdd.data.hasPermission) {
            return { status: 403, data: { message: e('forbidden') } };
        }
        const result = userSchema.safeParse(data);

        if (!result.success) {
            console.log(result.error.errors);
            return { status: 400, data: { errors: result.error.errors } };
        }
        const { firstname, lastname, username, email, password, isAdmin, roles, image } = result.data;

        const usernameExists = await prisma.user.findUnique({ where: { username } });
        if (usernameExists) {
            return { status: 400, data: { message: u("usernameexists") } };
        }

        const emailExists = await prisma.user.findUnique({ where: { email } });
        if (emailExists) {
            return { status: 400, data: { message: u("emailexists") } };
        }

        let imageId = null
        let imageCompressedUrl = null
        if (image && image.size > 0) {
            if (image?.size > 10000000) {
                return { status: 400, data: { message: f("filesizemax")+"10 mo" } };
            }

            const arrayBuffer = await image.arrayBuffer();

            const result = await compressImage(arrayBuffer, 0.1);
            if (result===null) return { status: 500, data: { message: e("error") } };

            const res = await uploadFileDB(image,session.data.user.id)
            const resCompressed = await uploadFileDB(result,session.data.user.id)
            
            if (res.status === 200 || res.data.file) imageId = res.data.file.id;
            if (resCompressed.status === 200 || resCompressed.data.file) imageCompressedUrl = resCompressed.data.file.id;            
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                firstname,
                lastname,
                username,
                email,
                image:imageId,
                imageCompressed:imageCompressedUrl,
                password: hashedPassword,
                isAdmin: (isAdmin && session.data.user.isAdmin) ? true : false,
            },
        });

        if (!isAdmin) {
            const rolesFound = await prisma.role.findMany({ where: { id: { in: roles } } });
            await prisma.userrole.createMany({
                data: rolesFound.map((role: any) => ({
                    userId: user.id,
                    roleId: role.id,
                })),
            })
        }

        

        return { status: 200, data: { message: s("createsuccess") } };
    } catch (error) {
        console.error("An error occurred in createUser" + error);
        return { status: 500, data: { message: s("createfail") } };
    }
}