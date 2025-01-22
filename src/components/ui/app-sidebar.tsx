import { Home, Settings } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import LogoutButton from "../my/button/logout-button"
import { getLocale } from "next-intl/server";
import { getMenuItems } from "@/actions/menu-item";
import { getTranslations } from "next-intl/server";

export async function AppSidebar() {
  const locale = await getLocale();
  const items = await getMenuItems();
  const t = await getTranslations('Menu');

  return (
    <Sidebar side={locale=="ar"?"right":"left"}>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t('title')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator />
        <SidebarMenuButton asChild>
          <LogoutButton title={t('logout')} />
        </SidebarMenuButton>
        <SidebarSeparator />
        <SidebarFooter>
          <div className="text-center text-sm text-gray-500">
            {t('footer')}
          </div>
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  )
}
