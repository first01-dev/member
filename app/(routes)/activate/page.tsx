'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Typography,
  Box,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material'
import Image from 'next/image'
import ApiService from '@/services/ApiService'

export default function ActivatePage() {
  const [status, setStatus] =
    useState('loading')

  const [message, setMessage] =
    useState('')

  const router = useRouter()

  useEffect(() => {
    const verifyEmail =
      async () => {
        try {
          // ⭐ client only
          const params =
            new URLSearchParams(
              window.location.search,
            )

          const token =
            params.get('token') ||
            params.get('code')

          if (!token) {
            setStatus('error')
            setMessage(
              'ไม่พบโค้ดยืนยัน กรุณาตรวจสอบลิงก์อีกครั้ง',
            )
            return
          }

          const response =
            await ApiService.getActivate(
              Number(token),
            )

          setStatus(
            response.data.status,
          )

          setMessage(
            response.data.message,
          )

          if (
            response.data.status ===
            'success'
          ) {
            setTimeout(() => {
              router.push('/login/')
            }, 2000)
          }
        } catch (error: any) {
          setStatus('error')

          setMessage(
            error?.response?.data
              ?.message ||
              'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง',
          )
        }
      }

    verifyEmail()
  }, [router])

  return (
    <Box
      className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50"
    >
      <Box
        sx={{
          width: '80%',
          mx: 'auto',
          border:
            '1px solid #2196f3',
          p: 2,
          borderRadius: 5,
          boxShadow: 1,
          mt: 5,
            display: 'flex',
            flexDirection: 'column',
        }}
      >
       <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
         <Image
          src="/YAAKZ_Station-01.png"
          alt=""
          width={180}
          height={100}
          style={{
            marginLeft: 60,
          }}
        />
       </div>

        <Box
          sx={{
            display: 'flex',
            justifyContent:
              'center',
            alignItems:
              'center',
            mb: 2,
          }}
        >
          <Image
            src="/email-verify-3d-icon-download-in-png-blend-fbx-gltf-file-formats--mail-approved-approve-approval-pack-sign-symbols-icons-5073621.webp"
            alt=""
            width={40}
            height={40}
          />

          <Typography>
            ยืนยันอีเมล ระบบ
            Pre-Station
          </Typography>
        </Box>

        {status ===
          'loading' && (
          <Box
          sx={{
            display: 'flex',
            justifyContent:
              'center',
            mt: 2,
          }}
            className="flex flex-col items-center"
          >
            <CircularProgress />
            <Typography>
              กำลังยืนยันอีเมล...
            </Typography>
          </Box>
        )}

        {status ===
          'success' && (
          <Alert severity="success">
            <Typography>
              ✅ {message}
            </Typography>

            <Typography variant="body2">
              กำลังเปลี่ยนหน้า...
            </Typography>
          </Alert>
        )}

        {status ===
          'error' && (
          <Alert severity="error">
            <Typography>
              ❌ {message}
            </Typography>
          </Alert>
        )}

        <Box
          sx={{
            display: 'flex',
            justifyContent:
              'center',
            mt: 2,
          }}
        >
          <Button
            onClick={() =>
              router.push(
                '/login/',
              )
            }
          >
            <Typography textAlign="center">
              กลับสู่หน้าหลัก
            </Typography>
          </Button>
        </Box>
      </Box>
    </Box>
  )
}