'use client'

import Html5QrcodePlugin from '@/componets/BarcodeScanner'
import BookStstionDialogs from '@/componets/dialogs/BookStation/page'
import ImageSlider from '@/componets/BookGrid/page'

import { key } from '@/models/constant'
import { CartItem, ProductItem } from '@/models/type'
import ApiService from '@/services/ApiService'
import {
  AssignmentRounded,
  ChevronRight,
  ClearOutlined,
  Close,
  ExpandLessRounded,
  KeyboardArrowDownRounded,
  LocalMallRounded,
  SearchOutlined,
  ShoppingBasketRounded,
} from '@mui/icons-material'
import {
  Badge,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Fab,
  IconButton,
  InputBase,
  Tooltip,
  Typography,
} from '@mui/material'
import dayjs from 'dayjs'
import { useRouter } from 'next/navigation'
import router from 'next/router'
import React from 'react'
import Barcode from 'react-barcode'
import toast from 'react-hot-toast'

export default function PreStationPage() {
  const LIMIT = 25
  const router = useRouter()

  const [selectedProduct, setSelectedProduct] =
    React.useState<ProductItem | null>(null)
  const [stockList, setStockList] = React.useState<ProductItem[]>([])

  const [searchResults, setSearchResults] = React.useState<ProductItem[]>([])

  const [isFocus, setIsFocus] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [openScan, setOpenScan] = React.useState(false)
  const [openMove, setOpenMove] = React.useState(false)
  const [hasSearched, setHasSearched] = React.useState(false)
  const [openDetail, setOpenDetail] = React.useState(false)
  const [length, setLength] = React.useState(0)
  const [cartCount, setCartCount] = React.useState(0)
  const [loading, setLoading] = React.useState(false)
  const [hasMore, setHasMore] = React.useState(true)

  const [keyword, setKeyword] = React.useState('')

  // ------------------ Search ------------------
  const handleSearchInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(event.target.value)
  }

  const handleClear = () => {
    setKeyword('')
    setSearchResults([])
  }

  const openProductDialog = (product: ProductItem) => {
    setSelectedProduct(product)

    setOpenDetail(true)
    setHasSearched(true)
  }

  const loadMoreBooks = async () => {
    if (loading || !hasMore || !keyword.trim()) return

    setLoading(true)

    const isBarcode = /^\d{13}$/.test(keyword.trim())

    const type = isBarcode ? 'barcode' : 'keywords'

    try {
      const res = await ApiService.getProducts(keyword, type, length, LIMIT)

      const newResults = res.data.data || []

      setSearchResults((prev) => [...prev, ...newResults])

      setLength((prev) => prev + LIMIT)

      // ข้อมูลหมด
      if (newResults.length < LIMIT) {
        setHasMore(false)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const onClickSearch = async () => {
    if (!keyword.trim()) {
      toast.error('กรุณากรอกคำค้นหา')
      return
    }

    setLoading(true)

    const isBarcode = /^\d{13}$/.test(keyword.trim())
    const type = isBarcode ? 'barcode' : 'keywords'

    try {
      const res = await ApiService.getProducts(keyword, type, 0, LIMIT)

      const results = res.data

      // reset ใหม่
      setSearchResults(results)
      setLength(LIMIT)
      setHasMore(results.length === LIMIT)

      if (results.length === 0) {
        toast.error('ไม่พบสินค้าที่ค้นหา')
      }
    } catch {
      toast.error('เกิดข้อผิดพลาดในการค้นหา')
    } finally {
      setLoading(false)
    }
  }

    const onNewScanResult = async (decodedText: string) => {
      setKeyword(decodedText)
      setIsLoading(true)
  
      try {
        const res = await ApiService.getProducts(decodedText, 'barcode')
        setSearchResults(res.data.data || [])
      } finally {
        setIsLoading(false)
        setOpenScan(false)
      }
    }

  // ------------------ หนังสือมาใหม่ ------------------
  const getStockList = async () => {
    try {
      const res = await ApiService.getStockNew()
      setStockList(res.data.data || [])
    } catch (error) {
      console.log('error', error)
    }
  }

  React.useEffect(() => {
    getStockList()
  }, [])

  React.useEffect(() => {
    const updateCart = () => {
      const cart: CartItem[] = JSON.parse(
        localStorage.getItem(key.CART) || '[]',
      )

      setCartCount(cart.length)
    }

    updateCart()

    window.addEventListener('cartUpdated', updateCart)

    return () => {
      window.removeEventListener('cartUpdated', updateCart)
    }
  }, [])

  return (
    <Box>
      {/* Header */}
      <Box
        style={{
          backgroundColor: '#3e8bf7',
          height: 95,
          borderRadius: '0px 0px 20px 20px',
        }}
      />

      <Box
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          margin: '-80px 0px 10px 20px',
          color: '#fff',
          gap: 10,
        }}
      >
        <LocalMallRounded />

        <Typography fontSize={24} align="left">
          My List
        </Typography>
        
      </Box>
      <Typography style={{marginLeft:20}} color='#fff'>เลือกหนังสือเพื่อสร้าง My List</Typography>

      {cartCount > 0 && (
        <Box
          sx={{
            '& > :not(style)': {
              m: 1,
              bottom: 190,
              position: 'fixed',
              right: 10,
              zIndex: 1000,
            },
          }}
        >
          <Tooltip placement="left" title="New List">
            <Fab
              color="primary"
              aria-label="add"
              onClick={() => router.push('/cart')}
              style={{ backgroundColor: '#1677ff' }}
            >
              <Badge badgeContent={cartCount} color="secondary">
                <LocalMallRounded />
              </Badge>
            </Fab>
          </Tooltip>
        </Box>
      )}

      <Box
        sx={{
          '& > :not(style)': {
            m: 1,
            bottom: 120,
            position: 'fixed',
            right: 10,
            zIndex: 1000,
          },
        }}
      >
        <Tooltip placement="left" title="My List">
          <Fab
            color="primary"
            aria-label="add"
            onClick={() => router.push('/pre_station_list')}
            style={{ backgroundColor: '#1677ff' }}
          >
            <AssignmentRounded />
          </Fab>
        </Tooltip>
      </Box>

      <Box className="box-search-product2">
        <Box
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div
            className="select-type"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              width: '100%',
            }}
          >
            <InputBase
              placeholder={'ค้นหาหนังสือร้าน Yaakz shop'}
              value={keyword}
              onChange={handleSearchInput}
              onFocus={() => setIsFocus(true)}
              onBlur={() => {
                if (!keyword) setIsFocus(false)
              }}
              style={{ flex: 1 }}
            />

            {keyword.length > 0 && (
              <ClearOutlined
                onClick={handleClear}
                style={{ cursor: 'pointer' }}
              />
            )}

            {keyword.length > 0 && (
              <IconButton
                onClick={onClickSearch}
                disabled={keyword === '' || isLoading}
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  backgroundColor: '#1677ff',
                  color: '#fff',

                  transition: 'all 0.2s ease',

                  '&:hover': {
                    backgroundColor: '#125fd1',
                    transform: 'scale(1.05)',
                  },

                  '&:active': {
                    transform: 'scale(0.95)',
                  },

                  '&.Mui-disabled': {
                    backgroundColor: '#e0e0e0',
                    color: '#999',
                  },
                }}
              >
                {isLoading ? <span /> : <SearchOutlined />}
              </IconButton>
            )}

            <IconButton
              style={{
                width: 40,
                height: 30,
                padding: 0,
                backgroundColor: '#d6e6fd',
                borderRadius: 20,
              }}
              onClick={() => setOpenScan(true)}
            >
              <svg width="32" height="28" viewBox="0 0 24 24" fill="#1677ff">
                <path d="M3 5v4h2V7h2V5H3Zm14 0v2h2v2h2V5h-4ZM3 15v4h4v-2H5v-2H3Zm16 0v2h-2v2h4v-4h-2ZM8 7h2v10H8V7Zm3 0h1v10h-1V7Zm2 0h2v10h-2V7Zm3 0h1v10h-1V7Z" />
              </svg>
            </IconButton>
          </div>
        </Box>
      </Box>

      {/* 🔎 Search Results */}
   

      {/* 📚 หนังสือมาใหม่ */}



      <BookStstionDialogs
        selectedProduct={selectedProduct}
        openDetail={openDetail}
        onCloseDetail={() => setOpenDetail(false)}
      />

       <Dialog open={openScan} onClose={() => setOpenScan(false)}>
        <DialogTitle className="justify-content between">
          สแกน Barcode ของหนังสือ
          <DialogActions sx={{ p: 0 }}>
            <IconButton onClick={() => setOpenScan(false)}>
              <Close />
            </IconButton>
          </DialogActions>
        </DialogTitle>
        <DialogContent>
          <Html5QrcodePlugin
            fps={25}
            qrbox={{ width: 300, height: 100 }}
            disableFlip
            qrCodeSuccessCallback={onNewScanResult}
          />
        </DialogContent>
      </Dialog>

    </Box>
  )
}
