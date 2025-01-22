"use server"
import { auth } from "@/auth";
import { generateVerificationToken, getVerificationTokenByEmail, getVerificationTokenByToken } from "./verification-token";
import { prisma } from "@/lib/db";
import bcrypt from "bcrypt";
import { sendEmail } from "../email";
import { getUserByEmailOrUsername } from "../user";
import { ResestSchema } from "@/lib/schema";


export async function resetPasswordWithoutConnection(data: { email: string, password?: string, code?: string }): Promise<{ status: number, data: any }> {
    try {
        const { email, password, code } = data;

        if(!email) {
            return { status: 400, data: { message: 'Email is required' } };
        }

        const user = await getUserByEmailOrUsername(email);
        if (user.status !== 200 || !user.data) {
            return { status: 400, data: { message: 'User not found' } };
        }

        const token = await getVerificationTokenByEmail(user.data.email);
        if (code)  {
            if (token.status !== 200 || !token.data) {
                return { status: 400, data: { message: 'Invalid confirmation code' } };
            }

            if (token.data.token !== code) {
                return { status: 400, data: { message: 'Invalid confirmation code' } };
            }
            const expiresAt= new Date(token.data.expiresAt)<new Date()
            if(expiresAt){
                return { status: 400, data: { message: 'Confirmation code expired' } };
            }

            createResetPasswordConfermation(user.data.id)            
             
            return { status: 200, data: { codeConfirmed: true } };
        }

        if (!password) {
            return { status: 400, data: { message: 'Password is required' } };
        }

        const existingResetPassword=await getResetPasswordConfermation(user.data.id)
        if(existingResetPassword.status!==200 || !existingResetPassword.data){
            return { status: 400, data: { message: 'Confirmation code not found' } };
        }
        
        const expiresAt= new Date(existingResetPassword.data.expiresAt)<new Date()
        if(expiresAt){
            return { status: 400, data: { message: 'Confirmation code expired' } };
        }
        
        const passwordHash = await bcrypt.hash(password, 10);
        await prisma.user.update({
            where: { id: user.data.id },
            data: { password: passwordHash },
        });

        await deleteResetPasswordConfermation(user.data.id)
        
        return { status: 200, data: { message: 'Password changed successfully' } };
    } catch (error) {
        console.error("An error occurred in resetPasswordWithoutConnection");
        return { status: 500, data: { message: 'An error occurred in resetPasswordWithoutConnection' } };
    }
}

export async function getConfirmationCodePasswordChange(emailOrUsername: string): Promise<{ status: number, data: any }> {
    try {
        const user = await getUserByEmailOrUsername(emailOrUsername);
        if (user.status !== 200 || !user.data) {
            return { status: 400, data: { message: 'User not found' } };
        }
        const toke = await generateVerificationToken(user.data.email);
        sendEmail(user.data.email, 'Confirmation code', 'Your confirmation code is ' + toke.data.token);
        return { status: 200, data: { message: 'Confirmation code sent successfully' } };
    } catch (error) {
        console.error("An error occurred in getConfirmationCode");
        return { status: 500, data: { message: 'An error occurred in getConfirmationCode' } };
    }
}

export async function createResetPasswordConfermation(id: string) : Promise<{ status: number, data: any }> {
    try {
        const existingResetPassword=await getResetPasswordConfermation(id)
        if(existingResetPassword){
            await deleteResetPasswordConfermation(id)
        }
        const verificationToken=await prisma.resetPasswordConfermation.create({
            data : {
                userId: id,
                expiredAt: new Date(new Date().getTime() + 1000 * 60 * 5)
            }
        })
        return { status: 200, data: verificationToken };
    } catch (error) {
        console.error("An error occurred in createResetPasswordConfermation");
        return { status: 500, data: { message: 'An error occurred in createResetPasswordConfermation' } };  
    }
}

export async function getResetPasswordConfermation(id: string) : Promise<{ status: number, data: any }> {
    try {
        const verificationToken=await prisma.resetPasswordConfermation.findFirst({
            where : {
                userId: id
            }
        })
        if(!verificationToken){
            return { status: 404, data: { message: 'Verification token not found' } };
        }
        return { status: 200, data: verificationToken };
    } catch (error) {
        console.error("An error occurred in getResetPasswordConfermation");
        return { status: 500, data: { message: 'An error occurred in getResetPasswordConfermation' } };  
    }
}

export async function deleteResetPasswordConfermation(id: string) : Promise<{ status: number, data: any }> {
    try {
        const verificationToken=await prisma.resetPasswordConfermation.deleteMany({
            where : {
                userId: id
            }
        })
        return { status: 200, data: verificationToken };
    } catch (error) {
        console.error("An error occurred in deleteResetPasswordConfermation");
        return { status: 500, data: { message: 'An error occurred in deleteResetPasswordConfermation' } };  
    }
}