"use client"
import { haveSession } from '@/actions/permissions';
import { useSession } from '@/hooks/use-session';
import React, { useEffect } from 'react'

const DivAdmin = () => {
    const { setSession } = useSession()
    useEffect(() => {
        haveSession().then((res)=>{
            if(res)
                setSession(res)
            else 
                setSession({})
        });
    }, [])
    return (<></>)
}

export default DivAdmin
