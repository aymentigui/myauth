import { DataTable } from "./data-table-role";
import { columns } from "./columns-role";
import { getTranslations } from "next-intl/server";
import { getRoles } from "@/actions/permissions";



export default async function RolesPage() {
  const roles = await getRoles();
  if(roles.status !== 200 || !roles.data) return null
  const r=await getTranslations("Roles")

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">{r("title")}</h1>
      <DataTable columns={columns} data={roles.data} />
    </div>
  );
}