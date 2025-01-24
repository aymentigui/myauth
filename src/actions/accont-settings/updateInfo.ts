"use server"
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import bcrypt from "bcrypt";
import { verifySession } from "../auth/auth";
import { getTranslations } from "next-intl/server";

export async function updateEmail( email: string) : Promise<{ status: number, data: { message: string} }> {
    const EmailSchema = z.string().email({ message: "Adresse e-mail invalide" });
    const e=await getTranslations('Error');
    const te=await getTranslations('Settings error');
    const tv=await getTranslations('Settings validation');
    const s=await getTranslations('System');

    const session=await verifySession()
    if(!session || session.status!=200){
        return { status: 401, data: { message: e("unauthorized") } };
    }

    try {
        if (!email) {
            return { status: 400, data: { message: te("email") } };
        }

        if (!EmailSchema.safeParse(email).success) {
            return { status: 400, data: { message: te("emailinvalid") } };
        }
        const userExists = await prisma.user.findUnique({
            where: { email },
        })
        if(userExists){
            return { status: 400, data: { message: te("emailexists") } };
        }
        const user = await prisma.user.update({
            where: { id:session.data.session.userId },
            data: { email },
        });

        return { status: 200, data: { message: tv("email maj")} };
    } catch (error) {
        console.error("An error occurred in updateEmail");
        return { status: 500, data: { message: s("updatefail") } };  
    }
}
export async function updateUsername(username: string) : Promise<{ status: number, data: { message: string} }> {
    const e=await getTranslations('Error');
    const te=await getTranslations('Settings error');
    const tv=await getTranslations('Settings validation');
    const s=await getTranslations('System');

    const UsernameSchema = z.string().min(6, { message: te("username6") })

    const session=await verifySession()
    if(!session || session.status!=200){
        return { status: 401, data: { message: e("unauthorized") } };
    }
    
    try {
        if (!username) {
            return { status: 400, data: { message: te("username") } };
        }

        if (!UsernameSchema.safeParse(username).success) {
            return { status: 400, data: { message: te("usernameinvalid") } };
        }
        const userExists = await prisma.user.findUnique({
            where: { username },
        })
        if(userExists){
            return { status: 400, data: { message: te("usernameexists") } };
        }
        await prisma.user.update({
            where: { id:session.data.session.userId },
            data: { username },
        });

        return { status: 200, data: { message: tv("username maj") } };
    } catch (error) {
        console.error(s("Mise a jour echoue"));
        return { status: 500, data: { message: 'An error occurred in updateUsername' } };  
    }
}

export async function updateTwoFactorConfermation(twoFactorConfermation: boolean) : Promise<{ status: number, data: { message: string} }> {

    const e=await getTranslations('Error');
    const s=await getTranslations('System');

    const session=await verifySession()
    if(!session || session.status!=200){
        return { status: 401, data: { message: e("unauthorized") } };
    }
    
    try {
        await prisma.user.update({
            where: { id:session.data.session.userId },
            data: { isTwoFactorEnabled: twoFactorConfermation },
        });

        return { status: 200, data: { message: s("updatesuccess") } };
    } catch (error) {
        console.error("An error occurred in updateTwoFactorConfermation");
        return { status: 500, data: { message: s("updatefail") } };  
    }
}

export async function updatePassword(currentPassword: string, newPassword: string) : Promise<{ status: number, data: { message: string} }> {

    const e=await getTranslations('Error');
    const s=await getTranslations('System');
    const tv=await getTranslations('Settings validation');
    const te=await getTranslations('Settings error');
    const t=await getTranslations('Settings');

    const ResetPasswordSchema = z.string().min(6, { message: te("password6") });

    const session=await verifySession()
    if(!session || session.status!=200){
        return { status: 401, data: { message: e("unauthorized") } };
    }
    
    try {

        const user = await prisma.user.findUnique({
            where: { id:session.data.session.userId },
        })
        if(!user){
            return { status: 400, data: { message: e("usernotfound") } };
        }
        
        const passwordMatch = await bcrypt.compare(currentPassword, user.password);
        if (!passwordMatch) {
            return { status: 400, data: { message: te("currentpasswordinvalid") } };
        }

        if (!ResetPasswordSchema.safeParse(newPassword).success) {
            return { status: 400, data: { message: t("passwordinvalid") } };
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id:session.data.session.userId },
            data: { password: hashedPassword },
        });

        return { status: 200, data: { message: s("updatesuccess") } };
    } catch (error) {
        console.error("An error occurred in updatePassword");
        return { status: 500, data: { message: s("updatefail") } };  
    }
}

export async function deleteSession(id:string){
    const session=await verifySession()
    const e=await getTranslations('Error');
    const ss=await getTranslations('Sessions');
    const s=await getTranslations('System');

    if(!session || session.status!=200){
        return { status: 401, data: { message: e("unauthorized") } };
    }

    const sessionExisting=await prisma.session.findFirst({
        where : {
            id : id,
            userId : session.data.session.userId
        }
    })

    if(!sessionExisting){
        return { status: 400, data: { message: ss("sessionnotfound") } };
    }
    await prisma.session.deleteMany({
        where : {
            id : id,
            userId : session.data.session.userId
        }
    })
    return { status: 200, data: { message: s("deletesuccess") } };
}

export async function deleteAllSessions(){
    const session=await verifySession()
    const s=await getTranslations('System');
    const e=await getTranslations('Error');
    const ss=await getTranslations('Sessions');

    if(!session || session.status!=200){
        return { status: 401, data: { message: e("unauthorized") } };
    }

    const sessionExisting=await prisma.session.findFirst({
        where : {
            userId : session.data.session.userId
        }
    })

    if(!sessionExisting){
        return { status: 400, data: { message: ss("sessionnotfound") } };
    }
    await prisma.session.deleteMany({
        where : {
            userId : session.data.session.userId
        }
    })

    return { status: 200, data: { message: s("deletesuccess") } };
}