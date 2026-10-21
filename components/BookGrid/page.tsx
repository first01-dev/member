'use client'

import React, { useRef } from 'react'
import { ProductItem } from '@/models/type'
import BookCard from '@/componets/BookCard/page'

import {
  ArrowForwardIos,
  MenuBookRounded,
  MoreVertRounded,
} from '@mui/icons-material'

import {
  Box,
  Card,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material'

import { useRouter } from 'next/navigation'

interface BookGridProps {
  title: string
  items: ProductItem[]

  shelfId?: string

  onBookClick?: (item: ProductItem) => void
  onMove?: (item: ProductItem) => void
  onEdit?: (item: ProductItem) => void
  onDelete?: (item: ProductItem) => void
  onLoadMore?: () => void
  hasMore?: boolean
  loading?: boolean
 hideSeeMore?: boolean

  setSelectedShelf?: (shelfId: string | null) => void

  setOpenDeleteShelf?: (open: boolean) => void

  setOpenEditShelf?: (open: boolean) => void

  emptyText?: string
}

export default function BookGrid(props: BookGridProps) {
  const router = useRouter()

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

  const {
    title,
    items,
    shelfId,

    onBookClick,
    onMove,
    onEdit,
    onDelete,
    onLoadMore,
    hasMore = false,
    loading = false,
 hideSeeMore = false,
    emptyText = '',
  } = props

  // มี shelfId = เป็นชั้นหนังสือที่ user สร้าง
  // ไม่มี shelfId = เช่น หนังสือใหม่ / กองดอง
  const showMenu = Boolean(shelfId)

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation()
    setAnchorEl(event.currentTarget)
  }

  const handleCloseMenu = () => {
    setAnchorEl(null)
  }

  const observerRef = useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    if (!onLoadMore || !hasMore || loading) return

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0]

        if (target.isIntersecting) {
          onLoadMore()
        }
      },
      {
        threshold: 0.2,
      },
    )

    const currentRef = observerRef.current

    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [onLoadMore, hasMore, loading])

  return (
    <Box>
      <Box sx={{ width: '100%' }}>
        {/* ================= HEADER ================= */}

        <Box
          sx={{
            height: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
          }}
        >
          {/* ===== TITLE ===== */}

          <Box
            sx={{
              paddingLeft: '5%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 1,
            }}
          >
            {title === 'หนังสือใหม่' && <Typography>✨</Typography>}

            <Typography fontWeight="bold" fontSize={22}>
              {title}
            </Typography>

            {/* ===== SHELF MENU ===== */}

            {showMenu && (
              <>
                <IconButton size="small" onClick={handleOpenMenu}>
                  <MoreVertRounded />
                </IconButton>

                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleCloseMenu}
                >
                  <MenuItem
                    onClick={() => {
                      handleCloseMenu()
                      props.setSelectedShelf?.(props.shelfId || null)
                      props.setOpenDeleteShelf?.(true)
                    }}
                  >
                    ลบชั้นหนังสือ
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      handleCloseMenu()
                      props.setSelectedShelf?.(props.shelfId || null)
                      props.setOpenEditShelf?.(true)
                    }}
                  >
                    แก้ไขชื่อชั้นหนังสือ
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>
          {/* ================= MORE ================= */}

          { !hideSeeMore && items.length>0 && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: 1,
                px: 2.5,
              }}
            >
              <Typography
                sx={{
                  cursor: 'pointer',
                  color: '#3b3b3b',

                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
                fontSize={14}
                onClick={() => {
                  if (shelfId) {
                    router.push(
                      `/shelf?shelf_id=${shelfId}&shelf_name=${encodeURIComponent(
                        title,
                      )}`,
                    )
                  } else {
                    router.push(
                      `/shelf?shelf_name=${encodeURIComponent(title)}`,
                    )
                  }
                }}
              >
                ดูเพิ่มเติม
              </Typography>

              <ArrowForwardIos
                fontSize="small"
                sx={{
                  color: '#3b3b3b',
                  fontSize: 14,
                }}
              />
            </Box>
          )}
        </Box>
      </Box>
      {/* ================= BOOKS ================= */}

      {items.length === 0 ? (
        <Typography
          color="text.secondary"
          sx={{
            px: 3,
            py: 2,
          }}
        >
          {emptyText}
        </Typography>
      ) : (
        <Box>
          <Grid container spacing={2} padding={2}>
            {items.map((item, index) => {
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
                    onClick={onBookClick}
                    onMove={onMove}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                </Grid>
              )
            })}

           {!hideSeeMore && (
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
                onClick={() => {
                  if (shelfId) {
                    router.push(
                      `/shelf?shelf_id=${shelfId}&shelf_name=${encodeURIComponent(
                        title,
                      )}`,
                    )
                  } else {
                    router.push(
                      `/shelf?shelf_name=${encodeURIComponent(title)}`,
                    )
                  }
                }}
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
                {/* Icon หนังสือ */}
                <Box
                  sx={{
                    width: 55,
                    height: 55,
                    borderRadius: '50%',
                    backgroundColor: '#eaf3ff',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <MenuBookRounded
                    sx={{
                      fontSize: 30,
                      color: '#1677ff',
                    }}
                  />
                </Box>

                {/* ข้อความ */}
                <Box sx={{ textAlign: 'center' }}>
                  <Typography
                    sx={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#333',
                    }}
                  >
                    ดูเพิ่มเติม
                  </Typography>
                </Box>

                {/* ลูกศร */}
                <Box
                  className="arrow-icon"
                  sx={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    backgroundColor: '#1677ff',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    transition: 'transform 0.25s ease',
                  }}
                >
                  <ArrowForwardIos
                    sx={{
                      fontSize: 12,
                      color: '#fff',
                    }}
                  />
                </Box>
              </Card>
            </Grid>
          
            )}
            
</Grid>
          {/* trigger load more */}
          {hasMore && (
            <Grid item xs={12}>
              <Box
                ref={observerRef}
                sx={{
                  height: 60,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                {loading && (
                  <Typography variant="body2">กำลังโหลด...</Typography>
                )}
              </Box>
            </Grid>
          )}
        </Box>
      )}
    </Box>
  )
}
