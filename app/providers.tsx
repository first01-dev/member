'use client'

import { Suspense } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { Toaster } from 'react-hot-toast'
import AppBarPage from '@/components/Appbar/page'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './globals.css'
import AuthGuard from '@/components/AuthGuard'

import { clearLocalStorage, getLocalStorage } from '@/services/StorageUtils'
import { key } from '@/models/constant'
import React from 'react'

const theme = createTheme({
  typography: {
    fontFamily: `"Sarabun", sans-serif`,
    fontSize: 14,
  },
  palette: {
    primary: {
      main: '#1677ff',
      dark: '#115293',
      light: '#4096ff',
    },
    secondary: {
      main: '#fff',
      dark: '#f1f1f1ff',
      light: '#fdfdfd',
      contrastText: '#1677ff',
    },
  },
})

const publicPaths = [
  '/login/',
  '/',
  '/home/', // 👈 เพิ่ม
  '/activate/',
  '/resetpassword/',
  '/cart/',
  '/shelf/',
  '/pre_station_list/',
]

const hideAppBarPaths = [
  '/login/',
  '/',
  '/activate/',
  '/resetpassword/',
  '/cart/',
  '/shelf/',
  '/pre_station_list/',
]

export default function Providers({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()

  const isPublicPath = publicPaths.includes(pathname)
  const hideAppBar = hideAppBarPaths.includes(pathname)

  React.useEffect(() => {
  if (isPublicPath) return

  const checkToken = () => {
    const token = getLocalStorage(key.TOKEN)

    if (!token) {
      clearLocalStorage(key.CUSTOMER)
      // ปิดบังคับ login
      // router.replace('/login/')
    }
  }

  checkToken()

  const interval = setInterval(checkToken, 1000)

  return () => clearInterval(interval)
}, [isPublicPath, router])

  return (
    <GoogleOAuthProvider
      clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}
    >
      <Toaster
        position="top-center"
        containerStyle={{
          zIndex: 999999,
        }}
        toastOptions={{
          style: {
            zIndex: 999999,
          },
        }}
      />

      <div className="app-container">
        <div
          className="app-content"
          style={{
            paddingBottom: hideAppBar ? 0 : 80,
          }}
        >
          <ThemeProvider theme={theme}>
            {publicPaths.includes(pathname) ? (
              children
            ) : (
              <AuthGuard>
                {children}
              </AuthGuard>
            )}
          </ThemeProvider>
        </div>

        {!hideAppBar && (
          <div className="app-bottom">
            <Suspense fallback={null}>
              <AppBarPage />
            </Suspense>
          </div>
        )}
      </div>
    </GoogleOAuthProvider>
  )
}