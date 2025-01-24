"use client"
import { verifySessionFetch } from '@/actions/actions-client/auth';
import React, { useEffect } from 'react'

const DivAdmin = () => {
    useEffect(() => {
        verifySessionFetch();
    }, [])
    return (
        <div className='display-none'>
            
        </div>
    )
}

export default DivAdmin
