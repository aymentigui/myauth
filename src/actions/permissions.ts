"use server"

import { prisma } from "@/lib/db";
import { getTranslations } from "next-intl/server";
import { logoutUser, verifySession } from "./auth/auth";
import { redirect } from "next/navigation";

export async function getUserPermissions(id: string): Promise<{ status: number, data: any }> {
    const e = await getTranslations('Error');
    try {
        const userPermissions = await prisma.userrole.findMany({
            where: { userId: id },
            include: { role: true },
        })

        const permissions = userPermissions.flatMap((role) => role.role.permissions.split(","));

        return { status: 200, data: permissions };

    } catch (error) {
        console.error("An error occurred in getUserPermissions");
        return { status: 500, data: { message: e("error") } };
    }
}

export async function getUserRolesNames(id: string): Promise<{ status: number, data: any }> {
    const e = await getTranslations('Error');
    try {
        const userRoles = await prisma.userrole.findMany({
            where: { userId: id },
            include: { role: true },
        });

        const roles = userRoles.flatMap((role) => role.role.name);

        return { status: 200, data: roles };
    } catch (error) {
        console.error("An error occurred in getUserRoles");
        return { status: 500, data: { message: e("error") } };
    }
}

export async function getUserRolesId(id: string): Promise<{ status: number, data: any }> {
    const e = await getTranslations('Error');
    try {
        const userRoles = await prisma.userrole.findMany({
            where: { userId: id }
        });

        const roles = userRoles.flatMap((role) => role.roleId);

        return { status: 200, data: roles };
    } catch (error) {
        console.error("An error occurred in getUserRoles");
        return { status: 500, data: { message: e("error") } };
    }
}

export async function withAuthorizationPermission(
    requiredPermission: string[],
    requireAdmin?: boolean
) {
    const e = await getTranslations('Error');
    try {
        const session = await verifySession();
        if (session.status !== 200 || !session.data || !session.data.user) {
            return { status: 401, data: { message: e("unauthorized") } };
        }

        const isAdmin=await ISADMIN2(session.data.user.id);

        if(isAdmin.status === 200 && isAdmin.data.isAdmin) {
            return { status: 200, data: { hasPermission: true } };
        }

        if (requireAdmin) {
            return { status: 403, data: { message: e("forbidden") } };
        }

        const permissions = await getUserPermissions(session.data.user.id);
        if (permissions.status !== 200 || !permissions.data) {
            return { status: 401, data: { message: e("unauthorized") } };
        }
        if (!requiredPermission.every((permission) => permissions.data.includes(permission))) {
            return { status: 403, data: { message: e("forbidden") } };
        }
        return { status: 200, data: { hasPermission: true } };
    } catch (error) {
        console.error("An error occurred in withAuthorization");
        return { status: 500, data: { message: e("error") } };
    }
}

export async function withAuthorizationPermission2(
    id: string,
    requiredPermission: string[],
    requireAdmin?: boolean
) {
    const e = await getTranslations('Error');
    try {

        const isAdmin=await ISADMIN2(id);

        if(isAdmin.status === 200 && isAdmin.data.isAdmin) {
            return { status: 200, data: { hasPermission: true } };
        }

        if (requireAdmin) {
            return { status: 403, data: { message: e("forbidden") } };
        }

        const permissions = await getUserPermissions(id);
        if (permissions.status !== 200 || !permissions.data) {
            return { status: 401, data: { message: e("unauthorized") } };
        }
        if (!requiredPermission.every((permission) => permissions.data.includes(permission))) {
            return { status: 403, data: { message: e("forbidden") } };
        }
        return { status: 200, data: { hasPermission: true } };
    } catch (error) {
        console.error("An error occurred in withAuthorization");
        return { status: 500, data: { message: e("error") } };
    }
}

export async function withAuthorizationRole(
    id: string,
    requiredRole: string[],
) {
    const e = await getTranslations('Error');
    try {
        const roles = await getUserRolesNames(id);
        if (roles.status !== 200 || !roles.data) {
            return { status: 401, data: { message: e("unauthorized") } };
        }
        if (!requiredRole.every((role) => roles.data.includes(role))) {
            return { status: 403, data: { message: e("forbidden") } };
        }
        return { status: 200, data: true };
    } catch (error) {
        console.error("An error occurred in withAuthorization");
        return { status: 500, data: { message: e("error") } };
    }
}


export async function ISADMIN() {
    const e = await getTranslations('Error');
    try {
        const session = await verifySession();
        if (!session?.data?.user) {
            return { status: 401, data: { message: e("unauthorized") } };
        }
        const isAdmin = await prisma.user.findUnique({ where: { id: session.data.user.id } });
        return { status: 200, data: { isAdmin: isAdmin?.isAdmin } };
    } catch (error) {
        console.error("An error occurred in ISADMIN");
        return { status: 500, data: { message: e("error") } };
    }
}

export async function ISADMIN2(id: string) {
    const e = await getTranslations('Error');
    try {
        const isAdmin = await prisma.user.findUnique({ where: { id: id } });
        return { status: 200, data: { isAdmin: isAdmin?.isAdmin } };
    } catch (error) {
        console.error("An error occurred in ISADMIN");
        return { status: 500, data: { message: e("error") } };
    }
}


export async function accessPage(requiredPermission: string[]) {
    const session = await verifySession();

    if (session.status !== 200 || !session.data || !session.data.user) {
        return redirect('/admin');
    }

    const isAdmin=await ISADMIN2(session.data.user.id);

    if(isAdmin.status === 200 && isAdmin.data.isAdmin) {
        return ;
    }
    const hasPermission = await withAuthorizationPermission2(session.data.user.id, requiredPermission);

    if (hasPermission.status !== 200 || !hasPermission.data || !hasPermission.data.hasPermission) {
        return redirect('/admin');
    }

    return null;
}

export async function accessPage2(id: string,requiredPermission: string[]) {

    if(!id) {
        return redirect('/admin');
    }
    const isAdmin=await ISADMIN2(id);

    if(isAdmin.status === 200 && isAdmin.data.isAdmin) {
        return ;
    }
    const hasPermission = await withAuthorizationPermission2(id, requiredPermission);

    if (hasPermission.status !== 200 || !hasPermission.data || !hasPermission.data.hasPermission) {
        return redirect('/admin');
    }

    return null;
}


export async function haveSession() {
    const session = await verifySession();

    if (session.status !== 200 || !session.data || !session.data.user) {
        const LogoutUser = await logoutUser();
        if (LogoutUser.status === 200)
            return redirect('/auth/login');
    }

    return session.data;
}