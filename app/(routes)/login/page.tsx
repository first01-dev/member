'use client'
import * as React from 'react'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Box from '@mui/material/Box'
import { EXPIRE_TIME, EXPIRE_TIME_UNIT, key, version } from '@/models/constant'
import { jwtDecode } from 'jwt-decode'
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  InputBase,
  Typography,
} from '@mui/material'
import Image from 'next/image'
import Prototype from '@/components/Prototype/page'
import {
  Close,
  MailRounded,
  Visibility,
  VisibilityOff,
  VpnKeyRounded,
} from '@mui/icons-material'
import { Navigation } from '@/services/Navigation'
import FormEditUserProps from '@/components/dialogs/FormEditUser/page'
import toast from 'react-hot-toast'
import {
  clearLocalStorage,
  getLocalStorage,
  getUnixTime,
  setLocalStorage,
} from '@/services/StorageUtils'
import ApiService from '@/services/ApiService'
import {
  GoogleOAuthProvider,
  GoogleLogin,
  useGoogleLogin,
} from '@react-oauth/google'
import dayjs, { ManipulateType } from 'dayjs'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}



export default function Index() {
  const [open, setOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [isLoadingVerify, setIsLoadingVerify] = React.useState(false)
  const [checked, setChecked] = React.useState(false)
  const [loginChecked, setLoginChecked] = React.useState(false)
  const [openSuccessVerify, setOpenSuccessVerify] = React.useState(false)

  const [openForgotPassword, setOpenForgotPassword] = React.useState(false)
  const [openResetPassword, setOpenResetPassword] = React.useState(false)
  const [openPolicy, setOpenPolicy] = React.useState(false)
  const [openPrivacy, setOpenPrivacy] = React.useState(false)
  const [value, setValue] = React.useState(0)
  const [showPassword, setShowPassword] = React.useState(false)
  const [showPasswordConfirme, setShowPasswordConfirme] = React.useState(false)
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [status, setStatus] = React.useState('Login')

  const length = 6
  const [otp, setOtp] = React.useState(Array(length).fill(''))
  const [activeCode, setActiveCode] = React.useState('')
  const inputsRef = React.useRef<(HTMLInputElement | null)[]>([])
  const [login, setLogin] = React.useState({
    email: '',
    password: '',
  })

  const [regis, setRegis] = React.useState({
    type: '',
    email: '',
    password: '',
  })

  const [resetPassword, setResetPassword] = React.useState({
    email: '',
  })
  const navigate = Navigation()

  const handleOpenPolicy = () => setOpenPolicy(true)
  const handleClosePolicy = () => setOpenPolicy(false)

  const handleOpenPrivacy = () => setOpenPrivacy(true)
  const handleClosePrivacy = () => setOpenPrivacy(false)

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      if (!credentialResponse?.credential) {
        toast.error('ไม่พบข้อมูลจาก Google')
        return
      }

      const decoded: any = jwtDecode(credentialResponse.credential)
      const email = decoded.email
      const name = decoded.name
      const googleId = decoded.sub

      let loginResponse = await ApiService.login(email, googleId)

      // ‼️ Login ไม่เจอ → Register
      if (loginResponse.data.status === 'error') {
        const message = loginResponse.data.message

        if (message === 'ไม่พบข้อมูลลูกค้าในระบบ') {
          await ApiService.register('sso', email, googleId, name) // ⭐ Register ก่อน
          loginResponse = await ApiService.login(email, googleId) // แล้ว Login ใหม่
        } else if (message !== 'รหัสผ่านไม่ถูกต้อง') {
          toast.error(message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ')
          return
        } else {
          // ถ้า password ไม่ตรง → ลอง login ด้วย googleId อีกครั้ง
          loginResponse = await ApiService.login(email, googleId)
        }
      }

      // ⭐ ถึงจุดนี้คือ Login สำเร็จแล้วแน่นอน
      if (loginResponse.data.accessToken) {
        const decodedToken: any = jwtDecode(loginResponse.data.accessToken)
        const expiryTime = decodedToken.exp

        setLocalStorage(key.TOKEN, loginResponse.data.accessToken, expiryTime)

        // Save Customer Data + Google Info
        setLocalStorage(
          key.CUSTOMER,
          {
            ...loginResponse.data.customer,
            name,
            google: decoded,
          },
          expiryTime,
        )

        toast.success('เข้าสู่ระบบด้วย Google สำเร็จ')
        navigate.Home()

        window.dispatchEvent(new CustomEvent('loginSuccess'))
        setTimeout(
          () => window.dispatchEvent(new CustomEvent('navigateToHome')),
          500,
        )
      } else {
        toast.error('ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่อีกครั้ง')
      }
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย Google')
    }
  }

  const handleData = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLogin({ ...login, [event.target.name]: event.target.value })
  }

  const handleDataRegis = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRegis({ ...regis, [event.target.name]: event.target.value })
  }

  const handleDataReset = (event: React.ChangeEvent<HTMLInputElement>) => {
    setResetPassword({
      ...resetPassword,
      [event.target.name]: event.target.value,
    })
  }
  const togglePasswordVisibility = () => {
    setShowPassword((prev: any) => !prev)
  }

  const togglePasswordVisibilityConfirm = () => {
    setShowPasswordConfirme((prev: any) => !prev)
  }

  const handleChangeCheck = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked)
  }

  const handleChangeLoginCheck = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setLoginChecked(event.target.checked)
  }
  const handleClose = () => {
    setOpen(false)
    setOtp(Array(length).fill(''))
  }

  const handleChangeOtp = (element: HTMLInputElement, index: number) => {
    const value = element.value

    // รับแค่ตัวอักษร/ตัวเลข และไม่เกิน 1 ตัว
    if (!/^[a-zA-Z0-9]?$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < otp.length - 1) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === 'Backspace') {
      const newOtp = [...otp]
      if (otp[index]) {
        newOtp[index] = ''
        setOtp(newOtp)
      } else if (index > 0) {
        inputsRef.current[index - 1]?.focus()
      }
    }
  }

  const showError = (message: string) => {
    console.log('showError ถูกเรียก:', message)
    toast.error(message)
    setIsLoading(false)
  }

  function isValidEmail(email: string) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

