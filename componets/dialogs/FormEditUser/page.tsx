'use client'
import { Android12Switch } from '@/services/Styles'
import { CakeOutlined, Close } from '@mui/icons-material'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  InputBase,
  FormControl,
  MenuItem,
  Select,
  Typography,
  IconButton,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  TextField,
} from '@mui/material'
import { useState } from 'react'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import 'dayjs/locale/de'
import Image from 'next/image'
import dayjs from 'dayjs'
import React from 'react'
import { getLocalStorage } from '@/services/StorageUtils'
import toast from 'react-hot-toast'
import { key } from '@/models/constant'
import { EditUser } from '@/models/type'

export interface FormEditUserBody {
  email: string
  name: string
  phone: string
  bod: string
  gender: string
  picture?: string
}

interface FormEditUserProps {
  text?: string
  open: boolean
  form: FormEditUserBody

  onClose: () => void
  handleLogin?: () => void
  onSubmit: (value: FormEditUserBody) => void
}

export default function FormEditUserProps(props: FormEditUserProps) {
  const [selected, setSelected] = useState(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [userFound, setUserFound] = useState('')
  const [formData, setFormData] = useState<FormEditUserBody>({
    email: '',
    name: '',
    phone: '',
    bod: '',
    gender: '',
  })

  const translateGender = (gender: string) => {
    if (gender === 'male') return 'ชาย'
    if (gender === 'female') return 'หญิง'
    return gender
  }

  const images = [
    { src: '/snapedit_1745314649757.jpeg', id: 1, gender: 'male' },
    { src: '/snapedit_1745314636445.jpeg', id: 2, gender: 'female' },
  ]

  React.useEffect(() => {
    setFormData(props.form)
  }, [props.form, props.open])

  React.useEffect(() => {
    const gender = images.find((img: any) => img.id === selected)
    setFormData((prevData) => ({
      ...prevData,
      gender: gender?.gender || 'ชาย',
    }))
  }, [selected])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    // ถ้าเป็น phone ให้กรองเฉพาะตัวเลข
    const cleanedValue = name === 'phone' ? value.replace(/\D/g, '') : value

    setFormData((prevData) => ({
      ...prevData,
      [name]: cleanedValue,
    }))
  }

  const validateForm = React.useCallback(() => {
    if (!formData.name || !formData.phone) {
      return false
    }
    if (formData.phone.length < 10) {
      return false
    }
    return true
  }, [formData])

  const handleDateChange = (newValue: any) => {
    setFormData((prevData) => ({
      ...prevData,
      bod: newValue.format('YYYY-MM-DD'),
    }))
  }

  const handleSubmit = () => {
    props.onSubmit(formData)
    props.onClose()
  }
  const hasFormData = Boolean(formData.name?.trim() && formData.phone?.trim())

  const hasUserFound = Boolean(
    props.form.name?.trim() && props.form.phone?.trim(),
  )

  const shouldShowCloseButton = hasFormData && hasUserFound

  React.useEffect(() => {
    const stored = getLocalStorage(key.CUSTOMER)

    if (stored) {
      setUserFound(stored.name || stored.phone)
    }
  }, [])

  return (
    <div>
      <Dialog
        open={props.open || false}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        slotProps={{
          paper: {
            sx: {
              padding: 0,
              borderRadius: '20px',
              width: '80%',
              margin: 0,
              top: 0,
              bottom: 0,
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
          ข้อมูลผู้ใช้
        </DialogTitle>
        <DialogContent style={{ display: 'grid', gap: 15 }}>
          <Typography/>
          <TextField
            disabled
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '20px',
              },
            }}
            name="name"
            label="Email"
            value={formData.email || ''}
            onChange={handleChange}
            size="small"
            fullWidth
          />
          <TextField
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '20px',
              },
            }}
            name="name"
            label="ชื่อ"
            value={formData.name || ''}
            onChange={handleChange}
            size="small"
            fullWidth
          />

          <TextField
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '20px',
              },
            }}
            name="phone"
            label="เบอร์มือถือ"
            value={formData.phone || ''}
            onChange={handleChange}
            size="small"
            fullWidth
          />

          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="th">
            <DatePicker
              name="bod"
              format="DD/MM/YYYY"
              // ❌ defaultValue → ✅ value
              value={formData.bod ? dayjs(formData.bod) : null}
              onChange={handleDateChange}
              slots={{
                openPickerIcon: CakeOutlined,
              }}
              slotProps={{
                textField: {
                  InputProps: {
                    style: { borderRadius: '20px', height: 40 },
                  },
                  error: false,
                  sx: {
                    '& .Mui-error': { color: 'inherit' },
                    '& .MuiFormHelperText-root.Mui-error': { display: 'none' },
                  },
                },
              }}
            />
          </LocalizationProvider>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 16,
            }}
          >
            {images.map((img: any) => {
              const isSelected = formData.gender === img.gender

              return (
                <div
                  key={img.id}
                  onClick={() => setSelected(img.id)}
                  style={{
                    border: isSelected
                      ? '2px solid #1890FF'
                      : '2px solid #D9D9D9',
                    borderRadius: 10,
                    cursor: 'pointer',
                    padding: 8,
                    width: '40%',
                    transition: 'border 0.2s ease-in-out',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    gap: 8,
                  }}
                >
                  <Image
                    src={img.src}
                    alt=""
                    width={60}
                    height={60}
                    style={{ padding: 0 }}
                  />
                  {translateGender(img.gender)}
                </div>
              )
            })}
          </div>
          <DialogActions >
            {userFound &&(
              <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                props.onClose()
              }}
              sx={{
                borderRadius: 20,
                textTransform: 'none',
              }}
            >
              ยกเลิก
            </Button>
            )}

            <Button
              disabled={!formData.name || !formData.phone}
              fullWidth
              variant="contained"
              onClick={handleSubmit}
              sx={{
                borderRadius: 20,
                textTransform: 'none',
              }}
            >
              บันทึก
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
    </div>
  )
}
