'use client'

import { key } from '@/models/constant'
import { getLocalStorage } from '@/services/StorageUtils'
import {
  HomeRounded,
  MenuBookRounded,
  LocalMallRounded,
  LocalActivityRounded,
  AccountCircleRounded,
  AssignmentTurnedInRounded,
} from '@mui/icons-material'
import { Typography } from '@mui/material'
import { Box } from '@mui/system'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

const NAV_COLOR = '#5B5FEF'

const navItems = [
  {
    label: 'Home',
    icon: HomeRounded,
    path: '/home/',
  },
  {
    label: 'Book Shelf',
    icon: MenuBookRounded,
    path: '/book_shelf/',
  },
  // {
  //   label: 'My List',
  //   icon: LocalMallRounded,
  //   path: '/pre_station/',
  // },
  {
    label: 'Order',
    icon: AssignmentTurnedInRounded,
    path: '/order_list/',
  },
  {
    label: 'Coupons',
    icon: LocalActivityRounded,
    path: '/coupons/',
  },
  {
    label: 'Profile',
    icon: AccountCircleRounded,
    path: '/profile/',
  },
]

function getNotchPath(idx: number, totalW: number) {
  const slotW = totalW / navItems.length

  const cx = Math.max(56, Math.min(totalW - 56, slotW * idx + slotW / 2))

  return `
    M 24 0
    L ${cx - 34} 0
    Q ${cx - 24} 0 ${cx - 18} 8
    C ${cx - 12} 16 ${cx - 10} 20 ${cx} 20
    C ${cx + 10} 20 ${cx + 12} 16 ${cx + 18} 8
    Q ${cx + 24} 0 ${cx + 34} 0
    L ${totalW - 24} 0
    Q ${totalW} 0 ${totalW} 24
    L ${totalW} 56
    Q ${totalW} 80 ${totalW - 24} 80
    L 24 80
    Q 0 80 0 56
    L 0 24
    Q 0 0 24 0
    Z
  `
}

export default function BottomNav() {
  const pathname = usePathname()

  const searchParams = useSearchParams()

  const router = useRouter()

  const wrapRef = useRef<HTMLDivElement>(null)

  const [navW, setNavW] = useState(400)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return

    setNavW(el.getBoundingClientRect().width)

    const ro = new ResizeObserver(([entry]) => {
      setNavW(entry.contentRect.width)
    })

    ro.observe(el)

    return () => ro.disconnect()
  }, [])

  const handleNavigation = (path: string) => {
  // Home ดูได้โดยไม่ต้อง Login
  if (path === '/home/') {
    router.push(path)
    return
  }

  const token = getLocalStorage(key.TOKEN)

  // เมนูอื่นต้อง Login
  if (!token) {
    router.push('/login/')
    return
  }

  router.push(path)
}

  // ACTIVE MENU
  const getActivePath = () => {
    const shelfName = searchParams.get('shelf_name')?.trim()

   

    // ================= SHELF =================
    if (pathname.startsWith('/shelf')) {
      // หนังสือใหม่
      if (shelfName === 'หนังสือใหม่') {
        const from = searchParams.get('from')

        // มาจาก PreStation
        if (from === '/pre_station/') {
          return '/pre_station/'
        }

        // มาจาก Home
        if (from === '/home/') {
          return '/home/'
        }

        // ถ้าไม่มี from ให้ default เป็น Home
        return '/home/'
      }

      // Shelf อื่น ๆ
      return '/book_shelf/'
    }
    // path ปกติ
    return navItems.find((item) => pathname.startsWith(item.path))?.path
  }

  const activePath = getActivePath()

  const idx = Math.max(
    0,
    navItems.findIndex((item) => item.path === activePath),
  )

  const slotW = navW / navItems.length

  const dotX = Math.max(56, Math.min(navW - 56, slotW * idx + slotW / 2)) - 6

  return (
    <Box
      ref={wrapRef}
      sx={{
        position: 'fixed',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(500px, calc(100vw - 32px))',
        height: 80,
        zIndex: 9999,
      }}
    >
      {/* SVG NAVBAR */}
      <svg
        width={navW}
        height="80"
        viewBox={`0 0 ${navW} 80`}
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'visible',
          filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.12))',
        }}
      >
        <path
          d={getNotchPath(idx, navW)}
          fill="white"
          style={{
            transition: 'd .35s cubic-bezier(.4,0,.2,1)',
          }}
        />
      </svg>

      {/* DOT */}
      <Box
        sx={{
          position: 'absolute',
          top: 2,
          left: dotX,
          width: 12,
          height: 12,
          borderRadius: '50%',
          bgcolor: NAV_COLOR,
          transition: 'left .35s cubic-bezier(.4,0,.2,1)',
          zIndex: 3,
        }}
      />

      {/* MENU */}
<Box
  sx={{
    position: 'relative',
    zIndex: 2,
    display: 'flex',
    padding: '0 8px',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: '100%',
  }}
>
  {navItems.map(({ label, icon: Icon, path }) => {
    const active = path === activePath

    return (
      <Box
        key={path}
        onClick={() => handleNavigation(path)}
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all .35s cubic-bezier(.4,0,.2,1)',
          transform: active
            ? 'translateY(10px)'
            : 'translateY(0)',
        }}
      >
        <Icon
          sx={{
            fontSize: 26,
            color: active
              ? NAV_COLOR
              : '#B9B9B9',
            transition: 'all .3s ease',
          }}
        />

        <Typography
          sx={{
            mt: '2px',
            fontSize: 10,
            lineHeight: 1,
            fontWeight: active ? 700 : 500,
            color: active
              ? NAV_COLOR
              : '#B9B9B9',
            transition: 'all .3s ease',
          }}
        >
          {label}
        </Typography>
      </Box>
    )
  })}
</Box>
    </Box>
  )
}