const handleLogin = async (
  email: string,
  password: string,
  isRegister = false,
) => {
  const { data } = await ApiService.login(email, password)

  if (data.accessToken) {
    const expiryTime = getUnixTime(
      EXPIRE_TIME,
      EXPIRE_TIME_UNIT as dayjs.ManipulateType,
    )

    setLocalStorage(key.TOKEN, data.accessToken, expiryTime)
    setLocalStorage(key.CUSTOMER, data.customer, expiryTime)

    if (isRegister) {
      setLocalStorage(key.IS_NEW_REGISTER, true, expiryTime)
    } else {
      clearLocalStorage(key.IS_NEW_REGISTER)
    }

    toast.success('เข้าสู่ระบบสำเร็จ')
    navigate.Home()

    window.dispatchEvent(new CustomEvent('loginSuccess'))

    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('navigateToHome'))
    }, 500)

    return true
  }

  toast.error(data.message)
  return false
}

  const onLogin = async () => {
    setIsLoading(true)
    const { email, password } = login

    try {
      if (!email?.trim()) return showError('กรุณาพิมพ์อีเมล')
      if (!isValidEmail(email.trim())) return showError('รูปแบบอีเมลไม่ถูกต้อง')
      if (!password?.trim()) return showError('กรุณาพิมพ์รหัสผ่าน')

      const { data } = await ApiService.login(email, password)

      if (data.accessToken) {
        const expiryTime = getUnixTime(
          EXPIRE_TIME,
          EXPIRE_TIME_UNIT as dayjs.ManipulateType,
        )

        setLocalStorage(key.TOKEN, data.accessToken, expiryTime)
        setLocalStorage(key.CUSTOMER, data.customer, expiryTime)

        // Store user data
        setLocalStorage(key.TOKEN, data.accessToken, expiryTime)
        setLocalStorage(key.CUSTOMER, data.customer, expiryTime)

        toast.success('เข้าสู่ระบบสำเร็จ')
        navigate.Home()

        window.dispatchEvent(new CustomEvent('loginSuccess'))

        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('navigateToHome'))
        }, 500)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการเข้าสู่ระบบ')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoginSuccess = (data: any) => {
    const expiryTime = getUnixTime(
      EXPIRE_TIME,
      EXPIRE_TIME_UNIT as dayjs.ManipulateType,
    )

    setLocalStorage(key.TOKEN, data.accessToken, expiryTime)
    setLocalStorage(key.CUSTOMER, data.customer, expiryTime)

    toast.success('เข้าสู่ระบบสำเร็จ')
    navigate.Home()

    window.dispatchEvent(new CustomEvent('loginSuccess'))

    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('navigateToHome'))
    }, 500)
  }

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await fetch(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          },
        )

        const user = await res.json()

        const email = user.email
        const name = user.name
        const googleId = user.sub
        const picture = user.picture

        // // 👉 login backend
        // let { data } = await ApiService.login(email, googleId)

        // // 👉 สมัครอัตโนมัติถ้ายังไม่มี user
        // if (data.status === 'error') {
        //   if (data.message === 'ไม่พบข้อมูลลูกค้าในระบบ') {
        //     await ApiService.register('sso', email, googleId, name)

        //     const resLogin = await ApiService.login(email, googleId)

        //     data = resLogin.data
        //   } else {
        //     toast.error(data.message)
        //     return
        //   }
        // }

        // // 👉 login success
        // if (data.accessToken) {
        //   handleLoginSuccess({
        //     ...data,
        //     customer: {
        //       ...data.customer,
        //       picture,
        //     },
        //   })
        // }
      } catch (err) {
        toast.error('ดึงข้อมูล Google ไม่สำเร็จ')
      }
    },
  })

  const onRegis = async () => {
    setIsLoading(true)
    const { email, password } = regis

    if (!email) return showError('กรุณาพิมพ์อีเมล')
    if (!isValidEmail(email)) return showError('รูปแบบอีเมลไม่ถูกต้อง')
    if (!password) return showError('กรุณาพิมพ์รหัสผ่าน')
    if (!confirmPassword) return showError('กรุณาพิมพ์รหัสผ่านอีกครั้ง')
    if (password !== confirmPassword) return showError('รหัสผ่านไม่ตรงกัน')

    const { data } = await ApiService.register('normal', email, password)

    setActiveCode(data.active_code)
    setOpen(true)
    if (data.status === 'error') {
      toast.error(data.message)
      setIsLoading(false)
      setOpen(false)
    } else if (data.status === 'pending') {
      toast.success(data.message)
    }

    if (!open) {
      setIsLoading(false)
    }
  }

  const onVerifyEmail = () => {
    setIsLoadingVerify(true)

    const otpCode = otp.join('')
    let intervalId: NodeJS.Timeout

    intervalId = setInterval(async () => {
      const response = await ApiService.getActivate(Number(otpCode))

      if (response.data.status === 'success') {
        clearInterval(intervalId)

        toast.success(response.data.message)

        // เก็บ email/password ไว้ก่อน reset
        const email = regis.email
        const password = regis.password

        setOtp(Array(length).fill(''))
        setOpenSuccessVerify(true)
        setOpen(false)
        setRegis({
          type: '',
          email: '',
          password: '',
        })
        setConfirmPassword('')
        setActiveCode('')
        setIsLoadingVerify(false)

        // ✅ login อัตโนมัติ
        await handleLogin(email, password, true)
      } else {
        toast.error(response.data.message)
        clearInterval(intervalId)
        setIsLoadingVerify(false)
      }
    }, 1000)
  }

  const onForgotPassword = () => {
    const { email } = resetPassword
    try {
      if (!resetPassword.email) return showError('กรุณาพิมพ์อีเมล')
      const response = ApiService.creatForgotPassword(email)

      toast.success('ส่งลิ้งค์รีเซ็ตรหัสผ่านไปที่ Email แล้ว')
      setOpenForgotPassword(false)
      setResetPassword({ email: '' })
    } catch (error) {
      toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()

    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '') // เอาเฉพาะตัวเลข

    if (!pastedData) return

    const newOtp = [...otp]

    pastedData.split('').forEach((char, index) => {
      if (index < newOtp.length) {
        newOtp[index] = char
      }
    })

    setOtp(newOtp)

    // โฟกัสไปช่องสุดท้ายที่ถูกกรอก
    const lastIndex = Math.min(pastedData.length - 1, otp.length - 1)

    inputsRef.current[lastIndex]?.focus()
  }

  React.useEffect(() => {
    const token = getLocalStorage(key.TOKEN)

    if (token) {
      toast.success('มีการเข้าสู่ระบบแล้ว')
      navigate.Home()
    }
  }, [])

  return (
    <Box>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Image
          src="/images/LOGO_YAAKZ_MEMBER-02.png"
          alt=""
          width={290}
          height={160}
        />
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography
          style={{ fontWeight: 'bold', color: '#175dbfff' }}
          fontSize={18}
        >
          Membership Platforms
        </Typography>
      </div>
      <Box
        sx={{
          width: '80%',
          marginLeft: 'auto',
          marginRight: 'auto',
          backgroundColor: '#fff',

          padding: 2,
          borderRadius: 5,

          marginTop: 5,
        }}
      >
        {status === 'Login' ? (
          <div style={{ display: 'grid', gap: 10 }}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                marginBottom: 10,
                gap: 10,
              }}
            >
              <Typography fontSize={14}>เข้าสู่ระบบด้วย</Typography>

              <Button
                onClick={() => {
                  if (!loginChecked) {
                    toast.error('กรุณายอมรับเงื่อนไขก่อน')
                    return
                  }
                  googleLogin()
                }}
                sx={{
                  width: '100%',
                  padding: ' 10px',
                  borderRadius: '20px',
                  gap: 1,
                  textTransform: 'none',
                  fontWeight: 500,
                  border: '1px solid',
                  backgroundColor: '#fff',
                  color: '#1677ff',
                  borderColor: '#1677ff',
                  '&:hover': {
                    backgroundColor: '#f5faff',
                  },
                  '&.Mui-disabled': {
                    backgroundColor: '#f0f0f0',
                    color: '#666',
                    borderColor: '#e0e0e0',
                  },
                }}
              >
                <Image
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="google"
                  width={18}
                  height={18}
                />
                เข้าใช้งานด้วย Google
              </Button>
            </div>
            <FormControlLabel
              control={
                <Checkbox
                  checked={loginChecked}
                  onChange={handleChangeLoginCheck}
                />
              }
              label={
                <Typography fontSize={13}>
                  ฉันยอมรับ{' '}
                  <span
                    style={{ color: '#1677ff', cursor: 'pointer' }}
                    onClick={handleOpenPolicy}
                  >
                    ข้อกำหนดการใช้บริการ
                  </span>
                  และรับทราบ
                  <span
                    style={{ color: '#1677ff', cursor: 'pointer' }}
                    onClick={handleOpenPrivacy}
                  >
                    นโยบายความเป็นส่วนตัว
                  </span>
                  เพื่อใช้บริการระบบสมาชิก Yaakz!! Shop
                </Typography>
              }
            />

            <Divider textAlign="center" sx={{ width: '100%', fontSize: 12 }}>
              หรือ
            </Divider>

            <Typography fontSize={14}>
              พิมพ์ Email และ Password เพื่อเข้าสู่ระบบ
            </Typography>

            <div className="input-email">
              <MailRounded color="primary" />
              <InputBase
                placeholder="Email"
                name="email"
                onChange={handleData}
                value={login.email}
                className="input-base"
                type="email"
              />
            </div>

            <div className="input">
              <VpnKeyRounded color="primary" />
              <InputBase
                placeholder="Password"
                name="password"
                onChange={handleData}
                value={login.password}
                type={showPassword ? 'text' : 'password'}
                style={{ flex: 1 }}
              />
              <IconButton onClick={togglePasswordVisibility}>
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </div>
            <Typography
              align="center"
              fontSize={14}
              fontWeight={600}
              color="primary"
              onClick={() => setOpenForgotPassword(true)}
            >
              ลืมรหัสผ่าน?
            </Typography>
            <Button
              loading={isLoading}
              variant="contained"
              size="medium"
              className="btn-confirm"
              onClick={onLogin}
            >
              เข้าสู่ระบบ
            </Button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {/* 🔹 Social Login */}
            <div style={{ textAlign: 'center' }}>
              <Typography fontSize={14} mb={1}>
                ลงทะเบียนด้วย
              </Typography>

              <Button
                variant="contained"
                onClick={() => {
                  if (!checked) {
                    toast.error('กรุณายอมรับเงื่อนไขก่อน')
                    return
                  }
                  googleLogin()
                }}
                sx={{
                  borderRadius: '20px',
                  gap: 1,
                  width: '100%',
                  padding: ' 10px',
                  fontWeight: 500,
                  border: '1px solid',
                  backgroundColor: checked ? '#fff' : '#f0f0f0',
                  color: checked ? '#1677ff' : '#666',
                  borderColor: checked ? '#1677ff' : '#e0e0e0',
                  cursor: 'pointer',
                  boxShadow: checked
                    ? '0 2px 5px rgba(96, 96, 96, 0.3)'
                    : 'none',
                }}
              >
                <Image
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="google"
                  width={18}
                  height={18}
                />
                เข้าใช้งานด้วย Google
              </Button>

              <Divider sx={{ my: 2, fontSize: 12 }}>หรือ</Divider>
            </div>

            {/* 🔹 Form */}
            <Typography fontSize={14}>
              พิมพ์ Email และ Password เพื่อลงทะเบียนใช้งาน
            </Typography>

            <div className="input-email">
              <MailRounded color="primary" />
              <InputBase
                placeholder="Email"
                name="email"
                onChange={handleDataRegis}
                value={regis.email}
                className="input-base"
              />
            </div>

            <div className="input">
              <VpnKeyRounded color="primary" />
              <InputBase
                placeholder="Password"
                name="password"
                onChange={handleDataRegis}
                value={regis.password}
                type={showPassword ? 'text' : 'password'}
                style={{ flex: 1 }}
              />
              <IconButton onClick={togglePasswordVisibility}>
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </div>

            <div className="input">
              <VpnKeyRounded color="primary" />
              <InputBase
                placeholder="Password อีกครั้ง"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                type={showPasswordConfirme ? 'text' : 'password'}
                style={{ flex: 1 }}
              />
              <IconButton onClick={togglePasswordVisibilityConfirm}>
                {showPasswordConfirme ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </div>

            <FormControlLabel
              control={
                <Checkbox checked={checked} onChange={handleChangeCheck} />
              }
              label={
                <Typography fontSize={13}>
                  ฉันยอมรับ{' '}
                  <span
                    style={{ color: '#1677ff', cursor: 'pointer' }}
                    onClick={handleOpenPolicy}
                  >
                    ข้อกำหนดการใช้บริการ
                  </span>
                  และรับทราบ
                  <span
                    style={{ color: '#1677ff', cursor: 'pointer' }}
                    onClick={handleOpenPrivacy}
                  >
                    นโยบายความเป็นส่วนตัว
                  </span>
                  เพื่อใช้บริการระบบสมาชิก Yaakz!! Shop
                </Typography>
              }
            />
            {/* 🔥 ปุ่ม */}
            <Button
              disabled={!checked}
              loading={isLoading}
              onClick={onRegis}
              variant="contained"
              className="btn-confirm"
            >
              ลงทะเบียน
            </Button>
          </div>
        )}

        <div
          style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}
        >
          {status === 'Login' ? (
            <Typography>
              ยังไม่มีบัญชีใช้งาน?{' '}
              <span
                style={{ color: '#1677ff', cursor: 'pointer' }}
                onClick={() => setStatus('Register')}
              >
                ลงทะเบียน
              </span>{' '}
            </Typography>
          ) : (
            <Typography>
              มีบัญชีแล้ว?{' '}
              <span
                style={{ color: '#1677ff', cursor: 'pointer' }}
                onClick={() => setStatus('Login')}
              >
                เข้าสู่ระบบ
              </span>{' '}
            </Typography>
          )}
        </div>
