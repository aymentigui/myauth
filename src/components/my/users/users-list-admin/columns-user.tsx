"use client"
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Trash, ArrowUpDown, Settings2 } from "lucide-react";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import { deleteUsers } from "@/actions/users/delete";
import AddUpdateUserButton from "../buttons/add-update-user";
import { useAddUpdateUserDialog } from "@/context/add-update-dialog-context";

export type User = {
  id: string;
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  image: string;
  roles: string[];
  isAdmin: boolean;
};

const fitstnameHeader = (column: any) => {
  const u = useTranslations("Users")
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className="flex justify-between"
    >
      {u("firstname")}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );
};

const lastnameHeader = (column: any) => {
  const u = useTranslations("Users")
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className="flex justify-between"
    >
      {u("lastname")}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );
};

const emailHeader = (column: any) => {
  const u = useTranslations("Users")
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className="flex justify-between"
    >
      {u("email")}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );
};

const usernameHeader = (column: any) => {
  const u = useTranslations("Users")
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className="flex justify-between"
    >
      {u("username")}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );
};

const rolesHeader = (column: any) => {
  const u = useTranslations("Users")
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className="flex justify-between"
    >
      {u("roles")}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );
};

const rolesCell = (row: any) => {
  const u = useTranslations("Users");
  const roles = row.getValue("roles") as string[];
  const isAdmin = row.original.isAdmin as boolean;

  return (
    <div className="w-4/6">
      {isAdmin ? u("isadmin") : roles.join(", ") || "No roles"}
    </div>
  );
};

const actionsCell = (row: any) => {
  const user = row.original;
  const router = useRouter();
  const { openDialog } = useAddUpdateUserDialog();

  const handleOpenDialogWithTitle = () => {
    openDialog(false,row.original)
  };

  return (
    <div className="w-1/6 flex gap-2">
      <Button
        onClick={() => deleteUserHandler(user.id, router)}
        variant="destructive"
      >
        <Trash />
      </Button>
      <Button variant={"outline"} onClick={handleOpenDialogWithTitle}>
        <Settings2 />
      </Button>
    </div>
  );
};

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "firstname",
    header: ({ column }) => fitstnameHeader(column),
    cell: ({ row }) => (
      <div className="w-4/6">
        {row.getValue("firstname")}
      </div>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "lastname",
    header: ({ column }) => lastnameHeader(column),
    cell: ({ row }) => (
      <div className="w-4/6">
        {row.getValue("lastname")}
      </div>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "email",
    header: ({ column }) => emailHeader(column),
    cell: ({ row }) => (
      <div className="w-4/6">
        {row.getValue("email")}
      </div>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "username",
    header: ({ column }) => usernameHeader(column),
    cell: ({ row }) => (
      <div className="w-4/6">
        {row.getValue("username")}
      </div>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "roles",
    header: ({ column }) => rolesHeader(column),
    cell: ({ row }) => (
      rolesCell(row)
    ),
    enableSorting: true,
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      return actionsCell(row);
    },
  },
];

const deleteUserHandler = async (userId: string, router: any) => {
  const response = await deleteUsers([userId]);
  if (response.status === 200) {
    toast.success(response.data.message);
    router.refresh();
  } else {
    toast.error(response.data.message)
  }
};


