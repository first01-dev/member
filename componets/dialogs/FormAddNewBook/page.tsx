'use client'
import { CakeOutlined, Close, CloudUpload } from '@mui/icons-material'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputAdornment,
  InputBase,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import dayjs from 'dayjs'
import Image from 'next/image'
import React from 'react'
import Html5QrcodePlugin from '../../BarcodeScanner'
import toast from 'react-hot-toast'

interface BookDialogsProps {
  openAdd: boolean

  shelfList?: any[]

  onCloseAdd: () => void
  onSaveShelf?: () => void
  onSaveBook: () => void
  onNewScanResult: (decodedText: string, decodedResult: any) => Promise<boolean>
  formData: any

  handleChange: (e: any) => void
}
export default function FormAddNewBook(props: BookDialogsProps) {
  const { openAdd, shelfList, formData, onCloseAdd, onSaveBook, handleChange } =
    props

  const scanLock = React.useRef(false)
  const [openScan, setOpenScan] = React.useState(false)
  const handleDateChange = (newValue: any) => {
    handleChange({
      target: {
        name: 'publisher',
        value: newValue ? newValue.format('YYYY-MM-DD') : '',
      },
    })
  }

  return (
    <Box>
      <Dialog
        slotProps={{
          backdrop: {
            sx: {
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
              zIndex: 1300,
            },
          },
        }}
        open={openAdd || false}
        onClose={onCloseAdd}
      >
        <DialogTitle>เพิ่มหนังสือ</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 1 }}>
          <Typography/>
          <TextField
            name="isbn"
            label="ISBN"
            value={formData.isbn || ''}
            onChange={handleChange}
            size="small"
            fullWidth
            error={!formData?.isbn}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '20px',
                paddingRight: '6px',
                width: '100%',
              },
            }}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setOpenScan(true)}
                      edge="end"
                      sx={{
                        width: 36,
                        height: 30,
                        right: 12,
                       backgroundColor:
                    '#d6e6fd',
                        borderRadius: '20px',

                       
                      }}
                    >
                      <svg
                        width="28"
                        height="26"
                        viewBox="0 0 24 24"
                        fill="#1677ff"
                      >
                        <path d="M3 5v4h2V7h2V5H3Zm14 0v2h2v2h2V5h-4ZM3 15v4h4v-2H5v-2H3Zm16 0v2h-2v2h4v-4h-2ZM8 7h2v10H8V7Zm3 0h1v10h-1V7Zm2 0h2v10h-2V7Zm3 0h1v10h-1V7Z" />
                      </svg>
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <TextField
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '20px',
              },
            }}
            name="name"
            label="ชื่อหนังสือ"
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
            name="publisher"
            label="สำนักพิมพ์"
            value={formData.publisher || ''}
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
            name="writer"
            label="ผู้แต่ง"
            value={formData.writer || ''}
            onChange={handleChange}
            size="small"
            fullWidth
          />

          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="th">
            <DatePicker
              name="publisher"
              format="DD/MM/YYYY"
              value={formData.bod ? dayjs(formData.bod) : null}
              onChange={handleDateChange}
              slotProps={{
                textField: {
                  placeholder: 'วันวางจำหน่าย', // 👈 ใส่ตรงนี้
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
          <TextField
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '20px',
              },
            }}
            name="price"
            label="ราคา"
            value={formData.price || ''}
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
            name="detail"
            label="รายละเอียด"
            value={formData.detail || ''}
            onChange={handleChange}
            multiline
            minRows={3}
            fullWidth
          />

          <div
            style={{
              width: '100%',
              borderRadius: 20,
              border: '1px solid #D9D9D9',
            }}
          >
            <FormControl
              variant="standard"
              sx={{ width: '100%', padding: 0.5 }}
            >
              <Select
                name="shelf_id"
                disableUnderline
                value={formData.shelf_id || ''}
                onChange={handleChange}
                displayEmpty
                sx={{ borderRadius: 1, width: '98%' }}
              >
                <MenuItem value="">
                  <Typography style={{ marginLeft: 5 }}>
                    เลือกชั้นหนังสือ
                  </Typography>
                </MenuItem>

                {(shelfList || []).map((shelf: any) => (
                  <MenuItem key={shelf._id} value={shelf._id}>
                    {shelf.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
           <DialogActions sx={{ p: 1 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={onCloseAdd}
                    sx={{
                      borderRadius: 20,
                      textTransform: 'none',
                    }}
                  >
                    ยกเลิก
                  </Button>
          
                  <Button
                    fullWidth
                    disabled={!formData.name || !formData.isbn}
                    variant="contained"
                    onClick={onSaveBook}
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

      {/* 📷 Scan Dialog */}
      <Dialog open={openScan} onClose={() => setOpenScan(false)}>
        <DialogTitle
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography> สแกน Barcode ของหนังสือ</Typography>

          <IconButton onClick={() => setOpenScan(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Html5QrcodePlugin
            fps={25}
            qrbox={{ width: 300, height: 100 }}
            disableFlip
            qrCodeSuccessCallback={async (text: string, result: any) => {
              // ถ้ากำลังประมวลผลอยู่ ไม่ให้ยิงซ้ำ
              if (scanLock.current) return

              scanLock.current = true

              try {
                const isFound = await props.onNewScanResult(text, result)

                setOpenScan(false)

                if (!isFound) {
                  setTimeout(() => {
                    toast.error(
                      `ไม่พบข้อมูลหนังสือ\n\nคุณสามารถเพิ่มหนังสือได้ด้วยตนเอง`,
                      {
                        duration: 3000,
                        style: {
                          whiteSpace: 'pre-line',
                        },
                      },
                    )
                  }, 100)
                }
              } finally {
                // ปลดล็อกหลัง 2 วินาที
                setTimeout(() => {
                  scanLock.current = false
                }, 2000)
              }
            }}
          />
        </DialogContent>
      </Dialog>
    </Box>
  )
}
