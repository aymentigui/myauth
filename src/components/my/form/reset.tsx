"use client"
import React, { useState } from 'react'
import { ResestSchema } from '@/lib/schema'
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
import { useRouter,useSearchParams  } from 'next/navigation'
import { resetPasswordWithoutConnection } from '@/actions/auth/password-change'

const ResetForm = () => {
    const [loading, setLoading] = useState(false)
    const [passwordForget, setPasswordForget] = useState(false)
    const router = useRouter()
    const params = useSearchParams()
    const email= params.get('email')

    if(!email){
        router.push('/auth/login')
    }

    const form = useForm<z.infer<typeof ResestSchema>>({
        resolver: zodResolver(ResestSchema),
        defaultValues: {
            passwordConfermation: "",
            password: "",
            code: "",
        },
    })

    function onSubmit(values: z.infer<typeof ResestSchema>) {
        setLoading(true)
        if(!email){
            router.push('/auth/login')
            return
        }
        const data = {
            email: email,
            password: values.password,
            code: values.code
        }
        resetPasswordWithoutConnection(data).then((res) => {
            console.log(res)
            if (res.status === 200) {
                if (res.data.codeConfirmed) {
                    setPasswordForget(true)
                    form.reset()
                } else {
                    router.push('/auth/login')
                }
            } else {
                toast.error(res.data.message);
            }
        })
        setLoading(false)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
                {passwordForget && <>
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Mot de passe</FormLabel>
                                <FormControl>
                                    <Input placeholder="mot de passe" {...field} />
                                </FormControl>
                                <FormMessage className='font-bold' />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="passwordConfermation"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Confirmer le mot de passe</FormLabel>
                                <FormControl>
                                    <Input placeholder="Confirmer le mot de passe" {...field} />
                                </FormControl>
                                <FormMessage className='font-bold' />
                            </FormItem>
                        )}
                    />
                </>}
                {!passwordForget && <>
                    <FormField
                        control={form.control}
                        name="code"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Code de confermation</FormLabel>
                                <FormControl>
                                    <Input placeholder="XXXX" {...field} />
                                </FormControl>
                                <FormMessage className='font-bold' />
                            </FormItem>
                        )}
                    />
                </>}
                <div className='pt-4'>
                    <Button
                        disabled={loading} className={cn('font-bold w-full', loading && 'cursor-wait')} type="submit">{!passwordForget ? 'Suivant' : 'Connecter'}</Button>
                </div>
            </form>
        </Form>
    )
}

export default ResetForm
