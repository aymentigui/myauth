"use client"
import React, {  useState } from 'react'
import { LoginSchema } from '@/lib/schema'
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
import { loginUser } from '@/actions/auth/auth'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { getConfirmationCodePasswordChange } from '@/actions/auth/password-change'

const LoginForm = () => {
    const [loading, setLoading] = useState(false)
    const [twoFactorConfermation, setTwoFactorConfermation] = useState(false)
    const router = useRouter()

    const form = useForm<z.infer<typeof LoginSchema>>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })
    function onSubmit(values: z.infer<typeof LoginSchema>) {
        setLoading(true)
        loginUser(values).then((res) => {
            if (res.status === 200) {
                if (res.data.twoFactorConfermation) {
                    setTwoFactorConfermation(true)
                } else {
                    router.push('/admin')
                }
            } else {
                toast.error(res.data.message);
            }
        })
        setLoading(false)
    }

    const  passwordForget= async()=> {
        getConfirmationCodePasswordChange(form.getValues().email).then((res) => {
            if (res.status === 200) {
                router.push(`/auth/reset?email=${encodeURIComponent(form.getValues().email)}`)
            } else {
                toast.error(res.data.message)
            }
        })
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
                {!twoFactorConfermation && <>
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input placeholder="email or username" {...field} />
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
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input placeholder="password" {...field} />
                                </FormControl>
                                <FormMessage className='font-bold' />
                            </FormItem>
                        )}
                    />
                </>}
                {twoFactorConfermation && <>
                    <FormField
                        control={form.control}
                        name="code"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Code</FormLabel>
                                <FormControl>
                                    <Input placeholder="code" {...field} />
                                </FormControl>
                                <FormMessage className='font-bold' />
                            </FormItem>
                        )}
                    />
                </>}
                <Button variant='link' type='button' onClick={passwordForget} className='p-0'>Mot de passe oublie?</Button>
                <div className='pt-4'>
                    <Button
                        disabled={loading} className={cn('font-bold w-full', loading && 'cursor-wait')} type="submit">{twoFactorConfermation ? 'Confirmer' : 'Connecter'}</Button>
                </div>
            </form>
        </Form>
    )
}
export default LoginForm
