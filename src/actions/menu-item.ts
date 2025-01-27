"use server"
import { Home, Settings, UserRoundCog, Users } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { verifySession } from "./auth/auth";
import { getUserPermissions, ISADMIN } from "./permissions";


const itemsMenu = async () =>{
    const Menu = await getTranslations('Menu');
    const items = [
        {
            title: Menu('home'),
            url: "/admin",
            icon: Home,
            admin: false,
            permissions: [],
        },
        {
            title: Menu("users"),
            url: "/admin/users",
            icon: Users,
            admin: false,
            permissions: ["users_view"],
        },
        {
            title: Menu("roles"),
            url: "/admin/roles",
            icon: UserRoundCog,
            admin: false,
            permissions: ["roles_view"],
        },
        {
            title: Menu("settings"),
            url: "/admin/settings",
            icon: Settings,
            admin: false,
            permissions: [],
        },
    ]
    return items
}

export async function getMenuItems() {
    const items = await itemsMenu()

    const session = await verifySession();
    if(!session || !session.data || !session.data.user) return []
    const isAdmin = await ISADMIN()
    if(isAdmin.status === 200 && isAdmin.data.isAdmin) return items
        
    const permissions = await getUserPermissions(session.data.user.id)
    if(!permissions || permissions.status !== 200 || !permissions.data) return []

    const userPermissions = permissions.data
    const filteredItems = items.filter(item => {
        if(item.admin) return false
        return item.permissions.every(permission => userPermissions.includes(permission))
    })
    return filteredItems
} 
