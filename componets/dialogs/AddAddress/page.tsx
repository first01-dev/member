import { Android12Switch } from '@/services/Styles'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  InputBase,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material'
import { Box } from '@mui/system'
import React from 'react'

export interface FormBookAddressForm {
  name: string
  address: string
  sub_district: string
  district: string
  province: string
  post_code: string
  current: number
}
import axios from 'axios'
import { Close } from '@mui/icons-material'
import toast from 'react-hot-toast'
interface AddAddressProps {
  open: boolean
  onClose: () => void
  onSubmit: (value: FormBookAddressForm, onSuccess?: () => void) => void
}
export default function FromAddAddressProps(props: AddAddressProps) {
  const [form, setForm] = React.useState<FormBookAddressForm>({
    name: '',
    address: '',
    sub_district: '',
    district: '',
    province: '',
    post_code: '',
    current: 1,
  })
  const [provinceList, setProvinceList] = React.useState([])
  const [districtList, setDistrictList] = React.useState([])
  const [subDistrictList, setSubDistrictList] = React.useState([])

  const validateForm = React.useCallback(() => {
  const fieldNames: Record<
    Exclude<keyof FormBookAddressForm, 'name'>,
    string
  > = {
    address: 'ที่อยู่',
    sub_district: 'ตำบล',
    district: 'อำเภอ',
    province: 'จังหวัด',
    post_code: 'รหัสไปรษณีย์',
    current: '1',
  }

  for (const [key, label] of Object.entries(fieldNames) as [
    keyof typeof fieldNames,
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

  const initializeAddressList = async () => {
    const headers = {
      Authorization: `Bearer yr^voVolfSx8Xn*^`,
    }
    const res = await axios.get(
      'https://api-pos-uat.bestcommercesolutions.com/address/list',
      {
        headers,
      },
    )

    setProvinceList(res.data.filter((item: any) => item))
  }

  const onSelectProvince = async (name: any) => {
    const prov: any = provinceList.find((item: any) => item.name === name)
    setForm((prev) => ({
      ...prev,
      province: prov.name,
    }))

    if (prov) {
      setDistrictList(prov.district)
    }
  }

  const onSelectDistrictList = async (name: any) => {
    const district: any = districtList.find((item: any) => item.name === name)
    setForm((prev) => ({
      ...prev,
      district: district.name,
    }))

    if (district) {
      setSubDistrictList(district.sub_district)
    }
  }

  const onSelectSubDistrictList = async (name: any) => {
    const zipCode: any = subDistrictList.find((item: any) => item.name === name)
    if (zipCode) {
      setForm((prev) => ({
        ...prev,
        sub_district: zipCode.name,
        post_code: String(zipCode.zip_code),
      }))
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    // ถ้าเป็น phone ให้กรองเฉพาะตัวเลข
    const cleanedValue = name === 'phone' ? value.replace(/\D/g, '') : value

    setForm((prevData) => ({
      ...prevData,
      [name]: cleanedValue,
    }))
  }

  const clearForm = () => {
    setForm({
      name: '',
      address: '',
      sub_district: '',
      district: '',
      province: '',
      post_code: '',
      current: 1,
    })
  }

  const handleClose = () => {
    clearForm() // เคลียร์ฟอร์มเมื่อปิด
    props.onClose() // เรียกปิดฟอร์ม
  }

  const handleSubmit = () => {
    if (!validateForm()) return

    props.onSubmit(form, () => {
      clearForm()
    })
    props.onClose()
  }

  React.useEffect(() => {
    if (props.open) {
      initializeAddressList()
    }
  }, [props.open])

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
              width: '100%',
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
          เพิ่มที่อยู่
          <IconButton onClick={handleClose}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent style={{ display: 'grid', gap: 15}}>
     <Typography/>
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
