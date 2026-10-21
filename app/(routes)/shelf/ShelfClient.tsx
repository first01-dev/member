'use client'

import React, { useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'
import { Navigation } from '@/services/Navigation'
import {
  ArrowBackIosNewRounded,
  ArrowForwardIos,
  GridViewRounded,
  HomeRounded,
  KeyboardArrowUp,
  LocalMallRounded,
  ViewListRounded,
} from '@mui/icons-material'

import {
  Badge,
  Box,
  Button,
  Card,
  CircularProgress,
  Fab,
  Fade,
  Grid,
  IconButton,
  Tooltip,
  Typography,
  useScrollTrigger,
} from '@mui/material'

import { CartItem, ProductItem } from '@/models/type'
import { key } from '@/models/constant'

import ApiService from '@/services/ApiService'

import BookGrid from '@/components/BookGrid/page'
import BookDialog from '@/components/dialogs/BookDialog/page'
import DeleteBookDialog from '@/components/dialogs/DeleteBookDialog/page'
import EditBookDialog from '@/components/dialogs/EditBookDialog/page'
import MoveBookDialog from '@/components/dialogs/MoveBookDialog/page'
import MoveFavoriteDialog from '@/components/dialogs/MoveFavoriteDialog/page'
import BookCard from '@/components/BookCard/page'
import axios from 'axios'
import { formatBalance } from '@/services/StringUtils'

interface Props {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  window?: () => Window
  children?: React.ReactElement<unknown>
}

function ScrollTop(props: Props) {
  const { children, window } = props
  // Note that you normally won't need to set the window ref as useScrollTrigger
  // will default to window.
  // This is only being set here because the demo is in an iframe.
  const trigger = useScrollTrigger({
    target: window ? window() : undefined,
    disableHysteresis: true,
    threshold: 100,
  })

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const anchor = (
      (event.target as HTMLDivElement).ownerDocument || document
    ).querySelector('#back-to-top-anchor')

    if (anchor) {
      anchor.scrollIntoView({
        block: 'center',
      })
    }
  }

  return (
    <Fade in={trigger}>
      <Box
        onClick={handleClick}
        role="presentation"
        sx={{ position: 'fixed', bottom: 100, right: 16 }}
      >
        {children}
      </Box>
    </Fade>
  )
}

