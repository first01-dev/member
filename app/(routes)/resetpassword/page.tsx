'use client'

import * as React from 'react'
import {
  Password,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  IconButton,
  InputBase,
  Typography,
} from '@mui/material'
import Image from 'next/image'
import toast from 'react-hot-toast'
import {
  useRouter,
} from 'next/navigation'

import ApiService from '@/services/ApiService'
import { Navigation } from '@/services/Navigation'

export default function ResetPasswordPage() {
  const router =
    useRouter()

  const navigate =
    Navigation()

  const [
    showPassword,
    setShowPassword,
  ] = React.useState(
    false
  )

  const [
    showPasswordConfirme,
    setShowPasswordConfirme,
  ] = React.useState(
    false
  )

  const [
    confirmPassword,
    setConfirmPassword,
  ] = React.useState(
    ''
  )

  const [
    isLoading,
    setIsLoading,
  ] = React.useState(
    false
  )

  const [
    status,
    setStatus,
  ] = React.useState('')

  const [
    message,
    setMessage,
  ] = React.useState('')

  const [
    resetPassword,
    setResetPassword,
  ] = React.useState({
    token: '',
    password: '',
  })

  // ดึง token จาก URL
  React.useEffect(() => {
    const params =
      new URLSearchParams(
        window.location
          .search
      )

    const token =
      params.get(
        'token'
      )

    if (token) {
      setResetPassword(
        (prev) => ({
          ...prev,
          token,
        })
      )
    } else {
      toast.error(
        'ไม่พบโค้ดยืนยัน กรุณาตรวจสอบลิงก์อีกครั้ง'
      )
    }
  }, [])

  const togglePasswordVisibility =
    () => {
      setShowPassword(
        (prev) =>
          !prev
      )
    }

  const togglePasswordVisibilityConfirm =
    () => {
      setShowPasswordConfirme(
        (prev) =>
          !prev
      )
    }

  const handleDataReset =
    (
      event: React.ChangeEvent<HTMLInputElement>
    ) => {
      setResetPassword(
        (
          prev
        ) => ({
          ...prev,
          [
            event
              .target
              .name
          ]:
            event
              .target
              .value,
        })
      )
    }

  const handleSubmit =
    async () => {
      const {
        token,
        password,
      } =
        resetPassword

      if (
        !password
      ) {
        toast.error(
          'กรุณากรอกรหัสผ่าน'
        )
        return
      }

      if (
        password !==
        confirmPassword
      ) {
        toast.error(
          'รหัสผ่านไม่ตรงกัน'
        )
        return
      }

      try {
        setIsLoading(
          true
        )

        const response =
          await ApiService.updateNewPassword(
            token,
            password
          )

        if (
          response.data
            .status ===
          'success'
        ) {
          setStatus(
            response
              .data
              .status
          )

          setMessage(
            response
              .data
              .message
          )

          toast.success(
            'เปลี่ยนรหัสผ่านสำเร็จ'
          )

          setTimeout(
            () => {
              router.push(
                '/login'
              )
            },
            2000
          )
        }
      } catch (
        error
      ) {
        console.error(
          error
        )

        toast.error(
          'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง'
        )
      } finally {
        setIsLoading(
          false
        )
      }
    }
console.log(Password)
  return (
    <Box>
      <Box
        sx={{
          width:
            '80%',
          display:
            'grid',
          gap: 1,
          margin:
            'auto',
          border:
            '1px solid #2196f3',
          padding: 2,
          borderRadius: 5,
          marginTop: 2,
        }}
      >
        <Box
          display="flex"
          justifyContent="center"
        >
          <Image
            src="/YAAKZ_Station-01.png"
            alt="logo"
            width={
              180
            }
            height={
              100
            }
          />
        </Box>

        {status ===
        'success' ? (
          <Alert severity="success">
            <Typography>
              ✅{' '}
              {
                message
              }
            </Typography>

            <Typography variant="body2">
              กำลังเปลี่ยนหน้า...
            </Typography>
          </Alert>
        ) : (
          <>
            <Typography textAlign="center">
              เปลี่ยนรหัสผ่าน
            </Typography>

            <Box
              sx={{
                m: 2,
              }}
            >
              <Typography>
                พิมพ์รหัสผ่านใหม่
              </Typography>

              <Box
                className="input"
                sx={{
                  display:
                    'flex',
                  alignItems:
                    'center',
                }}
              >
                <InputBase
                  placeholder="พิมพ์รหัสผ่าน"
                  className="input-base"
                  name="password"
                  onChange={
                    handleDataReset
                  }
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  sx={{
                    flex: 1,
                  }}
                />

                <IconButton
                  onClick={
                    togglePasswordVisibility
                  }
                >
                  {showPassword ? (
                    <VisibilityOff />
                  ) : (
                    <Visibility />
                  )}
                </IconButton>
              </Box>

              <Typography>
                ยืนยันรหัสผ่านใหม่
              </Typography>

              <Box
                className="input"
                sx={{
                  display:
                    'flex',
                  alignItems:
                    'center',
                }}
              >
                <InputBase
                  placeholder="พิมพ์รหัสผ่านอีกครั้ง"
                  onChange={(
                    e
                  ) =>
                    setConfirmPassword(
                      e
                        .target
                        .value
                    )
                  }
                  type={
                    showPasswordConfirme
                      ? 'text'
                      : 'password'
                  }
                  sx={{
                    flex: 1,
                    p: 1,
                  }}
                />

                <IconButton
                  onClick={
                    togglePasswordVisibilityConfirm
                  }
                >
                  {showPasswordConfirme ? (
                    <VisibilityOff />
                  ) : (
                    <Visibility />
                  )}
                </IconButton>
              </Box>

              <Button
                variant="contained"
                size="medium"
                onClick={
                  handleSubmit
                }
                disabled={
                  isLoading
                }
                sx={{
                  width:
                    '100%',
                  borderRadius: 5,
                  mt: 2,
                }}
              >
                {isLoading
                  ? 'กำลังบันทึก...'
                  : 'บันทึก'}
              </Button>
            </Box>
          </>
        )}

        <Box
          display="flex"
          justifyContent="center"
        >
          <Button
            onClick={() =>
              navigate.login()
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