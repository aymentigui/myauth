"use client"
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import React from 'react'

const AddRoleButton = () => {
    const r=useTranslations('Roles')
    const router=useRouter()

    return (
        <Button onClick={() => router.push("/admin/roles/role")} className='w-max'>{r('addrole')}</Button>
    )
}

export default AddRoleButton
