import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db"
import { LoginSchema } from "@/lib/schema";
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcrypt"
import { getUserByid } from "./actions/user";
import { deleteTowFactorConfermationByUserId, getTowFactorConfermationByUserId } from "./actions/auth/tow-factor-confermation";
import { UAParser } from "ua-parser-js"
import DeviceDetector from 'device-detector-js';
import { v4 as uuidv4 } from 'uuid';

/* eslint-disable */
export const { handlers, auth, signIn, signOut } =
  NextAuth({
    pages: {
      signIn: "/auth/login"
    },
    adapter: PrismaAdapter(prisma),
    session: { strategy: "jwt" },
    callbacks: {
      async jwt({ token, user }) {

        if (user && user.id) {
          token.id = user.id
          try {

            // @ts-ignore
            const userAgent = user.userAgent || "Unknown";
            const deviceInfo = UAParser(userAgent);;
            const tokenSession = uuidv4();

            const existDevice = await prisma.session.findFirst({
              where: {
                userId: user.id,
                // @ts-ignore
                deviceName: user.deviceName || 'Unknown',
                // @ts-ignore
                deviceType: user.deviceType || 'Unknown',
                // @ts-ignore
                browser: `${user.browserName} ${user.browserVersion}`,
                // @ts-ignore
                os: `${user.osName} ${deviceInfo.os.version}`,
              },
            })

            if (existDevice) {
              await prisma.session.delete({
                where: {
                  id: existDevice.id,
                },
              })
            }
            const session = await prisma.session.create({
              data: {
                sessionToken: tokenSession,
                userId: user.id,
                expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
                // @ts-ignore
                deviceName: user.deviceName || 'Unknown',
                // @ts-ignore
                deviceType: user.deviceType || 'Unknown',
                // @ts-ignore
                browser: `${user.browserName} ${user.browserVersion}`,
                // @ts-ignore
                os: `${user.osName} ${deviceInfo.os.version}`,
              },
            });
            // @ts-ignore
            token.session = session

          } catch (error) {
            console.error("An error occurred in jwt");
          }
        }
        return token
      },
      async session({ session, token }) {
        // @ts-ignore
        session.user.id = token.id
        // @ts-ignore
        session.session = token.session
        return session
      },
      async signIn({ user, account }) {
        if (account?.provider !== "credentials") {
          return true
        }
        if (!user.id)
          return false
        const existingUser = await getUserByid(user.id);
        if (!existingUser)
          return false
        if (existingUser.data.isTwoFactorEnabled) {
          const towFacorConfermation = await getTowFactorConfermationByUserId(user.id);

          if (!towFacorConfermation.data) {
            return false
          }

          await deleteTowFactorConfermationByUserId(user.id);
        }
        return true
      }
    },
    providers: [
      Credentials({
        authorize: async (credentials, req) => {

          const userAgent = req?.headers.get("user-agent") || "Unknown";
          const deviceDetector = new DeviceDetector();
          const resultDevice = deviceDetector.parse(userAgent);

          const osName = resultDevice.os?.name || 'Unknown';  // Nom du système d'exploitation
          const deviceType = resultDevice.device?.type || 'Unknown';  // Type de device: Desktop, Mobile, etc.
          const deviceName = resultDevice.device?.model || 'Unknown';  // Nom du device (ex: "iPhone", "MacBook", etc.)
          const browserName = resultDevice.client?.name || 'Unknown';  // Nom du navigateur
          const browserVersion = resultDevice.client?.version || 'Unknown';  // Version du navigateur

          const result = LoginSchema.safeParse(credentials);
          if (!result.success) {
            return null
          }
          const { email, password } = result.data
          const user = await prisma.user.findFirst({
            where: {
              OR: [
                { email: email },
                { username: email }
              ]
            }
          })
          if (!user || !user.password) {
            return null
          }
          const isValid = await bcrypt.compare(password, user.password)
          if (!isValid) {
            return null
          }
          const sessionId = uuidv4();

          return {
            ...user,
            userAgent,
            deviceType,       // Type de device (Desktop, Mobile, etc.)
            deviceName,       // Nom du device (par exemple "iPhone")
            osName,           // Nom du système d'exploitation
            browserName,      // Nom du navigateur
            browserVersion,   // Version du navigateur
            sessionId
          };
        }
      })
    ]
  })