"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useSession } from "@/hooks/use-session";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const { session } = useSession()
  const [mounted, setMounted] = useState(false);
  const s = useTranslations('System')

  useEffect(() => {
    setMounted(true);
  }, [session]);

  if(!mounted){
    return (<div>
    </div>)
  }

  const hasPermissionAction = (session?.user?.permissions.find((permission: string) => permission === "updateUser") ?? false) || session?.user?.isAdmin;

  
  return (
    <div>
      <Input
        placeholder={s("search")}
        value={(table.getState().globalFilter as string) ?? ""}
        onChange={(event) => table.setGlobalFilter(event.target.value)}
        className="max-w-sm mb-4"
      />
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                (header.id !== "actions" || (hasPermissionAction)) && <TableHead
                  key={header.id}
                // className={`
                //   ${selectedLanguage=="ar"?"text-right":""}
                //   ${header.id === "name" ? "w-3/6" : ""}
                //   ${header.id === "userCount" ? "w-2/6" : ""}
                //   ${header.id === "actions" ? "w-1/6" : ""}
                // `}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  (cell.column.id !== "actions" || (hasPermissionAction)) && <TableCell
                    key={cell.id}
                  // className={`
                  //   ${cell.column.id === "name" ? "w-4/6" : ""}
                  //   ${cell.column.id === "userCount" ? "w-1/6" : ""}
                  //   ${cell.column.id === "actions" ? "w-1/6" : ""}
                  // `}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                {s("noresults")}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}