"use server"
import { FileSpreadsheet, Home, Settings, UserRoundCog, Users } from "lucide-react";
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
        {
            title: Menu("testimportcsv"),
            url: "/admin/testimport",
            icon: FileSpreadsheet,
            admin: false,
            permissions: [],
        },
        {
            title: Menu("more"),
            url: null,
            icon: null,
            admin: false,
            permissions: [],
            subItems: [
                {
                    title: Menu("testimportcsv"),
                    url: "/admin/more/testimport",
                    icon: FileSpreadsheet,
                    admin: false,
                    permissions: [],
                },
                {
                    title: Menu("fileslocalstorage"),
                    url: "/admin/more/upload-files",
                    icon: FileSpreadsheet,
                    admin: false,
                    permissions: [],
                },
            ],
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

    const filteredItems = (items: any) => {
        return items.filter((item: any) => {
            if (item.admin) return false;

            if(!item.permissions.every((permission:string) => userPermissions.includes(permission))) return false;
            if (item.subItems) {
                item.subItems = filteredItems(item.subItems); // Filtre récursif des sous-menus
                // Si après filtrage, il n'y a plus de sous-menus valides, on filtre l'élément parent
                if (item.subItems.length === 0) return false;
            }

            // On vérifie que l'utilisateur a toutes les permissions requises pour cet élément
            return item.permissions.every((permission:string) => userPermissions.includes(permission));
        });
    };

    const newItems = filteredItems(items);
    return newItems
} 
