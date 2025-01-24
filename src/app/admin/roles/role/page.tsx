import AddRoleForm from "@/components/my/roles/roles/role/role-form";
import { permissions } from "@/db/permissions";
import { getTranslations } from "next-intl/server";

// Fonction pour récupérer les permissions (simulée)

export default async function AddRolePage() {
  const r=await getTranslations("Roles")

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{r("addrole")}</h1>
      <AddRoleForm permissions={permissions} />
    </div>
  );
}