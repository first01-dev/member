'use client'
import Html5QrcodePlugin from '@/components/BarcodeScanner'
import ImageSlider from '@/components/BookGrid/page'
import { ProductItem } from '@/models/type'
import ApiService from '@/services/ApiService'
import { formatBalance, getImageUrlFromDynamic } from '@/services/StringUtils'
import {
  ClearOutlined,
  MenuBookRounded,
  SearchOutlined,
} from '@mui/icons-material'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputBase,
  Menu,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material'
import dayjs from 'dayjs'
import Head from 'next/head'
import React from 'react'
import toast from 'react-hot-toast'

import { useRouter } from 'next/navigation'

import BookDialogs from '@/components/dialogs/BookDialog/page'
import BookCard from '@/components/BookCard/page'

import BookGrid from '@/components/BookGrid/page'
import DeleteBookDialog from '@/components/dialogs/DeleteBookDialog/page'
import MoveBookDialog from '@/components/dialogs/MoveBookDialog/page'
import BookDialog from '@/components/dialogs/BookDialog/page'
import EditBookDialog from '@/components/dialogs/EditBookDialog/page'
import FormAddNewBook from '@/components/dialogs/FormAddNewBook/page'
export default function Stock() {
  // ================= UI CONTROL =================
  const [open, setOpen] = React.useState(false)
  const [openScan, setOpenScan] = React.useState(false)
  const [openAddBook, setOpenAddBook] = React.useState(false)
  const [openAddShelf, setOpenAddShelf] = React.useState(false)
  const [openDeleteShelf, setOpenDeleteShelf] = React.useState(false)
  const [openEditShelf, setOpenEditShelf] = React.useState(false)
  const [isProductDialogOpen, setIsProductDialogOpen] = React.useState(false)
  const [isFoundData, setIsFoundData] = React.useState(false)

  // ================= LOADING STATES =================
  const [isLoading, setIsLoading] = React.useState(false)
  const [loadingBooks, setLoadingBooks] = React.useState(false)
  const [uploading] = React.useState(false)
  const [openDetail, setOpenDetail] = React.useState(false)
  const [openMove, setOpenMove] = React.useState(false)
  const [openDelete, setOpenDelete] = React.useState(false)
  const [openEdit, setOpenEdit] = React.useState(false)
  const [isFocus, setIsFocus] = React.useState(false)

  // ================= SEARCH =================
  const [keyword, setKeyword] = React.useState('')

  const [hasSearched, setHasSearched] = React.useState(false)
  const [searchResults, setSearchResults] = React.useState<ProductItem[]>([])

  // ================= SELECTED DATA =================
  const [selectedProduct, setSelectedProduct] =
    React.useState<ProductItem | null>(null)

  // ================= SHELF DATA =================
  const [shelves, setShelves] = React.useState<any[]>([])
  const [booksByShelf, setBooksByShelf] = React.useState<Record<number, any[]>>(
    {},
  )
  const [bookFavorites, setBookFavorites] = React.useState<ProductItem[]>([])
  const [targetShelfId, setTargetShelfId] = React.useState<string>('')
  const [newShelfName, setNewShelfName] = React.useState<string>('')
  const [bookToDelete, setBookToDelete] = React.useState<ProductItem | null>(
    null,
  )

  // ================= FORM DATA =================
  const [formData, setFormData] = React.useState<ProductItem>({
    shelf_id: '',
    name: '',
    picture: '',
    isbn: '',
    detail: '',
    price: '',
    publisher: '',
    writer: '',
  })

  const [formDataAddShlef, setFormDataAddShlef] = React.useState({
    name: '',
    picture: '',
    detail: null,
  })

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const [selectedShelf, setSelectedShelf] = React.useState<string | null>(null)

  const [menuState, setMenuState] = React.useState<{
    anchorEl: null | HTMLElement
    shelfId: string | null
  }>({
    anchorEl: null,
    shelfId: null,
  })

  const handleOpenMenu = (
    event: React.MouseEvent<HTMLElement>,
    shelfId: string,
  ) => {
    
    setMenuState({
      anchorEl: event.currentTarget,
      shelfId,
    })
  }

  const handleCloseMenu = () => {
    setMenuState({
      anchorEl: null,
      shelfId: null,
    })
  }

  const handleDeleteShelf = async () => {
    if (!selectedShelf) return

    setOpenDeleteShelf(false)

    try {
      const payload = { favdelete: 0 }
      await ApiService.deleteShelf(selectedShelf, payload)

      toast.success('ลบชั้นหนังสือสำเร็จ')
      await reloadAllData()
      handleCloseMenu()
    } catch (error) {
      console.error(error)
    }
  }

  const handleEditShelf = async () => {
    if (!selectedShelf) return

    const payload = {
      name: newShelfName,
      picture: formDataAddShlef.picture || '',
      detail: formDataAddShlef.detail || '',
    }
    const res = await ApiService.editShelf(selectedShelf, payload)

    if (res.data.status === 'success') {
      toast.success('แก้ไขชั้นหนังสือสำเร็จ')
      setNewShelfName('')
      await reloadAllData()
      handleCloseMenu()
      setOpenEditShelf(false)
    } else {
      setOpenEditShelf(false)
      toast.error(res.data.message)
    }
  }

  const openProductDialog = (product: ProductItem) => {
    setSelectedProduct(product)
    setOpenDetail(true)

    setHasSearched(true)
  }

  const closeProductDialog = () => {
    setIsProductDialogOpen(false)
    setSelectedProduct(null)
  }

  const handleChange = async (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target as HTMLInputElement

    // 💰 price ให้เป็นตัวเลขเท่านั้น
    if (name === 'price' && !/^\d*$/.test(value)) return

    // 📚 isbn ให้เป็นตัวเลขเท่านั้น และไม่เกิน 13 หลัก
    if (name === 'isbn') {
      if (!/^\d*$/.test(value)) return
      if (value.length > 13) return
    }

    const updatedForm = {
      ...formData,
      [name]: value,
    }

    setFormData(updatedForm)

    // ✅ isbn ครบ 13 หลักแล้วค่อยยิง API
    if (name === 'isbn' && value.length === 13) {
      await onNewScanResult(value)
    }
  }

  const handleChangeAddShelf = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = event.target

    // ✅ อัปเดตค่าปกติทุกช่อง
    setFormDataAddShlef((prev) => ({ ...prev, [name]: value }))
  }

  const handleEdit = (item: ProductItem) => {
    setSelectedProduct(item)
    setFormData(item)

    setOpenDetail(false)
    setOpenEdit(true)
  }

  const handleDelete = (item: ProductItem) => {
    setSelectedProduct(item)
    setBookToDelete(item)

    setOpenDetail(false)
    setOpenDelete(true)
  }

  const handleMove = (item: ProductItem) => {
    setSelectedProduct(item)
    setTargetShelfId('')

    setOpenDetail(false)
    setOpenMove(true)
  }

  const handleSearchInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(event.target.value)
  }

  const handleClear = () => {
    setKeyword('')
    setSearchResults([])
  }

  const handleClose = () => {
    setFormData({
      shelf_id: '',
      name: '',
      picture: '',
      isbn: '',
      detail: '',
      price: '',
      publisher: '',
      writer: '',
    })
    setFormDataAddShlef({
      name: '',
      picture: '',
      detail: null,
    })
    setOpenAddShelf(false)
    setOpenAddBook(false)
    setOpenScan(false)
  }

  const onClickSearch = async () => {
    if (!keyword.trim()) {
      toast.error('กรุณากรอกคำค้นหา')
      return
    }
    setIsLoading(true)
    try {
      const res = await ApiService.getBookFavorites(keyword)
      const results = res.data.data
      setSearchResults(results)
    } catch (error) {
    } finally {
      setIsLoading(false)
    }
  }

  const onNewScanResult = async (decodedText: string) => {
    setIsLoading(true)

    try {
      const res = await ApiService.getProducts(decodedText, 'barcode')
      const book = res?.data?.data?.[0]

      if (book) {
        setFormData((prev: any) => ({
          ...prev,
          isbn: decodedText,
          name: book.name || '',
          publisher: book.publisher || '',
          writer: book.writer || '',
          price: book.price || '',
          detail: book.detail || '',
          bod: book.release_on || null,
        }))

        return true // ✅ บอกว่า “เจอ”
      } else {
        setFormData((prev: any) => ({
          ...prev,
          isbn: decodedText,
          name: '',
          publisher: '',
          writer: '',
          price: '',
          detail: '',
          bod: null,
        }))
        return false
      }
    } catch (err) {
      toast.error('เกิดข้อผิดพลาด')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const getBookShelf = async () => {
    try {
      const res = await ApiService.getBookShelf()
      setShelves(res.data.data)
    } catch (error) {
      console.log('error', error)
    }
  }

  const getBooksInShelf = async (shelf_id: string) => {
    const res = await ApiService.getBookShelfInfo(shelf_id)
    return res.data.data || []
  }

  const getBookFavorites = async () => {
    try {
      const res = await ApiService.getBookFavorites()

      const noShelf = res.data.data
        .filter((item: any) => item.shelf_id === null)
        .sort(
          (a: any, b: any) =>
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
        )

      setBookFavorites(noShelf)
      return noShelf
    } catch (error) {
      console.log('error', error)
      return []
    }
  }

  const onAddShelf = async () => {
    try {
      const payload = {
        name: formDataAddShlef.name || null,
        picture: formDataAddShlef.picture || null,
        detail: formDataAddShlef.detail || null,
      }
      const res = await ApiService.addBookShelf(payload)
      if (res.data.status === 'success') {
        setOpenAddShelf(false)
        setFormDataAddShlef({ name: '', picture: '', detail: null })
        getBookShelf()
        toast.success(res.data.message)
      } else {
        toast.error(res.data.message)
      }

      setOpenAddShelf(false)
      setFormDataAddShlef({ name: '', picture: '', detail: null })
      getBookShelf()
    } catch (error) {
      console.log('error', error)
      toast.error('เพิ่มชั้นหนังสือไม่สำเร็จ')
    }
  }

  const reloadAllData = async () => {
    await getBookShelf()
    await getBookFavorites()

    // กัน shelves เป็น undefined
    const results = await Promise.all(
      (shelves || []).map(async (shelf) => {
        const books = await getBooksInShelf(shelf._id)

        return {
          shelfId: shelf._id,
          books: books || [],
        }
      }),
    )

    const booksMap: Record<string, any[]> = {}

    results.forEach((item) => {
      booksMap[item.shelfId] = item.books
    })

    setBooksByShelf(booksMap)
  }

  const confirmDeleteBook = async () => {
    if (!bookToDelete) return

    try {
      let res

      if (!bookToDelete.shelf_id) {
        // ⭐ Favorite → ไม่ต้องมี payload
        res = await ApiService.deleteBook(bookToDelete._id)
      } else {
        // ⭐ อยู่ใน Shelf → ต้องส่ง payload
        const payload = { favdelete: 0 }
        res = await ApiService.deleteBook(bookToDelete._id, payload)
      }

      if (res.data.status === 'success') {
        toast.success(`ลบ "${bookToDelete.name}" เรียบร้อย`)
        await reloadAllData()
        setOpenDelete(false)
        setOpenDelete(false)
        handleCloseMenu()
      } else {
        toast.error(res.data.message)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const onSaveBookEdit = async () => {
    if (!formData?._id) return

    try {
      const res = await ApiService.updateBookToShelf(formData._id, formData)
      if (res.data.status === 'success') {
        toast.success(res.data.message)

        await reloadAllData()
        setOpenDelete(false)
        setOpenEdit(false)
      } else {
        toast.error(res.data.message)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const onSaveAddBook = async () => {
    if (!formData) return

    try {
      const res = await ApiService.addBookToFavorites(formData)
      if (res.data.status === 'success') {
        toast.success(res.data.message)
        await reloadAllData()
        setOpenAddBook(false)
      } else {
        toast.error(res.data.message)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const onMoveBook = async () => {
    if (!selectedProduct) return

    try {
      const payload = {
        shelf_id: targetShelfId || null,
        name: selectedProduct?.name || null,
        picture: selectedProduct?.picture || null,
        isbn: selectedProduct?.isbn || null,
        detail: selectedProduct?.detail || null,
        price: selectedProduct?.price ? Number(selectedProduct?.price) : null,
        publisher: selectedProduct?.publisher || null,
        writer: selectedProduct?.writer || null,
      }
      const res = await ApiService.updateBookToShelf(
        selectedProduct._id,
        payload,
      )

      if (res.data.status === 'success') {
        toast.success(res.data.message)
        setOpenMove(false)
        setOpenDetail(false)
        await reloadAllData()
      } else {
        toast.error(res.data.message)
      }
    } catch (err) {
      console.error(err)
    }
  }

  React.useEffect(() => {
    getBookShelf()
    getBookFavorites()
  }, [])

  React.useEffect(() => {
    const loadAllBooks = async () => {
      if (!shelves || shelves.length === 0) {
        setBooksByShelf({})
        return
      }
      try {
        setLoadingBooks(true)
        const results = await Promise.all(
          shelves.map(async (shelf) => {
            const books = await getBooksInShelf(shelf._id)
            return { shelfId: shelf._id, books: books || [] }
          }),
        )
        const booksMap: Record<string, any[]> = {}
        results.forEach((item) => {
          booksMap[item.shelfId] = item.books
        })
        setBooksByShelf(booksMap)
      } catch (error) {
        setBooksByShelf({})
      } finally {
        setLoadingBooks(false)
      }
    }
    loadAllBooks()
  }, [shelves])

  return (
    <>
      <Head>
        <title>Yaakz Member</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />{' '}
      </Head>{' '}
      <div>
        <div
          style={{
            backgroundColor: '#3e8bf7',
            height: 160,
            borderRadius: '0px 0px 20px 20px',
          }}
        />

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            margin: '-150px 0px 20px 20px',
            color: '#fff',
            gap: 10,
          }}
        >
          <MenuBookRounded />
          <Typography fontSize={24} align="left">
            Bookshelf
          </Typography>
        </div>
        <Typography color="#fff" style={{ marginLeft: 20 }}>
          เมื่อทำการสั่งซื้อสำเร็จ ข้อมูลหนังสือจะอัพเดทภายใน 1-2 ชั่วโมง
        </Typography>

        <div className="box-search-product2" style={{ marginBottom: 30 }}>
          <div
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
                placeholder={'ค้นหาหนังสือของคุณ'}
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
                  {isLoading ? <span className="loader" /> : <SearchOutlined />}
                </IconButton>
              )}
            </div>
          </div>
        </div>

        {/* 🔎 Search Results */}
        {searchResults.length > 0 && (
          <BookGrid
            title={`ผลการค้นหา "${keyword}"`}
            items={searchResults}
            onBookClick={openProductDialog}
            onMove={handleMove}
            emptyText={`คำค้น "${keyword}" ไม่พบข้อมูล`}
          />
        )}
      </div>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          gap: 3,

          px: 2,
        }}
      >
        <Button
          onClick={() => setOpenAddBook(true)}
          sx={{
            position: 'relative',
            overflow: 'hidden',

            borderRadius: '18px',
            px: 3,
            py: 3,

            textTransform: 'none',
            fontWeight: 700,
            fontSize: 16,
            color: '#fff',

            background:
              'linear-gradient(135deg, #67d5ff 0%, #4db8ff 45%, #3b82f6 100%)',

            boxShadow: '0 10px 22px rgba(59,130,246,0.28)',

            transition: 'all .25s ease',

            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 14px 28px rgba(59,130,246,0.38)',
            },

            // ลายคลื่น
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 0,
              background: `
        radial-gradient(circle at 0% 100%, rgba(255,255,255,0.14) 0%, transparent 45%),
        radial-gradient(circle at 100% 0%, rgba(255,255,255,0.16) 0%, transparent 35%),
        linear-gradient(
          165deg,
          transparent 15%,
          rgba(255,255,255,0.10) 45%,
          transparent 70%
        )
      `,
            },

            // รูปชั้นหนังสือ
            '&::after': {
              content: '""',
              position: 'absolute',
              left: '-8px',
              bottom: '-6px',

              width: '90px',
              height: '90px',

              backgroundImage: "url('/images/book_14180501.png')",
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'contain',
              backgroundPosition: 'center',

              opacity: 0.22,
              transform: 'rotate(8deg)',
            },
          }}
        >
          <span
            style={{
              position: 'absolute',
              top: 12,
              left: 90,
              color: 'rgba(255,255,255,0.75)',
              fontSize: 10,
            }}
          >
            ✦
          </span>

          <span
            style={{
              position: 'absolute',
              top: 28,
              right: 10,
              color: 'rgba(255,255,255,0.7)',
              fontSize: 10,
            }}
          >
            ✦
          </span>

          <span
            style={{
              position: 'relative',
              zIndex: 2,

              color: '#fff',
              fontWeight: 700,

              textShadow: `
      -1px -1px 0 rgb(0, 0, 0),
       1px -1px 0 rgba(0,0,0,0.15),
      -1px  1px 0 rgba(0,0,0,0.15),
       1px  1px 0 rgba(0,0,0,0.15)
    `,
            }}
          >
            เพิ่มหนังสือใหม่
          </span>
        </Button>

        <Button
          onClick={() => setOpenAddShelf(true)}
          sx={{
            position: 'relative',
            overflow: 'hidden',

            borderRadius: '18px',
            px: 3,
            py: 3,

            textTransform: 'none',
            fontWeight: 700,
            fontSize: 16,
            color: '#fff',

            background:
              'linear-gradient(135deg, #67d5ff 0%, #4db8ff 45%, #3b82f6 100%)',

            boxShadow: '0 10px 22px rgba(59,130,246,0.28)',

            transition: 'all .25s ease',

            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 14px 28px rgba(59,130,246,0.38)',
            },

            // ลายคลื่น
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 0,
              background: `
        radial-gradient(circle at 0% 100%, rgba(255,255,255,0.14) 0%, transparent 45%),
        radial-gradient(circle at 100% 0%, rgba(255,255,255,0.16) 0%, transparent 35%),
        linear-gradient(
          165deg,
          transparent 15%,
          rgba(255,255,255,0.10) 45%,
          transparent 70%
        )
      `,
            },

            // รูปชั้นหนังสือ
            '&::after': {
              content: '""',
              position: 'absolute',
              right: '-8px',

              width: '80px',
              height: '80px',

              backgroundImage: "url('/images/bookshelf_8889096.png')",
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'contain',
              backgroundPosition: 'center',

              opacity: 0.22,
              transform: 'rotate(-8deg)',
            },
          }}
        >
          <span
            style={{
              position: 'absolute',
              top: 5,
              left: 110,
              color: 'rgba(255,255,255,0.75)',
              fontSize: 15,
            }}
          >
            ✦
          </span>

          <span
            style={{
              position: 'absolute',
              top: 50,
              left: 20,
              color: 'rgba(255,255,255,0.7)',
              fontSize: 10,
            }}
          >
            ✦
          </span>

          <span
            style={{
              position: 'relative',
              zIndex: 2,

              color: '#fff',
              fontWeight: 700,

              textShadow: `
      -1px -1px 0 rgb(0, 0, 0),
       1px -1px 0 rgba(0,0,0,0.15),
      -1px  1px 0 rgba(0,0,0,0.15),
       1px  1px 0 rgba(0,0,0,0.15)
    `,
            }}
          >
            สร้างชั้นหนังสือ
          </span>
        </Button>
      </Box>
      <div style={{ marginTop: 20 }}>
        {bookFavorites.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <BookGrid
              title="กองดอง"
              items={bookFavorites}
              onBookClick={openProductDialog}
              onMove={handleMove}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </Box>
        )}
      </div>
      {(shelves || []).map((shelf) => {
        const shelfBooks = booksByShelf[shelf._id] || []

        return (
          <BookGrid
            key={shelf._id}
            shelfId={shelf._id}
            title={shelf.name}
            items={shelfBooks}
            onBookClick={openProductDialog}
            onMove={handleMove}
            onEdit={handleEdit}
            onDelete={handleDelete}
            setSelectedShelf={setSelectedShelf}
            setOpenDeleteShelf={setOpenDeleteShelf}
            setOpenEditShelf={setOpenEditShelf}
          />
        )
      })}
      {/* =====เพิ่มชั้นหนังสือ=====*/}
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
        open={openAddShelf || false}
        onClose={() => setOpenAddShelf(false)}
      >
        <DialogTitle>เพิ่มชั้นหนังสือ</DialogTitle>
        <Typography/>
        <DialogContent>
          <TextField
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '20px',
              },
            }}
   
            value={formDataAddShlef.name || ''}
            onChange={handleChangeAddShelf}
            label="ชื่อชั้นหนังสือ"
            name="name"
            size="small"
            fullWidth
          />
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => setOpenAddShelf(false)}
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
            disabled={!formDataAddShlef.name}
            onClick={onAddShelf}
            sx={{
              borderRadius: 20,
              textTransform: 'none',
            }}
          >
            บันทึก
          </Button>
        </DialogActions>
        
      </Dialog>
      {/* =====ยืนยันการลบ =====*/}
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
        open={openDeleteShelf || false}
        onClose={() => setOpenDeleteShelf(false)}
      >
        <DialogTitle>ลบชั้นหนังสือ</DialogTitle>
        <DialogContent>
          <Typography>คุณต้องการลบชั้นหนังสือออก</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => setOpenDeleteShelf(false)}
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
            onClick={handleDeleteShelf}
            sx={{
              borderRadius: 20,
              textTransform: 'none',
            }}
          >
            ลบ
          </Button>
        </DialogActions>
      </Dialog>
      {/* =====ยืนยันการแก้ไข =====*/}
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
        open={openEditShelf || false}
        onClose={() => setOpenEditShelf(false)}
      >
        <DialogTitle>แก้ไขชื่อชั้นหนังสือ</DialogTitle>
         <Typography/>
        <DialogContent>
          <TextField
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '20px',
              },
            }}
            label="ชื่อชั้นหนังสือ"
       
            value={newShelfName}
            onChange={(e) => setNewShelfName(e.target.value)}
            size="small"
            fullWidth
          />
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => setOpenEditShelf(false)}
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
            onClick={handleEditShelf}
            sx={{
              borderRadius: 20,
              textTransform: 'none',
            }}
          >
            บันทึก
          </Button>
        </DialogActions>
      </Dialog>
      {/* =====================================================
    BOOK DETAIL
      ===================================================== */}
      <BookDialog
        open={openDetail}
        item={selectedProduct}
        onClose={() => setOpenDetail(false)}
        onMove={handleMove}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      {/* =====================================================
    MOVE BOOK
      ===================================================== */}
      <MoveBookDialog
        open={openMove}
        item={selectedProduct}
        shelfList={shelves}
        targetShelfId={targetShelfId}
        onChangeShelf={setTargetShelfId}
        onClose={() => setOpenMove(false)}
        onConfirm={onMoveBook}
      />
      {/* =====================================================
    EDIT BOOK
      ===================================================== */}
      <EditBookDialog
        open={openEdit}
        formData={formData}
        onChange={handleChange}
        onClose={() => setOpenEdit(false)}
        onSave={onSaveBookEdit}
      />
      {/* =====================================================
    DELETE BOOK
      ===================================================== */}
      <DeleteBookDialog
        open={openDelete}
        item={bookToDelete}
        onClose={() => setOpenDelete(false)}
        onConfirm={confirmDeleteBook}
      />
      <FormAddNewBook
        openAdd={openAddBook}
        shelfList={shelves}
        onCloseAdd={handleClose}
        onSaveBook={onSaveAddBook}
        onSaveShelf={onAddShelf}
        formData={formData}
        handleChange={handleChange}
        onNewScanResult={onNewScanResult}
      />
    </>
  )
}
