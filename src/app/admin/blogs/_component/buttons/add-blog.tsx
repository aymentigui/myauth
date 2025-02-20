"use client"
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import React from 'react'

const AddBlogButton = () => {
    const b=useTranslations('Blogs')
    const router=useRouter()

    return (
        <Button onClick={() => router.push("/admin/blogs/blog")} className='w-max'>{b('addblog')}</Button>
    )
}

export default AddBlogButton
