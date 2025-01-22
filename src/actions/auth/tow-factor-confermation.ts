"use server"
import { prisma } from "@/lib/db";

export async function createTowFactorConfermation(id: string) : Promise<{ status: number, data: any }> {
    try {
        const existingTwoFactorConfermation=await getTowFactorConfermationByUserId(id);
        if(existingTwoFactorConfermation.status===200 && existingTwoFactorConfermation.data){
            await deleteTowFactorConfermationByUserId(id);
        }
        const verificationToken=await prisma.twoFactorConfermation.create({
            data : {
                userId: id,
                expiredAt: new Date(new Date().getTime() + 1000 * 60 * 5)
            }
        })
        return { status: 200, data: verificationToken };
    } catch (error) {
        console.error("An error occurred in createTowFactorConfermation");
        return { status: 500, data: { message: 'An error occurred in createTowFactorConfermation' } };  
    }
}

export async function getTowFactorConfermationByUserId(id: string) : Promise<{ status: number, data: any }> {
    try {
        const verificationToken=await prisma.twoFactorConfermation.findFirst({
            where : {
                userId: id
            }
        })
        if(!verificationToken){
            return { status: 404, data: { message: 'Verification token not found' } };
        }
        return { status: 200, data: verificationToken };
    } catch (error) {
        console.error("An error occurred in getTowFactorConfermationByUserId");
        return { status: 500, data: { message: 'An error occurred in getTowFactorConfermationByUserId' } };  
    }
}

export async function deleteTowFactorConfermationByUserId(id: string) : Promise<{ status: number, data: any }> {
    try {
        const verificationToken=await prisma.twoFactorConfermation.deleteMany({
            where : {
                userId: id
            }
        })
        return { status: 200, data: verificationToken };
    } catch (error) {
        console.error("An error occurred in deleteTowFactorConfermation");
        return { status: 500, data: { message: 'An error occurred in deleteTowFactorConfermation' } };  
    }
}
