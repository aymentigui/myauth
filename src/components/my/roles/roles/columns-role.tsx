"use client"
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Settings2, Trash, ArrowUpDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { deleteRole } from "@/actions/permissions";

export type Role = {
  id: string;
  name: string;
  userCount: number;
};

const nameHeader = (column: any) => {
  const r=useTranslations("Roles")
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className="w-3/6 flex justify-between"
    >
      {r("title")}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );
};

const totalusersHeader = () => {
  const r=useTranslations("Roles")
  const [selectedLanguage, setSelectedLanguage] = useState("");

  useEffect(()=>{
    setSelectedLanguage(Cookies.get('lang') || 'en')
  },[])

  return (
    <div className={selectedLanguage === "ar" ? "text-right" : ""}>{r("totalusers")}</div>
  )
}


export const columns: ColumnDef<Role>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => nameHeader(column),
    cell: ({ row }) => (
      <div className="w-4/6">
        {row.getValue("name")}
      </div>
    ),
    enableSorting: true, 
  },
  {
    accessorKey: "userCount",
    header: totalusersHeader,
    cell: ({ row }) => (
      <div className="w-1/6">
        {row.getValue("userCount")}
      </div>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      const role = row.original;
      const router = useRouter();

      return (
        <div className="w-1/6 flex gap-2">
          <Button
            onClick={() => router.push(`/admin/roles/role/${role.id}`)}
            variant="outline"
          >
            <Settings2 />
          </Button>
          <Button
            onClick={() => deleteRoleHandler(role.id,router)}
            variant="destructive"
          >
            <Trash />
          </Button>
        </div>
      );
    },
  },
];

const deleteRoleHandler = async (roleId: string, router: any) => {
  const response = await deleteRole(roleId);
  if (response.status === 200) {
    toast.success(response.data.message);
    router.refresh();
  }else{
    toast.error(response.data.message)
  }
};


