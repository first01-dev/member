import { key } from '@/models/constant'
import { ProductItem } from '@/models/type'
import { getLocalStorage } from '@/services/StorageUtils'
import { formatBalance, getImageUrlFromDynamic } from '@/services/StringUtils'
import {
  CollectionsBookmarkOutlined,
  DeleteOutlineRounded,
  EditRounded,
  MoreVert,
} from '@mui/icons-material'
import { Box, SpeedDial, SpeedDialAction, Typography } from '@mui/material'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

interface BookCardProps {
  item: ProductItem

  onClick?: (item: ProductItem) => void
  onMove?: (item: ProductItem) => void
  onEdit?: (item: ProductItem) => void
  onDelete?: (item: ProductItem) => void
}

export default function BookCard({
  item,
  onClick,
  onMove,
  onEdit,
  onDelete,
}: BookCardProps) {
  const hasImage = !!item.picture

const token = getLocalStorage(key.TOKEN)
const pathname = usePathname()
const isLoggedIn = !!token

const isHomePage = pathname === '/home/' || pathname === '/' || pathname === '/shelf/'

const hasActions =
  isLoggedIn &&
  !isHomePage &&
  (!!onMove || !!onEdit || !!onDelete)

  return (
    <Box
      onClick={() => onClick?.(item)}
      sx={{
        width: 120,
        borderRadius: 1,
        cursor: 'pointer',
        position: 'relative',
       
      }}
    >
      {/* ================= ACTION ================= */}

      {hasActions&&(
        <SpeedDial
          ariaLabel="book actions"
          direction="down"
          icon={<MoreVert />}
          onClick={(e) => e.stopPropagation()}
          FabProps={{
            size: 'small',
          }}
          sx={{
            position: 'absolute',
            top: 15,
            right: 0,
            zIndex: 2,

            '& .MuiSpeedDial-actions': {
              gap: 1,
            },

            '& .MuiSpeedDialAction-fab': {
              margin: '0px 5px',
            },

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
          }}
        >
          {onMove && (
            <SpeedDialAction
              icon={
                <CollectionsBookmarkOutlined color="primary" fontSize="small" />
              }
              tooltipTitle="ย้ายหนังสือไปชั้นอื่น"
              onClick={(e) => {
                e.stopPropagation()
                onMove(item)
              }}
            />
          )}

          {onEdit && (
            <SpeedDialAction
              icon={<EditRounded color="warning" fontSize="small" />}
              tooltipTitle="แก้ไขหนังสือ"
              onClick={(e) => {
                e.stopPropagation()
                onEdit(item)
              }}
            />
          )}

          {onDelete && (
            <SpeedDialAction
              icon={<DeleteOutlineRounded color="error" fontSize="small" />}
              tooltipTitle="ลบหนังสือออกจากชั้น"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(item)
              }}
            />
          )}
        </SpeedDial>
      )}

      {/* ================= IMAGE ================= */}

      <Box
        sx={{
          width: 120,
          height: 180,
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#fff',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          borderRadius: '10px',
        }}
      >
        {hasImage ? (
          <Image
            src={getImageUrlFromDynamic(item.picture)}
            alt={''}
            fill
            sizes="120px"
            style={{
              objectFit: 'contain',
              objectPosition: 'center',
              backgroundColor: '#fff',
            }}
          />
        ) : (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: 12,
            }}
          >
            ไม่มีรูปภาพ
          </Box>
        )}
      </Box>

      {/* ================= NAME ================= */}

      <Typography
        className="text-3-line"
        sx={{
          mt: 1,
        }}
      >
        {item.name}
      </Typography>
       <Box sx={{ display: 'flex', justifyContent: 'left' }}>
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
  )
}
