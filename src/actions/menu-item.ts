import { Home, Settings } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function getMenuItems() {
    const t = await getTranslations('Menu');
    const items = [
        {
            title: t('home'),
            url: "/admin",
            icon: Home,
        },
        {
            title: t("settings"),
            url: "/admin/settings",
            icon: Settings,
        },
    ]
    return items
} 