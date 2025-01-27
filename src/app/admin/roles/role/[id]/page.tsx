import { accessPage } from "@/actions/permissions";
import { getRole } from "@/actions/roles/get";
import AddRoleForm from "@/components/my/roles/roles/role/role-form";
import { permissions } from "@/db/permissions";
import { getTranslations } from "next-intl/server";

export default async function AddRolePage({ params }: { params: { id: string } }) {
  const r = await getTranslations("Roles");
  const paramsID = await params;

  if(paramsID.id)
    await accessPage(['roles_update']);
  else
    await accessPage(['roles_create']);

  const role = await getRole(paramsID.id);

  if (role.status !== 200 || !role.data) return null

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{!paramsID.id? r("addrole") : r("updaterole")}</h1>
      <AddRoleForm permissions={permissions} role={role.data} selectedPermissionNames={role.data.permissions.split(",")} />
    </div>
  );
}