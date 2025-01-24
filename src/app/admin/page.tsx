"use client"
import { verifySessionFetch } from '@/actions/actions-client/auth';
import React, { useEffect } from 'react'
import { useTranslations } from 'next-intl';

const AdminPage = () => {
  const t = useTranslations('Index');

  useEffect(() => {
    verifySessionFetch();
  }, [])

  return (
    <div>
      <h1>{t('title')}</h1>
    </div >
  )
}

export default AdminPage