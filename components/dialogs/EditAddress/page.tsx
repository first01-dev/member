import React from 'react'
import toast from 'react-hot-toast'
import { Close } from '@mui/icons-material'
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputBase,
  MenuItem,
  Select,
  Typography,
  CircularProgress,
  TextField,
  DialogActions,
  InputLabel,
} from '@mui/material'
import { Box } from '@mui/system'
import { AddressBook } from '@/models/type'
import { District, Province, SubDistrict } from '@/interface/ThaiAddress'

export interface FormBookAddressForm {
  name: string
  address: string
  sub_district: string
  district: string
  province: string
  post_code: string

  current: number
}

interface EditAddressProps {
  open: boolean
  onClose: () => void
  address: AddressBook
  provinceList: Province[]
  onSubmit: (
    value: FormBookAddressForm & { _id?: string },
    onSuccess?: () => void,
  ) => Promise<void>
}

export default function FormEditAddressProps(props: EditAddressProps) {
  const [form, setForm] = React.useState<FormBookAddressForm>({
    name: '',
    address: '',
    sub_district: '',
    district: '',
    province: '',
    post_code: '',

    current: 1,
  })
  const [provinceList, setProvinceList] = React.useState<Province[]>([])
  const [districtList, setDistrictList] = React.useState<District[]>([])
  const [subDistrictList, setSubDistrictList] = React.useState<SubDistrict[]>(
    [],
  )
  const [isInitialized, setIsInitialized] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)

  const clearForm = React.useCallback(() => {
    setForm({
      name: '',
      address: '',
      sub_district: '',
      district: '',
      province: '',
      post_code: '',

      current: 1,
    })
    setDistrictList([])
    setSubDistrictList([])
  }, [])

  const handleClose = React.useCallback(() => {
    clearForm()
    setIsInitialized(false)
    props.onClose()
  }, [clearForm, props.onClose])

  const loadInitialData = React.useCallback(() => {
    if (!props.address || provinceList.length === 0) return

    const {
      name,
      address,
      sub_district,
      district,
      province,
      post_code,
      phone,
    } = props.address

    setForm({
      name: name || '',
      address: address || '',
      sub_district: sub_district || '',
      district: district || '',
      province: province || '',
      post_code: post_code || '',
      current: 1,
    })

    if (province) {
      const provinceData = provinceList.find((item) => item.name === province)

      if (provinceData?.district) {
        setDistrictList(provinceData.district)

        if (district) {
          const districtData = provinceData.district.find(
            (item) => item.name === district,
          )
          if (districtData?.sub_district) {
            setSubDistrictList(districtData.sub_district)
          }
        }
      }
    }
  }, [props.address, provinceList])

  const onSelectProvince = React.useCallback(
    (provinceName: string) => {
      const selectedProvince = provinceList.find(
        (item) => item.name === provinceName,
      )

      setForm((prev) => ({
        ...prev,
        province: provinceName,
        district: '',
        sub_district: '',
        post_code: '',
      }))

      setDistrictList(selectedProvince?.district || [])
      setSubDistrictList([])
    },
    [provinceList],
  )

  const onSelectDistrictList = React.useCallback(
    (districtName: string) => {
      const selectedDistrict = districtList.find((item) =>
        item.name.includes(districtName),
      )

      setForm((prev) => ({
        ...prev,
        district: selectedDistrict?.name || '',
        sub_district: '',
        post_code: '',
      }))

      setSubDistrictList(selectedDistrict?.sub_district || [])
    },
    [districtList],
  )

  const onSelectSubDistrictList = React.useCallback(
    (subDistrictName: string) => {
      const selectedSubDistrict = subDistrictList.find((item) =>
        item.name.includes(subDistrictName),
      )

      if (selectedSubDistrict) {
        setForm((prev) => ({
          ...prev,
          sub_district: selectedSubDistrict.name,
          post_code: selectedSubDistrict.zip_code || '',
        }))
      }
    },
    [subDistrictList],
  )

  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target

      setForm((prev) => ({
        ...prev,
        [name]:
          name === 'phone'
            ? value.replace(/\D/g, '').slice(0, 10)
            : name === 'name'
            ? value.slice(0, 100)
            : name === 'address'
            ? value.slice(0, 200)
            : value,
      }))
    },
    [],
  )

  const validateForm = React.useCallback(() => {
    const fieldNames: Record<keyof FormBookAddressForm, string> = {
      name: 'ชื่อ-สกุล',
      address: 'ที่อยู่',
      sub_district: 'ตำบล',
      district: 'อำเภอ',
      province: 'จังหวัด',
      post_code: 'รหัสไปรษณีย์',
      current: '1',
    }

    for (const [key, label] of Object.entries(fieldNames) as [
      keyof FormBookAddressForm,
      string,
    ][]) {
      const value = form[key]

      if (!value || String(value).trim() === '') {
        toast.error(`กรุณากรอก${label}`)
        return false
      }
    }

    return true
  }, [form])

  const handleSubmit = React.useCallback(async () => {
    if (!validateForm() || isSaving) return

    try {
      setIsSaving(true)
      form.post_code = String(form.post_code).trim()
      await props.onSubmit({ ...form, _id: props.address._id }, () => {
        clearForm()
        setIsInitialized(false)
        toast.success('บันทึกข้อมูลเรียบร้อยแล้ว')
      })
      props.onClose()
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการบันทึก กรุณาลองใหม่อีกครั้ง')
    } finally {
      setIsSaving(false)
    }
  }, [
    form,
    props.address,
    props.onSubmit,
    props.onClose,
    validateForm,
    clearForm,
    isSaving,
  ])

  // Load address data when dialog opens
  React.useEffect(() => {
    if (props.open && !isInitialized) {
      setProvinceList(props.provinceList)
      setIsInitialized(true)
    }
  }, [props.open, isInitialized])

  // Load initial data when provinces loaded and dialog is open
  React.useEffect(() => {
    if (isInitialized && props.open && props.address) {
      loadInitialData()
    }
  }, [isInitialized, props.open, props.address, loadInitialData])

  // Reset when dialog closes
  React.useEffect(() => {
    if (!props.open) {
      clearForm()
      setIsInitialized(false)
    }
  }, [props.open, clearForm])

  return (
    <Box>
      <Dialog
        open={props.open || false}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        slotProps={{
          backdrop: {
            sx: {
              position: 'absolute',
            
              left: 0,
              right: 0,
              margin: '0 auto',
            },
          },
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
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          แก้ไขที่อยู่{' '}
          
        </DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 2 }}>
          
          
          {/* <Typography fontSize={14}>เบอร์โทรศัพท์</Typography>
          <div className="input">
            <InputBase
              onChange={handleChange}
              value={form.phone}
              name="phone"
              placeholder="เบอร์โทรศัพท์"
              className="input-base"
            />
          </div> */}
          <Typography/>
          <FormControl fullWidth size="small">
            <InputLabel id="demo-simple-select-label">เลือกจังหวัด</InputLabel>
            <Select
              sx={{ borderRadius: 20 }}
              value={form.province}
              label="เลือกจังหวัด"
              onChange={(e: any) => onSelectProvince(e.target.value)}
            >
              {provinceList.map((item: any, index: number) => (
                <MenuItem value={item.name} key={index}>
                  {item.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel id="demo-simple-select-label">เลือกอำเภอ</InputLabel>
            <Select
              value={form.district}
              label="เลือกอำเภอ"
              onChange={(e: any) => onSelectDistrictList(e.target.value)}
              sx={{ borderRadius: 20 }}
            >
              {districtList.map((item: any, index: number) => (
                <MenuItem value={item.name} key={index}>
                  {item.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel id="demo-simple-select-label">เลือกตำบล</InputLabel>
            <Select
       
              value={form.sub_district}
              label="เลือกตำบล"
              onChange={(e: any) => onSelectSubDistrictList(e.target.value)}
              sx={{ borderRadius: 20 }}
            >
              {subDistrictList.map((item: any, index: number) => (
                <MenuItem value={item.name} key={index}>
                  {item.name}&nbsp;&nbsp;{item.zip_code}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '20px',
              },
            }}
            name="address"
            label="บ้านเลขที่ ซอย ถนน"
            value={form.address || ''}
            onChange={handleChange}
            multiline
            minRows={3}
            fullWidth
          />

          <DialogActions sx={{ p: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleClose}
              sx={{
                borderRadius: 20,
                textTransform: 'none',
              }}
            >
              ยกเลิก
            </Button>

            <Button
              disabled={
                !form.name ||
                !form.address ||
                !form.sub_district ||
                !form.district ||
                !form.province ||
                !form.post_code
              }
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
    </Box>
  )
}
