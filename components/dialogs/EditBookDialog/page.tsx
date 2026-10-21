'use client'

import React from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
} from '@mui/material'
import { Close } from '@mui/icons-material'
import { ProductItem } from '@/models/type'

interface EditBookDialogProps {
  open: boolean
  formData: ProductItem

  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void

  onClose: () => void
  onSave: () => void
}

export default function EditBookDialog({
  open,
  formData,
  onChange,
  onClose,
  onSave,
}: EditBookDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      slotProps={{
        paper: {
          sx: {
            borderRadius: '20px',
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        แก้ไขหนังสือ
       
      </DialogTitle>

      <DialogContent>
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            pt: 1,
          }}
        >
           <Typography/>
          <TextField
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '20px',
              },
            }}
            name="name"
            label="ชื่อหนังสือ"
            value={formData.name || ''}
            onChange={onChange}
            size="small"
            fullWidth
          />

          <TextField
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '20px',
              },
            }}
            name="isbn"
            label="ISBN"
            value={formData.isbn || formData.barcode || ''}
            onChange={onChange}
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
            onChange={onChange}
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
            onChange={onChange}
            size="small"
            fullWidth
          />

          <TextField
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '20px',
              },
            }}
            name="price"
            label="ราคา"
            value={formData.price || ''}
            onChange={onChange}
            size="small"
            fullWidth
            slotProps={{
              htmlInput: {
                inputMode: 'decimal',
              },
            }}
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
            onChange={onChange}
            multiline
            minRows={3}
            fullWidth
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          onClick={onClose}
          sx={{
            borderRadius: 20,
            textTransform: 'none',
          }}
        >
          ยกเลิก
        </Button>

        <Button
        disabled={
          !formData.name ||
          !formData.isbn 
        }
          fullWidth
          variant="contained"
          onClick={onSave}
          sx={{
            borderRadius: 20,
            textTransform: 'none',
          }}
        >
          บันทึก
        </Button>
      </DialogActions>
    </Dialog>
  )
}
