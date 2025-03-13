import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import React from 'react'

const BackPagination = ({ page, setPage, searchQuery, isLoading}: any) => {
    const router=useRouter()
    const s = useTranslations("System")

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={() => {
                router.push(`/admin/users?page=${Math.max(page - 1, 1)}${searchQuery && searchQuery != "" ? "&search=" + searchQuery : ""}`)
                setPage((prev: any) => Math.max(prev - 1, 1))
            }
            }
            disabled={page === 1 || isLoading}
        >
            {s("back")}
        </Button>
    )
}

export default BackPagination
