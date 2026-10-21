'use client'

import React from 'react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from '@mui/material'
import {
  Close,
  DeleteOutlineRounded,
} from '@mui/icons-material'
import { ProductItem } from '@/models/type'

interface DeleteBookDialogProps {
  open: boolean
  item: ProductItem | null

  onClose: () => void
  onConfirm: () => void
}

export default function DeleteBookDialog({
  open,
  item,
  onClose,
  onConfirm,
}: DeleteBookDialogProps) {
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
   

      <DialogContent
        sx={{
          textAlign: 'center',
          py: 3,
        }}
      >
        <DeleteOutlineRounded
          color="error"
          sx={{
            fontSize: 50,
            mb: 2,
          }}
        />

        <Typography>
          ต้องการลบ
        </Typography>

        <Typography
          fontWeight={600}
          sx={{
            mt: 0.5,
            mb: 0.5,
          }}
        >
          {item?.name}
        </Typography>

        <Typography color="text.secondary">
          ออกจากชั้นหนังสือหรือไม่
        </Typography>
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
          fullWidth
          color="error"
          variant="contained"
          onClick={onConfirm}
          sx={{
            borderRadius: 20,
            textTransform: 'none',
          }}
        >
          ลบ
        </Button>
      </DialogActions>
    </Dialog>
  )
}