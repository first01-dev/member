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
  CollectionsBookmarkOutlined,
} from '@mui/icons-material'
import { ProductItem } from '@/models/type'

interface MoveFavoriteDialogProps {
  open: boolean
  item: ProductItem | null

  onClose: () => void
  onConfirm: () => void
}

export default function MoveFavoriteDialog({
  open,
  item,
  onClose,
  onConfirm,
}: MoveFavoriteDialogProps) {
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
        <CollectionsBookmarkOutlined
          color="primary"
          sx={{
            fontSize: 50,
            mb: 2,
          }}
        />

        <Typography>
          ต้องการเพิ่ม
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
          เข้ากองดองหรือไม่
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
          variant="contained"
          onClick={onConfirm}
          sx={{
            borderRadius: 20,
            textTransform: 'none',
          }}
        >
          ยืนยัน
        </Button>
      </DialogActions>
    </Dialog>
  )
}