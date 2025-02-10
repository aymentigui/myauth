import { DataTable } from "./data-table-user";
import { getTranslations } from "next-intl/server";
import { columns } from "./columns-user";

export default async function UsersAdminPage() {
  const r = await getTranslations("Users")  

  return (
    <div className="py-10">
      <h1 className="text-2xl font-bold mb-4">{r("title")}</h1>
      <DataTable columns={columns} data={[]} />
    </div>
  );
}