export default function ShelfPage(props: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // =====================================================
  // PARAMS
  // =====================================================

  const shelf_id = searchParams.get('shelf_id')
  const shelf_name = searchParams.get('shelf_name')
  const from = searchParams.get('from')

  const isPreStation = from === '/pre_station/'
  const isNewBook = shelf_name === 'Yaakz Station'

  // =====================================================
  // DATA
  // =====================================================

  const [books, setBooks] = React.useState<ProductItem[]>([])

  const [selectedProduct, setSelectedProduct] =
    React.useState<ProductItem | null>(null)

  // =====================================================
  // DIALOG
  // =====================================================

  const [openDetail, setOpenDetail] = React.useState(false)

  const [openMove, setOpenMove] = React.useState(false)

  const [openMoveFav, setOpenMoveFav] = React.useState(false)

  const [openDelete, setOpenDelete] = React.useState(false)

  const [openEdit, setOpenEdit] = React.useState(false)

  // =====================================================
  // MOVE
  // =====================================================

  const [shelfList, setShelfList] = React.useState<any[]>([])

  const [targetShelfId, setTargetShelfId] = React.useState<string>('')

  // =====================================================
  // DELETE
  // =====================================================

  const [bookToDelete, setBookToDelete] = React.useState<ProductItem | null>(
    null,
  )

  const navigate = Navigation()
  // =====================================================
  // EDIT
  // =====================================================

  const [formData, setFormData] = React.useState<ProductItem>({
    _id: '',
    shelf_id: '',
    name: '',
    picture: '',
    isbn: '',
    detail: '',
    price: '',
    publisher: null,
    writer: '',
  })

  // =====================================================
  // CART
  // =====================================================

  const [cartCount, setCartCount] = React.useState(0)

  // =====================================================
  // PAGINATION
  // =====================================================

  const LIMIT = 25

  const [length, setLength] = React.useState(0)

  const [hasMore, setHasMore] = React.useState(true)

  const [loading, setLoading] = React.useState(false)

  const [onLoadMore, setOnLoadMore] = React.useState<(() => void) | undefined>(
    undefined,
  )

  // =====================================================
  // FETCH SHELF
  // =====================================================

  const getAllShelves = async () => {
    try {
      const res = await ApiService.getBookShelf()

      setShelfList(res.data.data || [])
    } catch (error) {
      console.error(error)
    }
  }

  // =====================================================
  // FETCH BOOKS
  // =====================================================

  const fetchBooks = async () => {
    try {
      setLoading(true)

      let bookList: ProductItem[] = []
      const name = shelf_name?.toLowerCase()

      if (shelf_name === 'หนังสือใหม่') {
        const res = await ApiService.getProductsPromotion('', 0, LIMIT)

        bookList = res?.data?.data || []

        setLength(LIMIT)
        setHasMore(bookList.length === LIMIT)
      } else if (shelf_name === 'Yaakz Station') {
        const res = await ApiService.getProductsPromotionList(0, LIMIT)

        bookList = res?.data?.data || []

        setLength(LIMIT)
        setHasMore(bookList.length === LIMIT)
      } else if (name === 'กองดอง') {
        const res = await ApiService.getBookFavorites()

        const data = res?.data?.data || []

        bookList = data.filter((item: ProductItem) => item.shelf_id === null)

        setHasMore(false)
      } else if (shelf_id) {
        const res = await ApiService.getBookShelfInfo(shelf_id)

        bookList = res?.data?.data || []

        setHasMore(false)
      }

      bookList.sort(
        (a: any, b: any) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
      )

      setBooks(bookList)
    } catch (error) {
      console.error(error)
      setBooks([])
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }

  // =====================================================
  // INIT
  // =====================================================

  React.useEffect(() => {
    // หนังสือใหม่เป็น public
    // ไม่ต้องเรียก API shelf ที่ต้องใช้ token
    if (isNewBook) {
      return
    }

    getAllShelves()
  }, [isNewBook])

  React.useEffect(() => {
    fetchBooks()
  }, [shelf_id, shelf_name])

  // =====================================================
  // DETAIL
  // =====================================================

  const handleOpenDetail = (product: ProductItem) => {
    setSelectedProduct(product)
    setOpenDetail(true)
  }

  // =====================================================
  // MOVE
  // =====================================================

  const handleOpenMove = (product: ProductItem) => {
    setSelectedProduct(product)
    setTargetShelfId('')

    // ถ้าเปิด Move จาก Detail
    // ปิด Detail ก่อน
    setOpenDetail(false)

    if (isNewBook) {
      setOpenMoveFav(true)
    } else {
      setOpenMove(true)
    }
  }

  // =====================================================
  // EDIT
  // =====================================================

  const handleOpenEdit = (product: ProductItem) => {
    setSelectedProduct(product)

    setFormData(product)

    setOpenDetail(false)

    setOpenEdit(true)
  }

  // =====================================================
  // DELETE
  // =====================================================

  const handleOpenDelete = (product: ProductItem) => {
    setSelectedProduct(product)

    setBookToDelete(product)

    setOpenDetail(false)

    setOpenDelete(true)
  }

  // =====================================================
  // DELETE BOOK
  // =====================================================

  const confirmDeleteBook = async () => {
    if (!bookToDelete) return

    try {
      let res

      // Favorite

      if (!bookToDelete.shelf_id) {
        res = await ApiService.deleteBook(bookToDelete._id)
      }

      // Normal Shelf
      else {
        const payload = {
          favdelete: 0,
        }

        res = await ApiService.deleteBook(bookToDelete._id, payload)
      }

      if (res.data.status === 'success') {
        toast.success(`ลบ "${bookToDelete.name}" เรียบร้อย`)

        setOpenDelete(false)

        await fetchBooks()

        return
      }

      toast.error(res.data.message)
    } catch (error) {
      console.error(error)
    }
  }

  // =====================================================
  // SAVE EDIT
  // =====================================================

  const onSaveBook = async () => {
    if (!formData?._id) {
      return
    }

    try {
      await ApiService.updateBookToShelf(formData._id, formData)

      toast.success('บันทึกข้อมูลเรียบร้อย')

      setOpenEdit(false)

      await fetchBooks()
    } catch (error) {
      console.error(error)
    }
  }

  // =====================================================
  // NEW BOOK -> FAVORITE
  // =====================================================

  const onMoveBookToFavorites = async () => {
    if (!selectedProduct) {
      return
    }

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
        toast.success(res.data.message)

        setOpenMoveFav(false)
        setOpenDetail(false)

        return
      }

      setOpenMoveFav(false)

      toast.error(res.data.message)
    } catch (error) {
      console.error(error)
    }
  }

  const loadingMoreRef = useRef(false)

  const loadMoreBooks = async () => {
    if (loadingMoreRef.current || loading || !hasMore) {
      return
    }

    // มี pagination แค่ 2 หน้านี้
    if (shelf_name !== 'หนังสือใหม่' && shelf_name !== 'Yaakz Station') {
      return
    }

    loadingMoreRef.current = true
    setLoading(true)

    try {
      let res

      if (shelf_name === 'หนังสือใหม่') {
        res = await ApiService.getProductsPromotion('', length, LIMIT)
      } else {
        res = await ApiService.getProductsPromotionList(length, LIMIT)
      }

      const newResults: ProductItem[] = Array.isArray(res.data)
        ? res.data
        : res.data?.data || []

      // กัน API ส่งรายการซ้ำมา
      setBooks((prev) => {
        const existingKeys = new Set(
          prev.map((item) => item._id || item.id || item.isbn || item.barcode),
        )

        const uniqueNewResults = newResults.filter((item) => {
          const itemKey = item._id || item.id || item.isbn || item.barcode

          return itemKey && !existingKeys.has(itemKey)
        })

        return [...prev, ...uniqueNewResults]
      })

      // 0 → 25 → 50 → 75
      setLength((prev) => prev + LIMIT)

      if (newResults.length < LIMIT) {
        setHasMore(false)
      }
    } catch (error) {
      console.error('loadMoreBooks error:', error)
    } finally {
      loadingMoreRef.current = false
      setLoading(false)
    }
  }

  const observerRef = useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    if (!hasMore || loading) return

    const currentRef = observerRef.current

    if (!currentRef) return

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0]

        if (target.isIntersecting) {
          // หยุดก่อน ป้องกันยิงซ้ำ
          observer.unobserve(target.target)

          loadMoreBooks()
        }
      },
      {
        threshold: 0.2,
      },
    )

    observer.observe(currentRef)

    return () => {
      observer.disconnect()
    }
  }, [hasMore, loading])

  // =====================================================
  // MOVE SHELF
  // =====================================================

  const onMoveBook = async () => {
    if (!selectedProduct) {
      return
    }

    try {
      await ApiService.updateBookToShelf(selectedProduct._id, {
        ...selectedProduct,

        shelf_id: targetShelfId || null,
      })

      toast.success('ย้ายหนังสือเรียบร้อย')

      setOpenMove(false)

      await fetchBooks()
    } catch (error) {
      console.error(error)
    }
  }

  // =====================================================
  // ADD TO CART
  // =====================================================

  const handleAddToCart = (product: ProductItem) => {
    try {
      const cart: CartItem[] = JSON.parse(
        localStorage.getItem(key.CART) || '[]',
      )

      const productId = Number(product.id)

      const existingIndex = cart.findIndex(
        (item: any) => Number(item.product_id) === productId,
      )

      // มีอยู่แล้ว
      // เพิ่ม quantity

      if (existingIndex !== -1) {
        cart[existingIndex] = {
          ...cart[existingIndex],

          quantity: Number(cart[existingIndex].quantity || 1) + 1,
        }
      }

      // ยังไม่มี
      else {
        cart.push({
          ...(product as any),

          product_id: productId,

          quantity: 1,
        })
      }

      localStorage.setItem(key.CART, JSON.stringify(cart))

      window.dispatchEvent(new Event('cartUpdated'))

      toast.success(`เพิ่ม "${product.name}" ลง List แล้ว`)

      setOpenDetail(false)
    } catch (error) {
      console.error(error)

      toast.error('ไม่สามารถเพิ่มลง List ได้')
    }
  }

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

  const moveAction = isPreStation ? undefined : handleOpenMove

  const editAction = isPreStation || isNewBook ? undefined : handleOpenEdit

  const deleteAction = isPreStation || isNewBook ? undefined : handleOpenDelete

  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid')

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <>
      {/* ================= HEADER ================= */}

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-start',
          p: 2,
          alignItems: 'center',
        }}
      >
        <Button
          startIcon={<ArrowBackIosNewRounded />}
          variant="text"
          href={
            from ||
            (shelf_name === 'หนังสือใหม่' || shelf_name === 'Yaakz Station'
              ? '/home'
              : '/book_shelf')
          }
        />

        <Typography fontWeight="bold" fontSize={20}>
          {shelf_name}
        </Typography>
      </Box>

      {/* ================= CART ================= */}

      {/* {cartCount > 0 && (
        <Box
          sx={{
            '& > :not(style)': {
              m: 1,
              bottom: 100,
              position: 'fixed',
              right: 20,
              zIndex: 1000,
            },
          }}
        >
          <Tooltip placement="left" title="New List">
            <Fab
              color="primary"
              aria-label="cart"
              onClick={() => router.push('/cart')}
              sx={{
                backgroundColor: '#1677ff',
              }}
            >
              <Badge badgeContent={cartCount} color="secondary">
                <LocalMallRounded />
              </Badge>
            </Fab>
          </Tooltip>
        </Box>
      )}  */}

      {/* ================= VIEW MODE ================= */}

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          px: 2,
          pt: 1,
        }}
      >
        <Box
          id="back-to-top-anchor"
          sx={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#f5f5f5',
            borderRadius: '20px',
            p: '3px',
          }}
        >
          {/* GRID */}
          <IconButton
            size="small"
            onClick={() => setViewMode('grid')}
            sx={{
              width: 34,
              height: 34,
              borderRadius: '17px',
              backgroundColor: viewMode === 'grid' ? '#fff' : 'transparent',
              color: viewMode === 'grid' ? 'primary.main' : 'text.secondary',
              boxShadow: viewMode === 'grid' ? 1 : 'none',

              '&:hover': {
                backgroundColor:
                  viewMode === 'grid' ? '#fff' : 'rgba(0,0,0,0.04)',
              },
            }}
          >
            <GridViewRounded fontSize="small" />
          </IconButton>

          {/* LIST */}
          <IconButton
            size="small"
            onClick={() => setViewMode('list')}
            sx={{
              width: 34,
              height: 34,
              borderRadius: '17px',
              backgroundColor: viewMode === 'list' ? '#fff' : 'transparent',
              color: viewMode === 'list' ? 'primary.main' : 'text.secondary',
              boxShadow: viewMode === 'list' ? 1 : 'none',

              '&:hover': {
                backgroundColor:
                  viewMode === 'list' ? '#fff' : 'rgba(0,0,0,0.04)',
              },
            }}
          >
            <ViewListRounded fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* ================= GRID VIEW ================= */}

      {viewMode === 'grid' && (
        <Grid container spacing={2} padding={2}>
          {books.map((item, index) => {
            const bookKey =
              item._id ||
              item.id ||
              item.isbn ||
              item.barcode ||
              `book-${index}`

            return (
              <Grid
                item
                xs={4}
                sm={4}
                md={3}
                lg={2}
                key={bookKey}
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                  minHeight: 150,
                }}
              >
                <BookCard
                  item={item}
                  onClick={handleOpenDetail}
                  onMove={moveAction}
                  onEdit={editAction}
                  onDelete={deleteAction}
                />
              </Grid>
            )
          })}
          {/* ปุ่มกลับหน้า Home */}
          <Grid
            item
            xs={4}
            sm={4}
            md={3}
            lg={2}
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start',
              minHeight: 150,
            }}
          >
            <Card
              onClick={() => navigate.Home()}
              sx={{
                width: 120,
                height: 180,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 1.5,
                borderRadius: '10px',
                backgroundColor: '#fff',
                cursor: 'pointer',
                transition: 'all 0.25s ease',

                '&:hover': {
                  boxShadow: '0 4px 12px rgba(22,119,255,0.15)',
                },

                '&:active': {
                  transform: 'scale(0.97)',
                },
              }}
            >
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  backgroundColor: '#eaf3ff',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  color: '#1677ff',
                }}
              >
                <HomeRounded sx={{ fontSize: 32 }} />
              </Box>

              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#333',
                  textAlign: 'center',
                }}
              >
                กลับไปหน้า Home
              </Typography>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* ================= LIST VIEW ================= */}

      {viewMode === 'list' && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            px: 1,
          }}
        >
          {books.map((item, index) => {
            const bookKey =
              item._id ||
              item.id ||
              item.isbn ||
              item.barcode ||
              `book-${index}`

            return (
              <Box
                key={bookKey}
                onClick={() => handleOpenDetail(item)}
                sx={{
                  width: '90%',
                  display: 'flex',
                  alignItems: 'center',
                  p: 1,
                  my: 0.5,
                  borderRadius: 2,
                  boxShadow: 1,
                  cursor: 'pointer',
                  backgroundColor: '#fff',

                  '&:hover': {
                    backgroundColor: '#fafafa',
                  },
                }}
              >
                <Typography>{index + 1}.</Typography>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                    minHeight: 45,
                  }}
                >
                  <Typography
                    fontSize={16}
                    sx={{
                      ml: 1,
                      width: '75%',
                    }}
                  >
                    {item.name}
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'right' }}>
                    <Typography
                      fontSize={16}
                      color="error"
                      sx={{
                       
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {formatBalance(item.price ?? '-')}&nbsp;
                    </Typography>
                    <Typography>บาท</Typography>
                  </Box>
                </Box>
              </Box>
            )
          })}
          {/* กลับไปหน้า Home - รายการสุดท้าย */}
          <Box
            onClick={() => navigate.Home()}
            sx={{
              width: '90%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 1,
              my: 0.5,
              mb: 5,
              minHeight: 45,
              borderRadius: 2,
              backgroundColor: '#f0f7ff',
              border: '1px solid #d6e8ff',
              cursor: 'pointer',
              transition: 'all 0.2s ease',

              '&:hover': {
                backgroundColor: '#e3f0ff',
                boxShadow: '0 3px 10px rgba(22,119,255,0.12)',
              },

              '&:active': {
                transform: 'scale(0.98)',
              },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                ml: 1,
              }}
            >
              <HomeRounded
                sx={{
                  fontSize: 22,
                  color: '#1677ff',
                }}
              />

              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#1677ff',
                }}
              >
                กลับไปหน้า Home
              </Typography>
            </Box>

            <ArrowForwardIos
              sx={{
                fontSize: 14,
                color: '#1677ff',
                mr: 1,
              }}
            />
          </Box>
        </Box>
      )}

      {/* ================= INFINITE SCROLL ================= */}

      {hasMore && (
        <Box
          ref={observerRef}
          sx={{
            width: '100%',
            height: 20,
          }}
        />
      )}

      {/* ================= LOADING ================= */}

      {loading && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            py: 2,
          }}
        >
          <CircularProgress size={24} />
        </Box>
      )}

      <ScrollTop {...props}>
        <Fab size="small" aria-label="scroll back to top">
          <KeyboardArrowUp />
        </Fab>
      </ScrollTop>

      {/* ================= BOOK DETAIL ================= */}

      <BookDialog
        open={openDetail}
        item={selectedProduct}
        onClose={() => setOpenDetail(false)}
        onAddToCart={isPreStation ? handleAddToCart : undefined}
        onMove={moveAction}
        onEdit={editAction}
        onDelete={deleteAction}
      />

      {/* ================= MOVE SHELF ================= */}

      <MoveBookDialog
        open={openMove}
        item={selectedProduct}
        shelfList={shelfList}
        targetShelfId={targetShelfId}
        onChangeShelf={setTargetShelfId}
        onClose={() => setOpenMove(false)}
        onConfirm={onMoveBook}
      />

      {/* ================= NEW BOOK -> FAVORITE ================= */}

      <MoveFavoriteDialog
        open={openMoveFav}
        item={selectedProduct}
        onClose={() => setOpenMoveFav(false)}
        onConfirm={onMoveBookToFavorites}
      />

      {/* ================= EDIT ================= */}

      <EditBookDialog
        open={openEdit}
        formData={formData}
        onChange={(e) => {
          setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
          }))
        }}
        onClose={() => setOpenEdit(false)}
        onSave={onSaveBook}
      />

      {/* ================= DELETE ================= */}

      <DeleteBookDialog
        open={openDelete}
        item={bookToDelete}
        onClose={() => setOpenDelete(false)}
        onConfirm={confirmDeleteBook}
      />
    </>
  )
}
