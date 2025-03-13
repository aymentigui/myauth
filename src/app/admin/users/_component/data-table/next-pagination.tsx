import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import React from 'react'

const NextPagination = ({ page, setPage, count, pageSize, isLoading, searchQuery }: any) => {
    const router=useRouter()
    const s = useTranslations("System")

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={() => { setPage((prev: any) => prev + 1); router.push(`/admin/users?page=${page + 1}${searchQuery && searchQuery != "" ? "&search=" + searchQuery : ""}`) }}
            disabled={page === Math.ceil(count / pageSize) || isLoading}
        >
            {s("next")}
        </Button>
    )
}

export default NextPagination
