"use client"
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from "@hookform/resolvers/zod"
import {
    Form,
    FormField,
    FormControl,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import { registerUser } from '@/actions/auth/auth'
import { useTranslations } from 'next-intl'

const RegisterForm = () => {
    const [loading, setLoading] = useState(false)
    const te=useTranslations('Settings error');
    const s=useTranslations('System');
    const t=useTranslations('Settings');

    const RegisterSchema = z.object({
        username: z
            .string({ required_error: te("username") })
            .min(3, { message: te("username6") })
            .max(20, { message: te("username20") }),
        email: z.string({ required_error: te("email") }).email({ message: te("emailinvalid") }),
        password: z.string({ required_error: te("password") }).min(6, { message: te("password6") }),
        passwordConfirm: z.string({ required_error: te("confirmpassword") }).min(6, { message: te("password6") }),
    }).refine((data) => data.password === data.passwordConfirm, {
        path: ["passwordConfirm"],
        message: te("confirmpasswordnotmatch"),
    });

    const form = useForm<z.infer<typeof RegisterSchema>>({
        resolver: zodResolver(RegisterSchema),
        defaultValues: {
            username: "",
            email: "",
            password: "",
            passwordConfirm: "",
        },
    })
    function onSubmit(values: z.infer<typeof RegisterSchema>) {
        setLoading(true)
        registerUser(values).then((res) => {
            if (res.status === 201) {  
                toast.success(s("registersuccess"))
            } else {
                toast.error(res.data.message)
            }
        })
        setLoading(false)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
                <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className='text-black'>{t("username")}</FormLabel>
                            <FormControl>
                                <Input className='border-gray-200 focus:border-black' placeholder={t("username")} {...field} />
                            </FormControl>
                            <FormMessage className='font-bold' />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className='text-black'>{t("email")}</FormLabel>
                            <FormControl>
                                <Input className='border-gray-200 focus:border-black' placeholder={t("email")} {...field} />
                            </FormControl>
                            <FormMessage className='font-bold' />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className='text-black'>{t("password")}</FormLabel>
                            <FormControl>
                                <Input className='border-gray-200 focus:border-black' placeholder={t("password")} {...field} />
                            </FormControl>
                            <FormMessage className='font-bold' />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="passwordConfirm"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className='text-black'>{t("confirmpassword")}</FormLabel>
                            <FormControl>
                                <Input className='border-gray-200 focus:border-black' placeholder={t("confirmpassword")} {...field} />
                            </FormControl>
                            <FormMessage className='font-bold' />
                        </FormItem>
                    )}
                />
                <div className='pt-4'>
                    <Button
                        disabled={loading} className={cn('font-bold w-full bg-black hover:bg-gray-800', loading && 'cursor-wait')} type="submit">{s("register")}</Button>
                </div>
            </form>
        </Form>
    )
}

export default RegisterForm
