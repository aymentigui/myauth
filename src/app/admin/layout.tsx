import type { Metadata } from "next";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";
import DivAdmin from "@/components/my/admin/div-admin";
import HeaderAdmin from "@/components/my/admin/header";
import { AddUpdateUserDialog } from "@/components/modals/add-update-dialog";
import { AddUpdateUserDialogProvider } from "@/context/add-update-dialog-context";

export const metadata: Metadata = {
  title: "Admin",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  return (
    <div>
      <SidebarProvider >
        <AppSidebar />
        <DivAdmin />
        <AddUpdateUserDialogProvider>
          <main className="flex min-h-screen flex-col w-full">
            <HeaderAdmin>
              <SidebarTrigger />
            </HeaderAdmin>
            <div className="w-full p-4">
              {children}
              <AddUpdateUserDialog />
            </div>
          </main>
        </AddUpdateUserDialogProvider>
      </SidebarProvider>
    </div>
  );
}
