'use client'

import { key } from '@/models/constant'
import { ProductItem } from '@/models/type'
import { getLocalStorage } from '@/services/StorageUtils'
import { formatBalance, getImageUrlFromDynamic } from '@/services/StringUtils'
import {
  AddShoppingCartRounded,
  BusinessRounded,
  Close,
  CollectionsBookmarkOutlined,
  DeleteOutlineRounded,
  EditRounded,
  Face3Rounded,
  LocalOfferRounded,
  MenuBookOutlined,
  MoreVert,
} from '@mui/icons-material'
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Typography,
} from '@mui/material'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import React from 'react'
import Barcode from 'react-barcode'

interface BookDialogProps {
  open: boolean
  item: ProductItem | null
  onClose: () => void

  onAddToCart?: (item: ProductItem) => void
  onMove?: (item: ProductItem) => void
  onEdit?: (item: ProductItem) => void
  onDelete?: (item: ProductItem) => void
}

interface DetailItemProps {
  icon?: React.ReactNode
  label: string
  value?: React.ReactNode
}

const DetailItem = ({ icon, label, value }: DetailItemProps) => {
  return (
    <Box sx={{ mb: 1 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        {icon}

        <Typography variant="body1" color="text.secondary">
          {label} :
        </Typography>

        {label === 'ราคา' ? (
          <Box sx={{ display: 'flex', justifyContent: 'right' }}>
            <Typography
              fontSize={16}
              color="error"
              sx={{
                fontWeight: 'bold',
                whiteSpace: 'nowrap',
              }}
            >
              {value ?? '-'}&nbsp;
            </Typography>
            <Typography>บาท</Typography>
          </Box>
        ) : (
          <Typography variant="subtitle1" fontWeight={600}>
            {value ?? '-'}
          </Typography>
        )}
      </Box>
    </Box>
  )
}

export default function BookDialog({
  open,
  item,
  onClose,
  onAddToCart,
  onMove,
  onEdit,
  onDelete,
}: BookDialogProps) {
  if (!item) return null

  const token = getLocalStorage(key.TOKEN)
const pathname = usePathname()
const isLoggedIn = !!token

const isHomePage = pathname === '/home/' || pathname === '/' || pathname === '/shelf/'
const hasActions =
  isLoggedIn &&
  !isHomePage &&
  (!!onMove || !!onEdit || !!onDelete)

  
  return (
    <Dialog
      open={open}
      onClose={onClose}
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
            p: 0,
            borderRadius: '20px',
            width: '80%',
            m: 0,
          },
        },
      }}
    >
      {/* ================= HEADER ================= */}

      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography fontWeight={600}>รายละเอียด</Typography>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          {/* ================= ACTION MENU ================= */}

          {hasActions && (
            <SpeedDial
              ariaLabel="book actions"
              direction="down"
              icon={<MoreVert />}
              onClick={(e) => e.stopPropagation()}
              FabProps={{
                size: 'small',
              }}
              sx={{
                '& .MuiFab-root': {
                  width: 28,
                  height: 28,
                  minHeight: 28,
                  backgroundColor: '#fff',
                  boxShadow: 'none',
                  color: '#1677ff',

                  '&:hover': {
                    backgroundColor: 'rgba(0,0,0,0.05)',
                    boxShadow: 'none',
                  },

                  '&:active': {
                    transform: 'scale(0.9)',
                  },
                },

                '& .MuiSpeedDial-actions': {
                  position: 'absolute',
                  top: 45,
                },
              }}
            >
              {/* ADD TO CART */}

              {onAddToCart && (
                <SpeedDialAction
                  icon={
                    <AddShoppingCartRounded color="primary" fontSize="small" />
                  }
                  tooltipTitle="เพิ่มลง List"
                  onClick={() => {
                    onAddToCart(item)
                  }}
                />
              )}

              {/* MOVE */}

              {onMove && (
                <SpeedDialAction
                  icon={
                    <CollectionsBookmarkOutlined
                      color="primary"
                      fontSize="small"
                    />
                  }
                  tooltipTitle="ย้ายหนังสือ"
                  onClick={() => {
                    onMove(item)
                  }}
                />
              )}

              {/* EDIT */}

              {onEdit && (
                <SpeedDialAction
                  icon={<EditRounded color="warning" fontSize="small" />}
                  tooltipTitle="แก้ไข"
                  onClick={() => {
                    onEdit(item)
                  }}
                />
              )}

              {/* DELETE */}

              {onDelete && (
                <SpeedDialAction
                  icon={<DeleteOutlineRounded color="error" fontSize="small" />}
                  tooltipTitle="ลบ"
                  onClick={() => {
                    onDelete(item)
                  }}
                />
              )}
            </SpeedDial>
          )}

          {/* ================= CLOSE ================= */}

          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* ================= CONTENT ================= */}

      <DialogContent
        sx={{
          display: 'grid',
          gap: 1,
        }}
      >
        {/* IMAGE */}

        {item.picture ? (
          <Box
            sx={{
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {/* Background */}

            <Image
              src={getImageUrlFromDynamic(item.picture)}
              alt=""
              fill
              style={{
                objectFit: 'cover',
                filter: 'blur(2px)',
                transform: 'scale(0.9)',
              }}
            />

            {/* Overlay */}

            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                background: `
                  linear-gradient(
                    to bottom,
                    rgba(255,255,255,0.15) 0%,
                    rgba(255,255,255,0.35) 35%,
                    rgba(255,255,255,0.7) 70%,
                    rgba(255,255,255,1) 100%
                  )
                `,
              }}
            />

            {/* Main Image */}

            <Box
              sx={{
                position: 'relative',
                width: 150,
                height: 190,
                zIndex: 1,
              }}
            >
              <Image
                src={getImageUrlFromDynamic(item.picture)}
                alt={item.name ?? ''}
                fill
                style={{
                  objectFit: 'contain',
                }}
              />
            </Box>
          </Box>
        ) : (
          <Box
            sx={{
              width: 100,
              height: 140,
              mx: 'auto',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Typography>ไม่มีรูปภาพ</Typography>
          </Box>
        )}

        {/* NAME */}

        <Typography fontSize={20} fontWeight={600}>
          {item.name}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
          <Barcode
            value={item.barcode || item.isbn || ''}
            width={2}
            height={60}
            displayValue={false}
          />
        </Box>

        <Typography sx={{ mt: 1 }}>รายละเอียด</Typography>

        {/* ================= DETAILS ================= */}

        <DetailItem
          icon={<MenuBookOutlined fontSize="small" />}
          label="ISBN"
          value={item.barcode || item.isbn}
        />

        <DetailItem
          icon={<BusinessRounded fontSize="small" />}
          label="สำนักพิมพ์"
          value={item.publisher}
        />

        <DetailItem
          icon={<Face3Rounded fontSize="small" />}
          label="ผู้แต่ง"
          value={item.writer}
        />

        <DetailItem
          icon={<LocalOfferRounded fontSize="small" />}
          label="ราคา"
          value={formatBalance(item.price ?? '-')}
        />
      </DialogContent>
    </Dialog>
  )
}
