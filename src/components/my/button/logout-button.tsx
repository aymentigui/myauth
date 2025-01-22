"use client"
import { logoutUser } from '@/actions/auth/auth';
import { LogOut } from 'lucide-react';
import React from 'react'

const LogoutButton = ({title}:{title:string}) => {
  const logout = async () => {
    const response = await logoutUser();
    if (response.status === 200) {
      window.location.href = '/auth/login';
    }
  };

  return (
    <div onClick={logout} className="flex items-center p-2 gap-2 hover:bg-gray-100 cursor-pointer">
      <LogOut className='w-4 h-4' />
      <span>{title}</span>
    </div>
  )
}

export default LogoutButton
