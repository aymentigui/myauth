"use client"
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { cn } from '@/lib/utils'
import { updateEmail, updateImage } from '@/actions/accont-settings/updateInfo'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import AvatarUploader from '@/components/myui/avata-uploader'



const ImageForm = ({ image }: { image: string }) => {
    const [loading, setLoading] = useState(false)
    const t = useTranslations('Settings');
    const te = useTranslations('Settings error');
    const tv = useTranslations('Settings validation');
    const ts = useTranslations('System');
    const u = useTranslations('Users');
    const ImageScema = z.object({
        image: z
            .instanceof(File, { message: u("avatarinvalid") })
            .optional()
            .refine((file) => !file || file.type.startsWith("image/"), {
                message: u("onlyimagesallowed"),
            }),
    })

    const form = useForm<z.infer<typeof ImageScema>>({
        resolver: zodResolver(ImageScema),
    })

    const imageChnage = form.watch('image')

    const onSubmit = async (data: z.infer<typeof ImageScema>) => {
        setLoading(true)
        if (data.image) {
            const res = await updateImage(data.image)
            if (res.status === 200) {
                toast.success(ts("updatesuccess"))
                form.reset()
            } else {
                toast.error(res.data.message)
            }
        }
        setLoading(false)
    }

    return (
        <div className='my-4'>
            <div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex justify-between items-center flex-nowrap gap-4">
                        <AvatarUploader name="image" image={image} />
                        <div className='pt-6'>
                            {imageChnage && <Button
                                disabled={loading} className={cn('font-bold w-full', loading && 'cursor-wait')} type="submit">{ts('save')}
                            </Button>}
                        </div>
                    </form>
                </Form>
            </div>

        </div>
    )
}

export default ImageForm
