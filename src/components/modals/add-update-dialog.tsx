"use client";

import { createUser } from "@/actions/users/set";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAddUpdateUserDialog } from "@/context/add-update-dialog-context";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Select from "react-select";
import { useEffect, useState } from "react";
import { updateUser } from "@/actions/users/update";
import { useRouter } from "next/navigation";
import { getRoles } from "@/actions/roles/get";
import AvatarUploader from "../myui/avata-uploader";
import { Loader2 } from "lucide-react";

type Role = {
  id: string;
  name: string;
  userCount: number;
};


export const AddUpdateUserDialog = () => {
  const u = useTranslations("Users");
  const { isOpen, closeDialog, isAdd, user } = useAddUpdateUserDialog();
  const [roles, setRoles] = useState<Role[]>([]);
  const [image, setImage] = useState<string | null>(null);
  const router = useRouter()
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getRoles().then((res) => {
      if (res && res.status === 200) {
        setRoles(res.data)
      }
    });
  }, []);

  const userSchema = z.object({
    firstname: z.string().min(1, u("firstnamerequired")),
    lastname: z.string().min(1, u("lastnamerequired")),
    username: z.string().min(1, u("usernamerequired")),
    email: z.string().email(u("emailinvalid")),
    password: z.string().optional(),
    isAdmin: z.boolean().default(false),
    roles: z.array(z.string()).optional(),
    image: z
      .instanceof(File, { message: u("avatarinvalid") })
      .optional()
      .refine((file) => !file || file.type.startsWith("image/"), {
        message: u("onlyimagesallowed"),
      }),
  }).refine((data) => {
    if (!isAdd && (!data.password || data.password === "" || data.password === null)) {
      return true;
    } else {
      return String(data.password).length >= 6;
    }
  }, {
    path: ["password"],
    message: u("password6"),
  });

  type UserFormValues = z.infer<typeof userSchema>;

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstname: "",
      lastname: "",
      username: "",
      email: "",
      password: "",
      isAdmin: false,
      roles: [],
    },
  });

  const isAdmin = form.watch("isAdmin");

  useEffect(() => {
    if (user) {
      form.setValue("firstname", user.firstname ?? "");
      form.setValue("lastname", user.lastname ?? "");
      form.setValue("username", user.username ?? "");
      form.setValue("email", user.email ?? "");
      form.setValue("isAdmin", user.isAdmin ?? false);
      form.setValue("roles", roles.filter((role) => user.roles.includes(role.name)).map((role) => role.id));
      setImage(user.image ?? null);
    }
  }, [user])

  const onSubmit = async (data: UserFormValues) => {
    setLoading(true);
    let res;
    if (isAdd) {
      res = await createUser(data);
    } else {
      res = await updateUser(user?.id ?? "", (data));
    }
    if (res.status === 200) {
      toast.success(res.data.message);
      closeDialog();
      form.reset();
      setLoading(false);
      router.refresh();
    } else {
      setLoading(false);
      if (res.data.errors) {
        res.data.errors.map((err: any) => {
          toast.error(err.message);
        })
      } else {
        toast.error(res.data.message);
      }
    }
  };

  const handleClose = () => {
    closeDialog();
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[70%] max-w-[70%] h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">{isAdd ? u("adduser") : u("updateuser")}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <AvatarUploader name="image" image={image} />
            <div className="grid grid-cols-2 gap-4">
              {/* First Name */}
              <FormField
                control={form.control}
                name="firstname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{u("firstname")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={u("firstname")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Last Name */}
              <FormField
                control={form.control}
                name="lastname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{u("lastname")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={u("lastname")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Username */}
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{u("username")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={u("username")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{u("email")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={u("email")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{u("password")}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      {...field}
                      placeholder={u("password")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Is Admin */}
            <FormField
              control={form.control}
              name="isAdmin"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel>{u("isadmin")}</FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Roles (Multi-Select) */}
            {!isAdmin && (
              <FormField
                control={form.control}
                name="roles"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{u("roles")}</FormLabel>
                    <FormControl>
                      <Select
                        isMulti
                        options={
                          roles?.map((role) => ({
                            value: role.id,
                            label: role.name,
                          }))
                        }
                        value={field.value?.map((role) => ({
                          value: role,
                          label: roles?.find((r) => r.id === role)?.name,
                        }))}
                        onChange={(selectedOptions) => {
                          field.onChange(
                            selectedOptions.map((option) => option.value)
                          );
                        }}
                        placeholder={u("selectrole")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Submit Button */}
            <Button type="submit" className={`w-full`}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isAdd ? u("adduser") : u("updateuser")}
            </Button>
          </form>
          <div className="w-full h-20"></div>
        </Form>
      </DialogContent>
    </Dialog>
  );
};