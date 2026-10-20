
import { useRouter } from 'next/navigation'
import React from 'react'
import { usePathname } from 'next/navigation'

export const Navigation = () => {
  const route = useRouter()
  const pathname = usePathname()

  return {
    login: () => route.push(`/login`),
    AppBarPage: () => route.push(`/appbar`),
    Station: () => route.push(`/station`),
    Home: () => route.push(`/home`),
    isCurrentPage: (path:any) => pathname === path,
  }
}
