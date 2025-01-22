"use client"
import { verifySessionFetch } from '@/actions/actions-client/auth';
import React, { useEffect } from 'react'
import { useTranslations } from 'next-intl';
import LanguageSwitcher from '@/components/my/language-switcher';

const AdminPage = () => {
  const t = useTranslations('Index');

  useEffect(() => {
    verifySessionFetch();
  }, [])

  return (
    <div>
      <h1>{t('title')}</h1>
      <LanguageSwitcher></LanguageSwitcher>
    </div >
  )
}

export default AdminPage