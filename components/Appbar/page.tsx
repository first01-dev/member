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
  AddToHomeScreenRounded,
  InstallMobileRounded,
} from '@mui/icons-material'
import { Typography } from '@mui/material'
import { Box } from '@mui/system'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { useInstallApp } from '@/hooks/useInstallApp';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import IosShareRoundedIcon from '@mui/icons-material/IosShareRounded';
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';


const NAV_COLOR = '#5B5FEF'

  // 1. วาง Logic ดักจับการติดตั้งไว้ตรงนี้เลยฃ



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
  {
    label: 'My List',
    icon: LocalMallRounded,
    path: '/pre_station/',
  },
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

  const {
    isInstallable,
    isIOS,
    showInstallModal,
    setShowInstallModal,
    triggerInstall,
    confirmAndroidInstall,
  } = useInstallApp();


  type NavItemType = {
    label: string;
    icon: any;
    path: string;
    onClick?: () => void; // เครื่องหมาย ? แปลว่ามีหรือไม่มี onClick ก็ได้
  };

  const allNavItems: NavItemType[] = [
    ...navItems,
    ...(isInstallable
      ? [
          {
            label: 'Install App',
            icon: AddToHomeScreenRounded,
            path: '',
            onClick: triggerInstall,
          },
        ]
      : []),
  ];
  
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
  if (path === '/home/' || path === '') {
    router.push(path)
    return
  }

  const token = getLocalStorage(key.TOKEN)

  // เมนูอื่นต้อง Login
  if (!token) {
    // ปิดบังคับ login
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
  {allNavItems.map(({ label, icon: Icon, path, onClick }) => {

    // เช็กว่าต้องมี path ถึงจะเทียบ active (ปุ่ม Install App จะได้ไม่ขึ้นสี Active มั่ว)
    const active = Boolean(path) && path === activePath;

    return (
      <>
        <Box

          // 2. ใช้ label เป็น key แทน path (เผื่อในอนาคตมีหลายปุ่มที่ path เป็นค่าว่าง '' จะได้ไม่ชนกัน)
          key={label}
          // 3. เช็กก่อนว่ามี onClick ไหม ถ้ามีให้สั่งติดตั้ง ถ้าไม่มีค่อยเปลี่ยนหน้า
          onClick={() => {
            if (onClick) {
              onClick(); // กด Install App -> อยู่หน้าเดิม + เด้งหน้าต่าง Install ทันที!
            } else {
              handleNavigation(path); // กดเมนูอื่น -> เปลี่ยนหน้าตามปกติ
            }
          }}
          
          // key={path}
          // onClick={() => handleNavigation(path)}
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

        <Dialog
          open={showInstallModal}
          onClose={() => setShowInstallModal(false)}
          maxWidth="xs"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 3, p: 0.5 }, // ปรับมุมโค้งให้ดูทันสมัย
          }}
        >
          <DialogTitle sx={{ fontWeight: 700, fontSize: 18, pb: 1 }}>
            ปักหมุด YAAKZ!! Member ไว้ที่หน้าจอ
          </DialogTitle>

          <DialogContent>
            {isIOS ? (
              // --- ข้อความสำหรับ iPhone / iPad ---
              <>
                <Typography sx={{ mb: 2, fontSize: 14, color: 'text.secondary' }}>
                  เพิ่มทางลัดลงหน้าจอมือถือ เพื่อเข้าใช้งานครั้งต่อไปได้ในคลิกเดียว ทำตาม 2 ขั้นตอนนี้เลย:
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                  <IosShareRoundedIcon color="primary" />
                  <Typography sx={{ fontSize: 14 }}>
                    1. กดปุ่ม <b>แชร์ (Share)</b> ที่แถบด้านล่างของ Safari
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <AddBoxOutlinedIcon color="primary" />
                  <Typography sx={{ fontSize: 14 }}>
                    2. เลื่อนลงมาแล้วกด <b>เพิ่มไปยังหน้าจอโฮม (Add to Home Screen)</b>
                  </Typography>
                </Box>
              </>
            ) : (
              // --- ข้อความสำหรับ Android / คอมพิวเตอร์ ---
              <Typography sx={{ fontSize: 14, color: 'text.secondary', lineHeight: 1.6 }}>
                กดเพิ่มทางลัดลงหน้าจอมือถือหรือคอมพิวเตอร์ เพื่อเข้าใช้งาน <b>YAAKZ!! Member</b> ครั้งต่อไปได้ในคลิกเดียว ไม่ต้องพิมพ์ลิงก์ใหม่ให้เสียเวลา
              </Typography>
            )}
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2 }}>
            {isIOS ? (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowInstallModal(false);
                }}
                variant="contained"
                fullWidth
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
              >
                เข้าใจแล้ว
              </Button>
            ) : (
              <>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowInstallModal(false);
                  }}
                  color="inherit"
                  sx={{ textTransform: 'none' }}
                >
                  ไว้ทีหลัง
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    confirmAndroidInstall();
                  }}
                  variant="contained"
                  startIcon={<AddToHomeScreenRounded />}
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                >
                  เพิ่มทางลัด
                </Button>
              </>
            )}
          </DialogActions>
        </Dialog>

      </>
    )
  })}
</Box>
    </Box>
  )
  
}
