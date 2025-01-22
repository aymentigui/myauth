"use server"
import { auth, signIn, signOut } from '@/auth';
import { prisma } from '@/lib/db';
import { LoginSchema, RegisterSchema } from '@/lib/schema';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { deleteVerificationTokenByEmail, generateVerificationToken, getVerificationTokenByEmail, getVerificationTokenByToken } from './verification-token';
import { sendEmail } from '../email';
import { createTowFactorConfermation } from './tow-factor-confermation';

export async function registerUser(data: z.infer<typeof RegisterSchema>): Promise<{ status: number, data: any }> {

    const result = RegisterSchema.safeParse(data);

    if (!result.success) {
        console.log(result.error.errors);
        return { status: 400, data: result.error.errors };
    }
    const { username, email, password } = result.data;


    try {
        const existingUserByUsername = await prisma.user.findUnique({
            where: { username },
        });

        if (existingUserByUsername) {
            console.log('Username already exists');
            return { status: 400, data: { message: 'Username already exists' } };
        }

        const existingUserByEmail = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUserByEmail) {
            console.log('Email already exists');
            return { status: 400, data: { message: 'Email already exists' } };
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                username,
                email,
                password: passwordHash, // Note: In a real application, make sure to hash the password before storing it
            },
        });
        console.log('User created successfully');
        return { status: 201, data: newUser };
    } catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
            return { status: 500, data: { message: error.message } };
        }
        console.error("An error occurred");
        return { status: 500, data: { message: 'An error occurred' } };
    }
}

export async function loginUser(data: z.infer<typeof LoginSchema>): Promise<{ status: number, data: any }> {

    const result = LoginSchema.safeParse(data);

    if (!result.success) {
        console.log(result.error.errors);
        return { status: 400, data: result.error.errors };
    }
    const { email, password, code } = result.data;

    try {
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: email },
                    { username: email }
                ]
            }
        })

        if (!user) {
            console.log('User not found');
            return { status: 400, data: { message: 'User not found' } };
        }

        if (!user.password) {
            console.log('You must connect with your provider');
            return { status: 400, data: { message: 'You must connect with your provider' } };
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            console.log('Invalid password');
            return { status: 400, data: { message: 'Invalid password' } };
        }

        if (user.isTwoFactorEnabled && user.email) {
            if (!code) {
                const token = await generateVerificationToken(user.email);
                sendEmail(user.email, 'Confirmation code', 'Your confirmation code is ' + token.data.token);
                return { status: 200, data: { twoFactorConfermation: true } };
            } else {
                const token = await getVerificationTokenByEmail(user.email);
                if (token.status !== 200 || !token.data) {
                    return { status: 400, data: { message: 'Invalid code' } };
                }
                if (token.data.token !== code) {
                    return { status: 400, data: { message: 'Invalid code' } };
                }
                const expired = new Date(token.data.expiredAt) < new Date();
                if (expired) {
                    return { status: 400, data: { message: 'Code expired' } };
                }
                await deleteVerificationTokenByEmail(user.email);
                createTowFactorConfermation(user.id);
            }
        }

        try {
            await signIn("credentials", { email, password, redirect: false });
            console.log('Login successful');
            return { status: 200, data: user };
        } catch (error) {
            if (error instanceof Error) {
                console.error(error.message);
                return { status: 500, data: { message: error.message } };
            }
            console.error(error);
            return { status: 500, data: { message: 'An error occurred' } };
        }
    } catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
            return { status: 500, data: { message: 'An error occurred' } };
        }
        console.error("An error occurred");
        return { status: 500, data: { message: 'An error occurred' } };
    }
}

export async function logoutUser() {
    try {
        await signOut({ redirect: false });
        console.log('Logout successful');
        return { status: 200, data: { message: 'Logout successful' } };
    } catch (error) {
        console.error("An error occurred in logout");
        return { status: 500, data: { message: 'An error occurred in logout' } };
    }
}


export async function verifySession(): Promise<{ status: number, data: any }> {
    try {
        const session = await auth();
        // @ts-ignore
        if (!session || !session.user || !session.session) {
            return { status: 401, data: { message: 'Not authenticated' } }
        }

        const existingSession = await prisma.session.findFirst({
            where: {
                // @ts-ignore
                id: session.session.id,
                userId: session.user.id,
                expires: {
                    gt: new Date()
                }
            }
        })
        if (!existingSession) {
            return { status: 401, data: { message: 'Not authenticated' } }
        }

        return { status: 200, data: session }
    } catch (error) {
        console.error("An error occurred in verifySession");
        return { status: 500, data: { message: 'An error occurred in verifySession' } }
    }
}
