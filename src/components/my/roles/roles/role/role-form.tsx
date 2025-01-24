"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Permission } from "./columns-permission";
import { DataTable } from "./data-table-permission";
import { useTranslations } from "next-intl";
import { AddRole, UpdateRole } from "@/actions/permissions";
import toast from "react-hot-toast";

type AddRoleFormProps = {
  permissions: Permission[];
  role?: { id: string; name: string, userCount: number };
  selectedPermissionNames?: string[];
};

export default function AddRoleForm({ permissions, role, selectedPermissionNames }: AddRoleFormProps) {
  const router = useRouter();
  const [roleName, setRoleName] = useState(role?.name || "");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [selectedPermissionsName, setSelectedPermissionsName] = useState<string[]>(selectedPermissionNames || []);
  const [error, setError] = useState("");
  const r=useTranslations("Roles")
  const p=useTranslations("Permissions")
  const s=useTranslations("System")
  const e=useTranslations("Error")

  // Créer le rôle
  const handleAddRole = async () => {
    if (!roleName) {
      setError(r("rolenamerequired"));
      return;
    }

    if (selectedPermissions.length === 0) {
      setError(r("permissionrequired"));
      return;
    }

    try {
      const permissions=selectedPermissionsName.join(",")
      let result;
      if(role?.id){
        result = await UpdateRole(role.id, roleName, permissions);        
      }else{
        result = await AddRole(roleName, permissions);
      }
      if (result.status === 200) {
        toast.success(result.data.message);
        if(role?.id){
          router.refresh();
        }else{
          router.push("/admin/roles");
        }
      }else if(result.status !== 200 && result.data.message){
        setError(result.data.message)
      }
      setError("")
    } catch (error) {
      setError(e("error"));
      console.error(error);
    }
  };

  return (
    <>
      {/* Champ pour le nom du rôle */}
      <div className="mb-6">
        <Input
          placeholder={r("rolename")}
          value={roleName}
          onChange={(e) => setRoleName(e.target.value)}
          className="w-1/2"
        />
      </div>

      {/* Tableau des permissions */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">{p("title")}</h2>
        <DataTable
          permissions={permissions}
          selectedPermissions={selectedPermissions}
          selectedPermissionNames={selectedPermissionsName}
          setSelectedPermissions={setSelectedPermissions}
          setSelectedPermissionsName={setSelectedPermissionsName}
        />
      </div>

      {/* Boutons */}
      <div className="flex gap-4">
        <Button onClick={handleAddRole}>{role?.id ? s("update") : r("addrole")}</Button>
        <Button
          variant="outline"
          onClick={() => router.push("/admin/roles")}
        >
          {s("cancel")}
        </Button>
      </div>

      {/* Affichage des erreurs */}
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{e("error")}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </>
  );
}