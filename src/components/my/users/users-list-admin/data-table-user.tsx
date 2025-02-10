"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
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
import { Button } from "@/components/ui/button";
import { getCountUsers, getUsers } from "@/actions/users/get";
import Loading from "@/components/myui/loading";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data: initialData,
}: DataTableProps<TData, TValue>) {
  const [data, setData] = useState<TData[]>(initialData);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(3);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [count, setCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState(""); // État pour la recherche
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(""); // État pour la recherche avec debounce

  const { session } = useSession();
  const s = useTranslations("System");

  // Débounce la recherche
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // Délai de 500 ms

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Fetch users when the page or search query changes
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      setData([]);
      try {
        const response = await getUsers(page, pageSize, debouncedSearchQuery); // Passer searchQuery à getUsers
        if (response.status === 200) {
          setData(response.data);
        }
        const countResponse = await getCountUsers();
        if (countResponse.status === 200) {
          setCount(countResponse.data);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [page, debouncedSearchQuery]); // Ajouter debouncedSearchQuery comme dépendance

  // Mark the component as mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(), // Supprimer getFilteredRowModel
  });

  const hasPermissionAction =
    (session?.user?.permissions.find((permission: string) => permission === "updateUser") ?? false) ||
    session?.user?.isAdmin;

  if (!mounted) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="w-full">
      <Input
        placeholder={s("search")}
        value={searchQuery} // Utiliser searchQuery au lieu de globalFilter
        onChange={(event) => setSearchQuery(event.target.value)} // Mettre à jour searchQuery
        className="max-w-sm mb-4"
      />
      {
        isLoading
          ? (<div className="h-[300px] flex items-center justify-center">
            <Loading />
          </div>)
          : <div className="rounded-md border p-2">
            <Table className="border">
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) =>
                      header.id !== "actions" || hasPermissionAction ? (
                        <TableHead key={header.id}>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      ) : null
                    )}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) =>
                        cell.column.id !== "actions" || hasPermissionAction ? (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ) : null
                      )}
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
          </div>}

      {/* Pagination */}
      {!isLoading && <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1 || isLoading}
        >
          Précédent
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((prev) => prev + 1)}
          disabled={page === Math.ceil(count / pageSize) || isLoading}
        >
          Suivant
        </Button>
      </div>}
    </div>
  );
}