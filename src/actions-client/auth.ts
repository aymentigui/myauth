"use client"

import { logoutUser, verifySession } from "@/actions/auth/auth";

export const verifySessionFetch = async () => {
    try {
      const verifySessionss = await verifySession();

      if (!verifySessionss || verifySessionss.status !== 200) {
        const LogoutUser = await logoutUser();
        if (LogoutUser.status === 200) {
          window.location.href = '/auth/login';
        }
      }
    } catch (error) {
      console.error("An error occurred in verifySession:");
    }
  }