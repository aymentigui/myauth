import { accessPage } from "@/actions/permissions";
import { getRole } from "@/actions/roles/get";
import AddRoleForm from "@/app/admin/roles/role/_component/forms/role-form";
import { Card } from "@/components/ui/card";
import { permissions } from "@/db/permissions";
import { getTranslations } from "next-intl/server";

export default async function AddRolePage({ params }: any) {
  const r = await getTranslations("Roles");
  const paramsID = await params;

  if (paramsID.id)
    await accessPage(['roles_update']);
  else
    await accessPage(['roles_create']);

  return (
    <Card className='p-4'>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">{!paramsID.id ? r("addrole") : r("updaterole")}</h1>
        <AddRoleForm permissions={permissions} roleId={paramsID.id}/>
      </div>
    </Card>
  );
}