import { Home, Settings, UserRoundCog, Users } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function getMenuItems() {
    const Menu = await getTranslations('Menu');
    const items = [
        {
            title: Menu('home'),
            url: "/admin",
            icon: Home,
        },
        {
            title: Menu("users"),
            url: "/admin/users",
            icon: Users,
        },
        {
            title: Menu("roles"),
            url: "/admin/roles",
            icon: UserRoundCog,
        },
        {
            title: Menu("settings"),
            url: "/admin/settings",
            icon: Settings,
        },
    ]
    return items
} 