<div
          style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}
        >
        <Typography>
          <span
            style={{ color: '#1677ff', cursor: 'pointer' }}
            onClick={() => navigate.Home()}
          >
            กลับไปหน้าหลัก
          </span>{' '}
        </Typography>
        </div>
      </Box>

      <Dialog
        open={openPolicy}
        onClose={handleClosePolicy}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            style: {
              borderRadius: 20,
            },
          },
        }}
      >
        <DialogTitle>
          ข้อกำหนดการใช้บริการ Yaakz!! Shop
          <IconButton
            onClick={handleClosePolicy}
            style={{ position: 'absolute', right: 20, top: 15 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Typography fontSize={14}>
            ข้อกำหนดและเงื่อนไขฉบับนี้ ("ข้อกำหนดการใช้บริการ")
            จัดทำขึ้นเพื่อกำหนดสิทธิ หน้าที่
            และขอบเขตการใช้บริการของสมาชิกที่สมัครเข้าร่วมระบบสมาชิก (Membership
            Platforms) ของร้าน Yaakz!! Shop โดยการสมัครสมาชิกถือว่าสมาชิกได้อ่าน
            เข้าใจ และยอมรับข้อกำหนดและเงื่อนไขฉบับนี้ทุกประการ
            <br />
            <br />
            1.การสมัครสมาชิก
            <br />
            1.1 ระบบสมาชิกเปิดให้บริการแก่บุคคลธรรมดาทั่วไป
            โดยสมัครผ่านช่องทางเว็บไซต์ member.yaakzshop.com
            <br />
            1.2 ผู้สมัครต้องให้ข้อมูลส่วนบุคคลที่ถูกต้อง ครบถ้วน และเป็นความจริง
            หากข้อมูลไม่ถูกต้องหรือไม่เป็นปัจจุบัน
            อาจส่งผลให้ไม่สามารถรับสิทธิประโยชน์ได้
            <br />
            1.3 สมาชิกหนึ่งรายสามารถลงทะเบียนได้เพียงหนึ่งบัญชีต่อหนึ่ง e-mail
            หมายเลขโทรศัพท์หรือหนึ่งบัญชีผู้ใช้งานเท่านั้น
            <br />
            1.4 ร้านขอสงวนสิทธิ์ในการปฏิเสธ ระงับ หรือยกเลิกการสมัครสมาชิก
            หากตรวจพบการให้ข้อมูลอันเป็นเท็จ การทุจริต หรือการกระทำใดๆ
            ที่ขัดต่อข้อกำหนดและเงื่อนไขนี้
            <br />
            <br />
            2.สถานะสมาชิก
            <br />
            2.1
            สมาชิกจะมีสถานะเป็นสมาชิกสมบูรณ์เมื่อดำเนินการสมัครเสร็จสมบูรณ์ตามขั้นตอนที่ร้านกำหนด
            <br />
            2.2 การสมัครสมาชิกไม่มีค่าใช้จ่าย และสถานะสมาชิกไม่มีวันหมดอายุ
            เว้นแต่ร้านจะกำหนดเป็นอย่างอื่นในภายหลัง
            <br />
            <br />
            3.สิทธิประโยชน์ของสมาชิก
            <br />
            3.1 สมาชิกมีสิทธิ์ได้รับข่าวสาร โปรโมชั่น ส่วนลด คูปอง สิทธิพิเศษ
            หรือกิจกรรมส่งเสริมการขายตามเงื่อนไขที่ร้านกำหนดในแต่ละช่วงเวลา
            <br />
            3.2 สิทธิประโยชน์บางรายการอาจมีเงื่อนไขเฉพาะ เช่น ระยะเวลาใช้งาน
            ยอดใช้จ่ายขั้นต่ำ หรือการจำกัดสิทธิ์เฉพาะบางสาขา
            <br />
            3.3 สิทธิประโยชน์ไม่สามารถโอน เปลี่ยนเป็นเงินสด
            หรือใช้ร่วมกับรายการส่งเสริมการขายอื่นได้
            เว้นแต่ร้านจะระบุไว้เป็นอย่างอื่น
            <br />
            <br />
            4.แต้มสะสม คูปอง และสิทธิ์อื่น
            <br />
            4.1 การสะสมและการใช้แต้ม คูปอง หรือสิทธิ์อื่นใด
            ให้เป็นไปตามหลักเกณฑ์และเงื่อนไขที่ร้านประกาศกำหนดในแต่ละแคมเปญ
            <br />
            4.2 แต้มสะสมหรือคูปองอาจมีวันหมดอายุ
            สมาชิกมีหน้าที่ตรวจสอบก่อนการใช้งาน
            <br />
            4.3 ร้านขอสงวนสิทธิ์ในการยกเลิกหรือเรียกคืนสิทธิ์ที่ได้มาโดยไม่ชอบ
            หรือเกิดจากความผิดพลาดของระบบ
            <br />
            <br />
            5.การใช้สิทธิ์และคูปอง
            <br />
            5.1
            คูปองหรือสิทธิ์ส่วนลดสามารถใช้ได้ตามช่องทางและเงื่อนไขที่ร้านกำหนดเท่านั้น
            <br />
            5.2 สิทธิ์หนึ่งรายการสามารถใช้ได้ต่อหนึ่งใบเสร็จต่อหนึ่งการทำรายการ
            เว้นแต่ร้านจะกำหนดเป็นอย่างอื่น
            <br />
            5.3 ไม่สามารถขยายระยะเวลาการใช้งานคูปองได้ไม่ว่ากรณีใด ๆ
            <br />
            <br />
            6.หน้าที่และความรับผิดของสมาชิก
            <br />
            6.1
            สมาชิกมีหน้าที่ดูแลรักษาบัญชีผู้ใช้งานและอุปกรณ์ที่ใช้ในการเข้าร่วมโปรแกรมสมาชิก
            <br />
            6.2 ในกรณีที่มีการใช้สิทธิ์ คูปอง หรือสิทธิประโยชน์ใด ๆ
            ผ่านบัญชีของสมาชิก ไม่ว่าจะโดยสมาชิกเองหรือบุคคลอื่น
            ให้ถือว่าเป็นการใช้สิทธิ์โดยชอบและอยู่ในความรับผิดชอบของสมาชิกเจ้าของบัญชีนั้น
            <br />
            <br />
            7.การแก้ไข เปลี่ยนแปลง และการยกเลิก
            <br />
            7.1 ร้านขอสงวนสิทธิ์ในการแก้ไข เปลี่ยนแปลง ระงับ หรือยกเลิก
            โปรแกรมสมาชิก สิทธิประโยชน์
            หรือข้อกำหนดและเงื่อนไขนี้ไม่ว่าทั้งหมดหรือบางส่วน
            โดยไม่จำเป็นต้องแจ้งให้ทราบล่วงหน้า
            <br />
            7.2 การเปลี่ยนแปลงใด ๆ
            จะมีผลบังคับใช้ทันทีเมื่อมีการประกาศผ่านช่องทางของร้าน
            <br />
            <br />
            8.การยกเลิกสถานะสมาชิก
            <br />
            8.1 สมาชิกสามารถขอยกเลิกสถานะสมาชิกได้ผ่านช่องทางที่ร้านกำหนด
            <br />
            8.2 ร้านมีสิทธิ์ยกเลิกสถานะสมาชิกทันที
            หากสมาชิกฝ่าฝืนข้อกำหนดและเงื่อนไข หรือกระทำการใด ๆ
            ที่อาจก่อให้เกิดความเสียหายต่อร้าน
          </Typography>
        </DialogContent>
      </Dialog>

      <Dialog
        open={openPrivacy}
        onClose={handleClosePrivacy}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            style: {
              borderRadius: 20,
            },
          },
        }}
      >
        <DialogTitle>
          นโยบายคุ้มครองข้อมูลส่วนบุคคล
          <IconButton
            onClick={handleClosePrivacy}
            style={{ position: 'absolute', right: 20, top: 15 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent style={{ fontSize: 14 }}>
          Yaakz!! Shop
          ให้ความสำคัญกับการคุ้มครองข้อมูลส่วนบุคคลของลูกค้าและสมาชิกทุกท่าน
          นโยบายฉบับนี้จัดทำขึ้นเพื่ออธิบายแนวทางในการเก็บรวบรวม ใช้
          และเปิดเผยข้อมูลส่วนบุคคลตามกฎหมายคุ้มครองข้อมูลส่วนบุคคลที่เกี่ยวข้อง
          <br />
          <br />
          1.การเก็บรวบรวมข้อมูลส่วนบุคคล
          <br />
          ร้านอาจเก็บรวบรวมข้อมูลส่วนบุคคล เช่น ชื่อ–นามสกุล หมายเลขโทรศัพท์
          ที่อยู่จัดส่ง e-mail ข้อมูลการใช้สิทธิ์ ข้อมูลการซื้อสินค้า
          หรือข้อมูลอื่นใดที่จำเป็นต่อการให้บริการ
          <br />
          <br />
          2.วัตถุประสงค์ในการใช้ข้อมูล
          <br />
          ข้อมูลส่วนบุคคลจะถูกนำไปใช้เพื่อวัตถุประสงค์ดังต่อไปนี้
          <ul>
            <li>การบริหารจัดการโปรแกรมสมาชิกเพื่อสิทธิประโยชน์</li>
            <li>การแจ้งข่าวสาร โปรโมชั่น และกิจกรรมส่งเสริมการขาย</li>
            <li>การพัฒนาสินค้า บริการ และประสบการณ์ของลูกค้า</li>
            <li>การปฏิบัติตามกฎหมายและข้อกำหนดที่เกี่ยวข้อง</li>
          </ul>
          3.การเปิดเผยข้อมูลส่วนบุคคล
          <br />
          ร้านจะไม่เปิดเผยข้อมูลส่วนบุคคลของสมาชิกให้แก่บุคคลภายนอก เว้นแต่
          <ul>
            <li> ได้รับความยินยอมจากเจ้าของข้อมูล</li>
            <li> เป็นไปตามที่กฎหมายกำหนด</li>
            <li> จำเป็นต่อการให้บริการผ่านผู้ให้บริการระบบ</li>
          </ul>
          4.การเก็บรักษาและความปลอดภัยของข้อมูล
          <br />
          ร้านจะจัดให้มีมาตรการที่เหมาะสมเพื่อรักษาความมั่นคงปลอดภัยของข้อมูลส่วนบุคคล
          และจะเก็บรักษาข้อมูลไว้ตามระยะเวลาที่จำเป็นตามวัตถุประสงค์
          <br />
          <br />
          5.สิทธิของเจ้าของข้อมูล
          <br />
          เจ้าของข้อมูลมีสิทธิขอเข้าถึง แก้ไข ลบ
          หรือเพิกถอนความยินยอมในการใช้ข้อมูลส่วนบุคคลได้ตามกฎหมาย
          <br />
          <br />
          6.การเปลี่ยนแปลงนโยบาย
          <br />
          ร้านขอสงวนสิทธิ์ในการแก้ไขหรือเปลี่ยนแปลงนโยบายฉบับนี้
          โดยจะแจ้งผ่านช่องทางที่ร้านกำหนด
        </DialogContent>
      </Dialog>

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        slotProps={{
          paper: {
            sx: {
              borderRadius: '20px',
            },
          },
        }}
      >
        <DialogTitle
          id="alert-dialog-title"
          style={{
            display: 'flex',
            justifyContent: 'right',
            alignItems: 'center',
          }}
        ></DialogTitle>
        <DialogContent>
          <div style={{ display: 'flex', gap: 5, justifyContent: 'center' }}>
            <Image
              src="/email-verify-3d-icon-download-in-png-blend-fbx-gltf-file-formats--mail-approved-approve-approval-pack-sign-symbols-icons-5073621.webp"
              alt=""
              width={130}
              height={120}
              style={{ padding: 0 }}
            />
          </div>
          <Typography fontSize={12}>
            โปรดตรวจสอบ Email ที่ลงทะเบียนไว้
            เพื่อนำรหัสยืนยันมาพิมพ์ในช่องด้านล่างนี้ (หากไม่พบ Email
            กรุณาตรวจสอบที่ Junk หรือ Spam ของระบบ Email ที่คุณใช้งานอยู่)
          </Typography>

          <br />
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            {otp.map((data, index) => (
              <input
                key={index}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={data}
                onChange={(e) => handleChangeOtp(e.target, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={handlePaste}
                className="input-email-verify"
                ref={(el) => {
                  inputsRef.current[index] = el
                }}
              />
            ))}
          </div>
          {/* <Typography
            fontSize={12}
            style={{
              textAlign: 'center',
              marginTop: 5,
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            ส่งรหัสยืนยันอีกครั้ง
          </Typography> */}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={onVerifyEmail}
            variant="contained"
            size="medium"
            style={{
              width: '98%',
              borderRadius: 20,
              margin: '2px',
            }}
          >
            ยืนยัน
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openForgotPassword}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        slotProps={{
          paper: {
            sx: {
              borderRadius: '20px',
            },
          },
        }}
      >
        <DialogTitle
          id="alert-dialog-title"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {' '}
          <Typography>คุณต้องการตั้งรหัสผ่านใหม่</Typography>
          <div>
            <IconButton onClick={() => setOpenForgotPassword(false)}>
              <Close />
            </IconButton>
          </div>
        </DialogTitle>
        <DialogContent style={{ marginBottom: -20 }}>
          <div style={{ width: '100%' }}>
            <div className="input">
              <InputBase
                placeholder="Email"
                name="email"
                onChange={handleDataReset}
                value={resetPassword.email}
                className="input-base"
              />
            </div>
            <Typography
              fontSize={12}
              style={{ marginTop: 10, color: '#757575' }}
            >
              *หากไม่พบ email ใน inbox กรุณาตรวจสอบที่ Junk หรือ Spam*
            </Typography>
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            loading={isLoadingVerify}
            onClick={onForgotPassword}
            variant="contained"
            size="medium"
            style={{
              width: '100%',
              borderRadius: 10,
              margin: '12px',
            }}
          >
            ยืนยัน
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openResetPassword}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        slotProps={{
          paper: {
            sx: {
              borderRadius: '20px',
            },
          },
        }}
      >
        <DialogTitle
          id="alert-dialog-title"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography>รีเซ็ตรหัสผ่าน</Typography>
          <div>
            <IconButton>
              <Close />
            </IconButton>
          </div>
        </DialogTitle>
        <DialogContent style={{ marginBottom: -20 }}>
          <div className="input">
            <InputBase
              placeholder="พิมพ์รหัสผ่านใหม่"
              name="resetPassword"
              onChange={handleDataRegis}
              value={regis.email}
              className="input-base"
            />
          </div>
          <div className="input">
            <InputBase
              placeholder="พิมพ์รหัสผ่านอีกครั้ง"
              name="resetPasswordConfirm"
              onChange={handleDataRegis}
              value={regis.email}
              className="input-base"
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            size="medium"
            style={{
              width: '98%',
              borderRadius: 10,
              margin: '12px',
            }}
          >
            บันทึกรหัสผ่านใหม่
          </Button>
        </DialogActions>
      </Dialog>

      <div className="footer-version">
        {version}
        <br />
        &copy; Yaakz Shop
      </div>
    </Box>
  )
}
