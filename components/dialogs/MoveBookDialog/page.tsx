'use client'

import React from 'react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  Typography,
} from '@mui/material'
import { Close } from '@mui/icons-material'
import { ProductItem } from '@/models/type'

interface MoveBookDialogProps {
  open: boolean
  item: ProductItem | null
  shelfList: any[]
  targetShelfId: string

  onChangeShelf: (shelfId: string) => void
  onClose: () => void
  onConfirm: () => void
}

export default function MoveBookDialog({
  open,
  item,
  shelfList,
  targetShelfId,
  onChangeShelf,
  onClose,
  onConfirm,
}: MoveBookDialogProps) {
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
  

      <DialogContent>
        <Typography
          fontWeight={600}
          sx={{ mb: 2 }}
        >
          {item?.name}
        </Typography>

        <Typography
          fontSize={14}
          color="text.secondary"
          sx={{ mb: 1 }}
        >
          เลือกชั้นหนังสือ
        </Typography>

        <FormControl fullWidth size="small">
          <Select
            value={targetShelfId}
            displayEmpty
            onChange={(e) => {
              onChangeShelf(String(e.target.value))
            }}
            sx={{
              borderRadius: 20,
            }}
          >
           

        {(shelfList ?? [])
              .filter(
                (shelf: any) =>
                  String(shelf._id) !==
                  String(item?.shelf_id),
              )
              .map((shelf: any) => (
                <MenuItem
                
                  key={shelf._id}
                  value={shelf._id}
                >
                  {shelf.name}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
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
          ย้าย
        </Button>
      </DialogActions>
    </Dialog>
  )
}