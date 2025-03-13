"use client"
import { DataTable } from "./data-table/data-table-user";
import { useLocale, useTranslations } from "next-intl";
import Loading from "@/components/myui/loading";
import { useEffect, useState } from "react";
import { useOrigin } from "@/hooks/use-origin";
import { useSearchParams } from "next/navigation";
import axios from "axios";

export default function UsersAdminPage() {
  const r = useTranslations("Users")

  const locale = useLocale()
  const origin = useOrigin()
  const searchParams = useSearchParams();

  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [page, setPage] = useState(searchParams.get("page") ? Number(searchParams.get("page")) : 1);
  const pageSize = 8;
  const [count, setCount] = useState(0);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(""); // Etat pour la recherche avec debounce


  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page, debouncedSearchQuery, mounted]); // Ajouter debouncedSearchQuery comme dépendance


  const fetchProducts = async () => {
    setData([]);
    try {
      if (!origin) return
      setIsLoading(true);
      const response = await axios(origin + "/api/admin/users", { params: { page, pageSize, search: debouncedSearchQuery } });
      console.log(response)
      if (response.status === 200) {
        setData(response.data);
      }

      const countResponse = await axios(origin + "/api/admin/users", { params: { search: debouncedSearchQuery, count: true } });
      if (countResponse.status === 200) {
        setCount(countResponse.data);
      }

    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="py-10">
      <h1 className="text-2xl font-bold mb-4">{r("title")}</h1>
      <DataTable
        data={data}
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        debouncedSearchQuery={debouncedSearchQuery}
        setDebouncedSearchQuery={setDebouncedSearchQuery}
        page={page}
        setPage={setPage}
        pageSize={pageSize}
        count={count}
        showPagination
        showSearch
      />
    </div>
  );
}