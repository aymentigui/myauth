"use server"

import { prisma } from "@/lib/db";
import { generateToken4Chiffres } from "../util";
import { getTranslations } from "next-intl/server";
export async function getVerificationTokenByEmail(email: string) : Promise<{ status: number, data: any }> {
    const e=await getTranslations('Error');
    try {
        const verificationToken=await prisma.verificationToken.findFirst({
            where : {
                email
            }
        })
        if(!verificationToken){
            console.log('Verification token not found');
            return { status: 404, data: { message: e("error") } };
        }
        return { status: 200, data: verificationToken };
    } catch (error) {
        console.error("An error occurred in getVerificationToken");
        return { status: 500, data: { message: e("error") } };  
    }
}

export async function getVerificationTokenByToken(token:string) : Promise<{ status: number, data: any }> {
    const e=await getTranslations('Error');
    try {
        const verificationToken=await prisma.verificationToken.findFirst(
            {
                where : {
                    token,
                    expiredAt: {
                        gt: new Date()
                    }
                }
            }
        )
        if(!verificationToken){
            console.log('Verification token not found');
            return { status: 404, data: { message: e("error") } };
        }
        return { status: 200, data: verificationToken };
    } catch (error) {
        console.error("An error occurred in getVerificationTokenByToken");
        return { status: 500, data: { message: e("error") } };  
    }
}

export async function deleteVerificationTokenByEmail(email:string) : Promise<{ status: number, data: any }> {
    const e=await getTranslations('Error');
    try {
        await prisma.verificationToken.deleteMany(
            {
                where : {
                    email
                }
            }
        )
        return { status: 200, data: {} };
    } catch (error) {
        console.error("An error occurred in getVerificationTokenByToken");
        return { status: 500, data: { message: e("error") } };  
    }
}

export async function generateVerificationToken(email: string) : Promise<{ status: number, data: any }> {
    const e=await getTranslations('Error');
    try {
        const token=generateToken4Chiffres();
        const expiredAt=new Date(new Date().getTime() + 60*60*1000);
        const existingToken=await getVerificationTokenByEmail(email);

        if(existingToken.status===200 && existingToken.data){
            await prisma.verificationToken.delete({
                where : {
                    id: existingToken.data.id
                }
            })
        }
        const verificationToken=await prisma.verificationToken.create({
            data : {
                email:email,
                token:token,
                expiredAt:expiredAt
            }
        })
        return { status: 200, data: verificationToken };
    } catch (error) {
        console.error("An error occurred in generateVerificationToken");

        return { status: 500, data: { message: e("error") } };  
    }
}

