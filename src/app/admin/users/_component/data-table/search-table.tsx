import { Input } from '@/components/ui/input';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'

const SearchTable = ({ page, debouncedSearchQuery ,setDebouncedSearchQuery }: any) => {
    const router = useRouter()
    const s=useTranslations("System")
    const [searchQuery, setSearchQuery] = useState(debouncedSearchQuery??"");

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
            router.push(`/admin/users?page=${page}${searchQuery && searchQuery != "" ? "&search=" + searchQuery : ""}`)
        }, 500); // Délai de 500 ms

        return () => {
            clearTimeout(handler);
        };
    }, [searchQuery]);

    return (
        <Input
            placeholder={s("search")}
            value={searchQuery} // Utiliser searchQuery au lieu de globalFilter
            onChange={(event) => {
                setSearchQuery(event.target.value)
            }} // Mettre à jour searchQuery
            className="max-w-sm mb-4"
        />
    )
}

export default SearchTable
