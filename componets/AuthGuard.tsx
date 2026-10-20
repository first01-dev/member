'use client'

import React, {
  useEffect,
} from 'react'
import {
  usePathname,
  useRouter,
} from 'next/navigation'
import toast from 'react-hot-toast'

import ApiService from '@/services/ApiService'
import {
  clearAllLocalStorage,
  getLocalStorage,
} from '@/services/StorageUtils'
import { key } from '@/models/constant'

type Props = {
  children: React.ReactNode
}

export default function AuthGuard({
  children,
}: Props) {
  const router =
    useRouter()

  const pathname =
    usePathname()

  useEffect(() => {


    // หน้า public
    const publicRoutes =
      [
        '/login',
        '/resetpassword',
      ]

    const isPublicPage =
      publicRoutes.includes(
        pathname
      ) ||
      pathname.startsWith(
        '/activate'
      )

    if (isPublicPage) {
      console.log(
        'skip auth guard'
      )
      return
    }

    const checkCustomer =
      async () => {
        const token =
          getLocalStorage(
            key.TOKEN
          )

        const customer =
          getLocalStorage(
            key.CUSTOMER
          )

        if (!token) {
          router.replace(
            '/login'
          )
          return
        }

        if (
          !customer?._id
        ) {
          clearAllLocalStorage()

          router.replace(
            '/login'
          )
          return
        }

        try {
          const response =
            await ApiService.getCustomer(
              customer._id
            )

          const freshData =
            response?.data
              ?.data

          if (
            !freshData
          ) {
            toast.error(
              'ไม่พบข้อมูลลูกค้า'
            )

            clearAllLocalStorage()

            router.replace(
              '/login'
            )
          }
        } catch (
          error
        ) {
          console.error(
            'check customer error',
            error
          )

          clearAllLocalStorage()

          router.replace(
            '/login'
          )
        }
      }


    const interval =
      setInterval(() => {
        checkCustomer()
      }, 5 * 60 * 1000)

    return () =>
      clearInterval(
        interval
      )
  }, [
    pathname,
    router,
  ])

  return <>{children}</>
}