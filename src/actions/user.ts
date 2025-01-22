"use server"
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getTranslations } from "next-intl/server";

export async function getSession(): Promise<{ status: number, data: any }> {
    try {
        const session = await auth();
        if (!session) {
            return { status: 401, data: { message: 'Not authenticated' } };
        }
        return { status: 200, data: session };
    } catch (error) {
        console.error("An error occurred in getSession");
        return { status: 500, data: { message: 'An error occurred in getSession' } };
    }
}
export async function getUserByid(id : string): Promise<{ status: number, data: any }> {
    try {
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            return { status: 400, data: { message: 'User not found' } };
        }
        return { status: 200, data: user };
    } catch (error) {
        console.error("An error occurred in getUserByid");
        return { status: 500, data: { message: 'An error occurred in getUserByid' } };
    }
}

export async function getUserByEmailOrUsername(emailOrUsername : string): Promise<{ status: number, data: any }> {
    const e=await getTranslations('Error');
    
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
