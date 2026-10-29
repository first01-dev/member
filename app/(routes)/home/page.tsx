'use client'

import React from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

import {
  AssignmentRounded,
  ClearOutlined,
  Close,
  CollectionsBookmarkOutlined,
  LocalMallRounded,
  SearchOutlined,
} from '@mui/icons-material'

import {
  Badge,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fab,
  IconButton,
  InputBase,
  Tooltip,
  Typography,
} from '@mui/material'

import ApiService from '@/services/ApiService'

import { CartItem, EditUser, ProductItem } from '@/models/type'

import { key } from '@/models/constant'

import {
  clearLocalStorage,
  getLocalStorage,
  setLocalStorage,
} from '@/services/StorageUtils'

import Html5QrcodePlugin from '@/components/BarcodeScanner'

import BookDialog from '@/components/dialogs/BookDialog/page'

import FormEditUserProps, {
  FormEditUserBody,
} from '@/components/dialogs/FormEditUser/page'
import BookGrid from '@/components/BookGrid/page'
import axios from 'axios'

export default function Home() {
  const router = useRouter()

  // =====================================================
  // PRODUCT
  // =====================================================

  const [selectedProduct, setSelectedProduct] =
    React.useState<ProductItem | null>(null)

  const [stockList, setStockList] = React.useState<ProductItem[]>([])

  const [searchResults, setSearchResults] = React.useState<ProductItem[]>([])

  // =====================================================
  // DIALOG
  // =====================================================

  const [openDetail, setOpenDetail] = React.useState(false)

  const [openMove, setOpenMove] = React.useState(false)

  const [openScan, setOpenScan] = React.useState(false)

  const [openFormEditUser, setOpenFormEditUser] = React.useState(false)

  // =====================================================
  // CUSTOMER
  // =====================================================

  const [userInfo, setUserInfo] = React.useState<FormEditUserBody | null>(null)

  const [isRegisterFlow, setIsRegisterFlow] = React.useState(false)

  // =====================================================
  // CART
  // =====================================================

  const [cartCount, setCartCount] = React.useState(0)

  // =====================================================
  // SEARCH
  // =====================================================

  const [keyword, setKeyword] = React.useState('')

  const [isLoading, setIsLoading] = React.useState(false)

  const [loading, setLoading] = React.useState(false)

  const [hasSearched, setHasSearched] = React.useState(false)

  const [isFocus, setIsFocus] = React.useState(false)



  // =====================================================
  // PAGINATION
  // =====================================================

  const LIMIT = 25

  const [length, setLength] = React.useState(0)

  const [hasMore, setHasMore] = React.useState(true)

  // =====================================================
  // PRODUCT DIALOG
  // =====================================================

  const openProductDialog = (product: ProductItem) => {
    setSelectedProduct(product)
    setOpenDetail(true)
    setHasSearched(true)
  }

  const handleCloseDetail = () => {
    setOpenDetail(false)
  }

  // =====================================================
  // MOVE FAVORITE
  // =====================================================

  const handleMove = (item: ProductItem) => {
    setSelectedProduct(item)

    // ปิด Detail ก่อน
    setOpenDetail(false)

    // เปิด Confirm Move
    setOpenMove(true)
  }

  const handleCloseMove = () => {
    setOpenMove(false)
  }

  const onMoveBook = async () => {
    if (!selectedProduct) return

    try {
      const payload = {
        shelf_id: null,

        name: selectedProduct.name || null,

        picture: selectedProduct.picture || null,

        isbn: selectedProduct.barcode || selectedProduct.isbn || null,

        detail: selectedProduct.detail || null,

        price: selectedProduct.price ? Number(selectedProduct.price) : null,

        publisher: selectedProduct.publisher || null,

        writer: selectedProduct.writer || null,
      }

      const res = await ApiService.addBookToFavorites(payload)

      if (res.data.status === 'success') {
        toast.success(res.data.message || 'เพิ่มเข้ากองดองเรียบร้อย')

        setOpenMove(false)
        setOpenDetail(false)

        return
      }

      toast.error(res.data.message || 'ไม่สามารถเพิ่มหนังสือได้')

      setOpenMove(false)
    } catch (error) {
      console.error(error)

      toast.error('เกิดข้อผิดพลาดในการเพิ่มหนังสือ')
    }
  }

  // =====================================================
  // SEARCH
  // =====================================================

  const handleSearchInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(event.target.value)
  }

  const handleClear = () => {
    setKeyword('')
    setSearchResults([])
    setHasSearched(false)
    setLength(0)
    setHasMore(true)
  }

  const onClickSearch = async () => {
    const searchKeyword = keyword.trim()

    if (!searchKeyword) {
      toast.error('กรุณากรอกคำค้นหา')
      return
    }

    setLoading(true)
    setHasSearched(true)

    const token = getLocalStorage(key.TOKEN)
  

    try {
      let res


        res = await ApiService.getProductsPromotion(searchKeyword, 0, LIMIT)
     
      const results: ProductItem[] = Array.isArray(res.data)
        ? res.data
        : res.data?.data || []

      setSearchResults(results)

      setLength(LIMIT)

      setHasMore(results.length === LIMIT)

      if (results.length === 0) {
        toast.error('ไม่พบสินค้าที่ค้นหา')
      }
    } catch (error) {
      console.error(error)

      toast.error('เกิดข้อผิดพลาดในการค้นหา')
    } finally {
      setLoading(false)
    }
  }

  // =====================================================
  // LOAD MORE
  // =====================================================

  const loadMoreBooks = async () => {
    if (loading || !hasMore || !keyword.trim()) {
      return
    }

    setLoading(true)

    const searchKeyword = keyword.trim()

    const token = getLocalStorage(key.TOKEN)

    const isLoggedIn = !!token

    try {
      let res

      if (isLoggedIn) {
        // =========================
        // LOGIN แล้ว
        // =========================

        const isBarcode = /^\d{13}$/.test(searchKeyword)

        const type = isBarcode ? 'barcode' : 'keywords'

        res = await ApiService.getProducts(searchKeyword, type, length, LIMIT)
      } else {
        // =========================
        // ยังไม่ได้ LOGIN
        // =========================

        res = await ApiService.getProductsPromotion(
          searchKeyword,
          length,
          LIMIT,
        )
      }

      const newResults: ProductItem[] = Array.isArray(res.data)
        ? res.data
        : res.data?.data || []

      setSearchResults((prev) => [...prev, ...newResults])

      setLength((prev) => prev + LIMIT)

      if (newResults.length < LIMIT) {
        setHasMore(false)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // =====================================================
  // BARCODE
  // =====================================================

  const onNewScanResult = async (decodedText: string) => {
    setKeyword(decodedText)

    setIsLoading(true)

    try {
      const res = await ApiService.getProducts(decodedText, 'barcode')

      const results: ProductItem[] = Array.isArray(res.data)
        ? res.data
        : res.data?.data || []

      setSearchResults(results)

      setHasSearched(true)

      setLength(LIMIT)

      setHasMore(results.length === LIMIT)
    } catch (error) {
      console.error(error)

      toast.error('เกิดข้อผิดพลาดในการค้นหา')
    } finally {
      setIsLoading(false)
      setOpenScan(false)
    }
  }

  // =====================================================
  // NEW BOOKS
  // =====================================================

  const getStockList = async () => {
    try {
      const res = await ApiService.getProductsPromotion()

      setStockList(res.data?.data || [])
    } catch (error) {
      console.error('getStockList error', error)
    }
  }

  // =====================================================
  // CUSTOMER
  // =====================================================

  const getCustomerList = async () => {
    const stored = getLocalStorage(key.CUSTOMER)

    if (!stored) {
      clearLocalStorage(key.TOKEN)
      clearLocalStorage(key.CUSTOMER)
      router.replace('/login/')
      return
    }

    try {
      const response = await ApiService.getCustomer(stored._id)

      // ไม่มี Token หรือไม่มี Response
      if (!response) {
        clearLocalStorage(key.TOKEN)
        clearLocalStorage(key.CUSTOMER)
        router.replace('/home/')
        return
      }

      const freshData = response.data.data

      const merged = {
        ...stored,
        ...freshData,
      }

      setLocalStorage(key.CUSTOMER, merged)
      setUserInfo(merged)
    } catch (error: any) {
      if (error.response?.status === 401) {
        clearLocalStorage(key.TOKEN)
        clearLocalStorage(key.CUSTOMER)
        router.replace('/home/')
        return
      }

      console.error('ไม่สามารถโหลดข้อมูลลูกค้าได้:', error)
    }
  }

  const onSaveEditUser = async (data: FormEditUserBody) => {
    setIsLoading(true)

    const customer = getLocalStorage(key.CUSTOMER)

    if (!customer?._id) {
      setIsLoading(false)
      return
    }

    if (!data.name) {
      toast.error('กรุณากรอกชื่อ')

      setIsLoading(false)

      return
    }

    if (!data.phone) {
      toast.error('กรุณากรอกเบอร์โทรศัพท์')

      setIsLoading(false)

      return
    }

    router.push('/profile/?openFormAddAddress=true')

    try {
      const payload: EditUser = {
        name: data.name,
        email: data.email,
        gender: data.gender,
        phone: data.phone,
        bod: data.bod,
        current: 1,
      }

      const res = await ApiService.updateCustomer(customer._id, payload)

      if (res.data.status === 'success') {
        toast.success(res.data.message)

        // await getCustomerList()

        // setOpenFormEditUser(false)

        // แก้ให้ไปหน้า profile
        router.push('/profile/')

        return
      }

      toast.error(res.data.message)
    } catch (error) {
      console.error(error)

      toast.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล')
    } finally {
      setIsLoading(false)
    }

  }

  // =====================================================
  // INIT
  // =====================================================

  React.useEffect(() => {
    getStockList()
    getCustomerList()
  }, [])

  React.useEffect(() => {
    const checkCustomer = async () => {
      const customer = getLocalStorage(key.CUSTOMER)

      if (!customer?._id) {
        clearLocalStorage(key.TOKEN)
        clearLocalStorage(key.CUSTOMER)
        router.replace('/home/')
        return
      }

      try {
        const res = await ApiService.getCustomer(customer._id)

        if (!res) {
          clearLocalStorage(key.TOKEN)
          clearLocalStorage(key.CUSTOMER)
          router.replace('/home/')
          return
        }

        const customerInfo = res.data.data

        const hasPhone = Boolean(String(customerInfo?.phone ?? '').trim())

        if (hasPhone) {
          setIsRegisterFlow(false)
          setOpenFormEditUser(false)
        } else {
          setOpenFormEditUser(true)
        }

        clearLocalStorage(key.IS_NEW_REGISTER)
      } catch (error: any) {
        if (error.response?.status === 401) {
          clearLocalStorage(key.TOKEN)
          clearLocalStorage(key.CUSTOMER)
          router.replace('/login/')
          return
        }

        console.error('Check customer error:', error)
      }
    }

    checkCustomer()
  }, [router])



  // =====================================================
  // CART COUNT
  // =====================================================

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

  // =====================================================
  // RENDER
  // =====================================================

  const token = getLocalStorage(key.TOKEN)
  const isLoggedIn = !!token

  return (
    <>
      <div>
        {/* ================= LOGO ================= */}

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mt: 2.5,
          }}
        >
          <Image
            src="/images/LOGO_YAAKZ_MEMBER-02.png"
            alt="Yaakz Member"
            width={200}
            height={110}
          />
        </Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Typography
            sx={{
              fontWeight: 'bold',
              color: '#175dbf',
              fontSize: 18,

              WebkitTextStroke: '2px #ffffff',

              paintOrder: 'stroke fill',
            }}
          >
            Membership Platforms
          </Typography>
        </Box>

        {/* ================= CART FAB ================= */}

        {/* {cartCount > 0 && (
          <Box
            sx={{
              '& > :not(style)':
                {
                  m: 1,

                  bottom: 190,

                  position:
                    'fixed',

                  right: 10,

                  zIndex: 1000,
                },
            }}
          >
            <Tooltip
              placement="left"
              title="New List"
            >
              <Fab
                color="primary"
                aria-label="cart"
                onClick={() =>
                  router.push(
                    '/cart',
                  )
                }
                sx={{
                  backgroundColor:
                    '#1677ff',
                }}
              >
                <Badge
                  badgeContent={
                    cartCount
                  }
                  color="secondary"
                >
                  <LocalMallRounded />
                </Badge>
              </Fab>
            </Tooltip>
          </Box>
        )} */}

        {/* ================= PRE STATION LIST ================= */}

        {/* <Box
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
          <Tooltip
            placement="left"
            title="My List"
          >
            <Fab
              color="primary"
              aria-label="my-list"
              onClick={() =>
                router.push(
                  '/pre_station_list',
                )
              }
              sx={{
                backgroundColor:
                  '#1677ff',
              }}
            >
              <AssignmentRounded />
            </Fab>
          </Tooltip>
        </Box> */}

        {/* ================= SEARCH ================= */}

        <div className="box-search-product2">
          <Box
            sx={{
              display: 'flex',

              justifyContent: 'space-between',

              alignItems: 'center',
            }}
          >
            <Box
              className="select-type"
              sx={{
                display: 'flex',

                alignItems: 'center',

                gap: 1,

                width: '100%',
              }}
            >
              <InputBase
              placeholder='ค้นหาหนังสือแนะนำ'
                value={keyword}
                onChange={handleSearchInput}
                onFocus={() => setIsFocus(true)}
                onBlur={() => {
                  if (!keyword) {
                    setIsFocus(false)
                  }
                }}
                sx={{
                  flex: 1,
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    onClickSearch()
                  }
                }}
              />

              {/* CLEAR */}

              {keyword.length > 0 && (
                <ClearOutlined
                  onClick={handleClear}
                  sx={{
                    cursor: 'pointer',
                  }}
                />
              )}

              {/* SEARCH BUTTON */}

              {keyword.length > 0 && (
                <IconButton
                  onClick={onClickSearch}
                  disabled={!keyword || isLoading}
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

              {/* BARCODE */}

              <IconButton
                sx={{
                  width: 40,
                  height: 30,

                  p: 0,

                  backgroundColor: '#d6e6fd',

                  borderRadius: 20,
                }}
                onClick={() => setOpenScan(true)}
              >
                <svg width="32" height="28" viewBox="0 0 24 24" fill="#1677ff">
                  <path d="M3 5v4h2V7h2V5H3Zm14 0v2h2v2h2V5h-4ZM3 15v4h4v-2H5v-2H3Zm16 0v2h-2v2h4v-4h-2ZM8 7h2v10H8V7Zm3 0h1v10h-1V7Zm2 0h2v10h-2V7Zm3 0h1v10h-1V7Z" />
                </svg>
              </IconButton>
            </Box>
          </Box>
        </div>

        {/* ================= SEARCH RESULT ================= */}

        {searchResults.length > 0  && (
          <BookGrid
            title=''
            items={searchResults}
            onBookClick={openProductDialog}
            onMove={handleMove}
            onLoadMore={loadMoreBooks}
            hasMore={hasMore}
            loading={loading}
            
            hideSeeMore
          />
        )}

        {/* ================= NEW BOOKS ================= */}


          <BookGrid
            title="Yaakz Station"
            items={stockList}
            onBookClick={openProductDialog}
            onMove={handleMove}
           
          />
  
      </div>

      {/* =====================================================
          BARCODE DIALOG
      ===================================================== */}

      <Dialog open={openScan} onClose={() => setOpenScan(false)}>
        <DialogTitle
          sx={{
            display: 'flex',

            justifyContent: 'space-between',

            alignItems: 'center',
          }}
        >
          สแกน Barcode ของหนังสือ
          <IconButton onClick={() => setOpenScan(false)}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Html5QrcodePlugin
            fps={25}
            qrbox={{
              width: 300,
              height: 100,
            }}
            disableFlip
            qrCodeSuccessCallback={onNewScanResult}
          />
        </DialogContent>
      </Dialog>

      {/* =====================================================
          BOOK DETAIL
      ===================================================== */}

      <BookDialog
        open={openDetail}
        item={selectedProduct}
        onClose={handleCloseDetail}
        onMove={handleMove}
      />

      {/* =====================================================
          MOVE TO FAVORITE
      ===================================================== */}

      <Dialog
        open={openMove}
        onClose={handleCloseMove}
        fullWidth
        maxWidth="xs"
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
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
          เพิ่มเข้ากองดอง
        </DialogTitle>

        <DialogContent>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',

              alignItems: 'center',

              textAlign: 'center',

              gap: 2,

              py: 2,
            }}
          >
            <CollectionsBookmarkOutlined
              color="primary"
              sx={{
                fontSize: 48,
              }}
            />

            <Typography>ต้องการเพิ่ม</Typography>

            <Typography fontWeight={600}>{selectedProduct?.name}</Typography>

            <Typography color="text.secondary" fontSize={14}>
              เข้ากองดองหรือไม่
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 3,
          }}
        >
          <Button
            fullWidth
            variant="outlined"
            onClick={handleCloseMove}
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
            onClick={onMoveBook}
            sx={{
              borderRadius: 20,
              textTransform: 'none',
            }}
          >
            ยืนยัน
          </Button>
        </DialogActions>
      </Dialog>

      {/* =====================================================
          EDIT USER
      ===================================================== */}

      <FormEditUserProps
        open={openFormEditUser}
        form={
          userInfo ?? {
            name: '',
            phone: '',
            email: '',
            bod: '',
            gender: '',
          }
        }
        onSubmit={onSaveEditUser}
        onClose={() => setOpenFormEditUser(false)}
      />
    </>
  )
}
