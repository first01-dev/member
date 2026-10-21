'use client'

import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  InputBase,
  SpeedDial,
  SpeedDialAction,
  IconButton,
} from '@mui/material'
import Image from 'next/image'
import dayjs from 'dayjs'

import { CartItem, ProductItem } from '@/models/type'
import { formatBalance, getImageUrlFromDynamic } from '@/services/StringUtils'
import { VisuallyHiddenInput } from '@/services/Styles'
import {
  AutoStoriesRounded,
  BusinessRounded,
  CalendarMonthRounded,
  ClearAll,
  Close,
  CloudUpload,
  CollectionsBookmarkOutlined,
  DeleteOutlineRounded,
  EditRounded,
  Face3Rounded,
  LocalOfferRounded,
  MenuBookOutlined,
  MoreVert,
} from '@mui/icons-material'
import { key } from '@/models/constant'
import React from 'react'

interface BookStationDialogsProps {
  selectedProduct: ProductItem | null
  shelfList?: any[]

  openDetail: boolean

  dataFound?: boolean

  onCloseDetail: () => void
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
          justifyContent: 'flex-start',
          alignItems: 'center',
          gap: 1,
        }}
      >
        {icon}

        <Typography
          variant="body1"
          sx={{
            color: 'text.secondary',
            fontWeight: 400,
          }}
        >
          {label} :
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 600,
            color: 'text.primary',
          }}
        >
          {value ?? '-'}
        </Typography>
      </Box>
    </Box>
  )
}

export default function BookStstionDialogs(props: BookStationDialogsProps) {
  const {
    selectedProduct,

    openDetail,

    onCloseDetail,
  } = props

  const handleAddToCart = () => {
    if (!selectedProduct) return

    const cart: CartItem[] = JSON.parse(localStorage.getItem(key.CART) || '[]')

    const existIndex = cart.findIndex((item) => item.id === selectedProduct.id)

    if (existIndex !== -1) {
      cart[existIndex].quantity = (cart[existIndex].quantity ?? 0) + 1
    } else {
      const newItem: CartItem = {
        added_time: new Date().toISOString(),
        id: selectedProduct.id,
        name: selectedProduct.name,
        picture: selectedProduct.picture??'',
        barcode: selectedProduct.barcode ?? selectedProduct.isbn,
        ref: selectedProduct.ref_code,
        price: selectedProduct.price?.toString(),
        quantity: 1,
      }

      cart.push(newItem)
    }

    localStorage.setItem(key.CART, JSON.stringify(cart))

    window.dispatchEvent(new Event('cartUpdated'))
    onCloseDetail()
  }

  return (
    <>
      {/* DETAIL */}
      <Dialog
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
        open={openDetail}
        onClose={onCloseDetail}
      >
        <DialogTitle
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          รายละเอียด
          <Box
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <IconButton onClick={() => onCloseDetail()}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 1 }}>
          {selectedProduct?.picture ? (
            <Box
              sx={{
                position: 'relative',

                overflow: 'hidden',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {/* รูปพื้นหลัง */}
              <Image
                src={getImageUrlFromDynamic(selectedProduct.picture)}
                alt=""
                fill
                style={{
                  objectFit: 'cover',
                  filter: 'blur(2px)',
                  transform: 'scale(0.9)',
                }}
              />

              {/* Overlay ไล่สี */}
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

              {/* รูปหลัก */}
              <Box
                sx={{
                  position: 'relative',
                  width: 150,
                  height: 190,
                  zIndex: 1,
                }}
              >
                <Image
                  src={getImageUrlFromDynamic(selectedProduct.picture)}
                  alt=""
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </Box>
            </Box>
          ) : (
            <Typography
              align="center"
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginLeft: 'auto',
                marginRight: 'auto',
                width: 100,
                height: 140,
              }}
            >
              ไม่มีรูปภาพ
            </Typography>
          )}
          <Typography fontSize={20} fontWeight={600}>
            {selectedProduct?.name}{' '}
          </Typography>

          <Typography style={{ marginTop: 10 }}>รายละเอียด</Typography>
          <DetailItem
            icon={<MenuBookOutlined fontSize="small" />}
            label="ISBN"
            value={(selectedProduct?.barcode || selectedProduct?.isbn) ?? '-'}
          />

          <DetailItem
            icon={<BusinessRounded fontSize="small" />}
            label="สำนักพิมพ์"
            value={selectedProduct?.publisher ?? '-'}
          />

          <DetailItem
            icon={<Face3Rounded fontSize="small" />}
            label="ผู้แต่ง"
            value={selectedProduct?.writer ?? '-'}
          />

          {/* <DetailItem
            icon={<CalendarMonthRounded fontSize="small" />}
            label="วันวางจำหน่าย"
            value={
              selectedProduct?.release_on
                ? dayjs(selectedProduct.release_on).format('DD/MM/YYYY')
                : '-'
            }
          /> */}

          <DetailItem
            icon={<LocalOfferRounded fontSize="small" />}
            label="ราคา"
            value={formatBalance(selectedProduct?.price ?? '-')}
          />
        </DialogContent>
        <DialogActions
          style={{ padding: 20, display: 'flex', justifyContent: 'center' }}
        >
          <Button
            onClick={handleAddToCart}
            style={{ borderRadius: 20, width: '100%', textTransform: 'none',}}
            variant="contained"
            
          >
            เพิ่มลง List
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
