'use client'

import ApiService from '@/services/ApiService'
import {
  ArrowBackIosNewRounded,
  KeyboardArrowDownRounded,
} from '@mui/icons-material'
import { Button, Divider, Typography } from '@mui/material'
import { Box } from '@mui/system'
import dayjs from 'dayjs'
import React from 'react'
import Barcode from 'react-barcode'

interface StationItem {
  pro_name: string
  pro_quantity: number
  pro_barcode: string
  pro_price: number
}

interface Station {
  id: number
  code: string
  created_at: string
  items: StationItem[]
}

export default function PreStationList() {
  const [expandedIndex, setExpandedIndex] = React.useState<number | null>(null)
  const [preStationList, setPreStationList] = React.useState<Station[]>([])

  const handleExpand = (index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index))
  }

  const getPreStationList = async () => {
    try {
      const response = await ApiService.getPreStationList()

      const data = response?.data?.data ?? []

      const sortedList = [...data].sort((a: Station, b: Station) => {
        const dateA = a.created_at ? new Date(a.created_at) : new Date(0)
        const dateB = b.created_at ? new Date(b.created_at) : new Date(0)

        return dateB.getTime() - dateA.getTime()
      })

      setPreStationList(sortedList)
    } catch (error) {
      console.error('getPreStationList error:', error)
    }
  }

  

  React.useEffect(() => {
    getPreStationList()
  }, [])

  return (
    <Box>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: 16,
        }}
      >
        <Button
          startIcon={<ArrowBackIosNewRounded />}
          variant="text"
          href="/home"
        />

        <Typography variant="h6">My List</Typography>
      </div>
      <Box className="order-list-container">
        {preStationList.length === 0 ? (
          <Box
            sx={{
              minHeight: '50vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography fontSize={20}>ไม่มี My List</Typography>
          </Box>
        ) : (
          preStationList.map((item, index) => {
            return (
              <Box
                key={item.id ?? index}
                className="order-card"
                style={{
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.25s ease',
                  boxShadow:
                    expandedIndex === index
                      ? '0 4px 15px rgba(62, 139, 247, 0.2)'
                      : '0 2px 8px rgba(0, 0, 0, 0.08)',
                }}
                onClick={() => handleExpand(index)}
              >
                <Box
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <Barcode value={item.code} width={1} height={40} />
                </Box>

                <Divider style={{ margin: '10px 0' }} />

                <Box
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <Typography>📆</Typography>

                  <Typography fontSize={16}>
                    {dayjs(item.created_at).format('DD/MM/YYYY')}
                  </Typography>
                </Box>

                <Box
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <Typography>
                    📋  {item.items?.length ?? 0} รายการ
                  </Typography>
                </Box>

                <Divider style={{ margin: '10px 0' }} />

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Typography>ดูเพิ่มเติม</Typography>
                  <KeyboardArrowDownRounded
                    sx={{
                      fontSize: 24,
                      transition: 'transform 0.3s ease',
                      transform:
                        expandedIndex === index
                          ? 'rotate(-180deg)'
                          : 'rotate(0deg)',
                    }}
                  />
                </div>

                {expandedIndex === index && (
                  <Box
                    sx={{
                      mt: 2,
                      pt: 1,
                      borderTop: '1px solid #e5e7eb',
                      animation: 'fadeIn 0.25s ease',
                      '@keyframes fadeIn': {
                        from: {
                          opacity: 0,
                          transform: 'translateY(-5px)',
                        },
                        to: {
                          opacity: 1,
                          transform: 'translateY(0)',
                        },
                      },
                    }}
                  >
                    <Typography
                      fontSize={18}
                      fontWeight="bold"
                      sx={{
                        mb: 1,
                        color: '#334155',
                      }}
                    >
                      รายการสินค้า
                    </Typography>

                    {item.items?.map((productItem, itemIndex) => (
                      <Box
                        key={itemIndex}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '10px 12px',
                          mb: 1,
                          borderRadius: '10px',
                          backgroundColor: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          gap: 2,
                        }}
                      >
                        <Typography
                          fontSize={15}
                          fontWeight="bold"
                          color="#3e8bf7"
                        >
                          {productItem.pro_quantity}x
                        </Typography>
                        <Box
                          sx={{
                            width: '75%',
                            display: 'flex',
                            flexDirection: 'column',
                          }}
                        >
                          <Typography fontSize={15}>
                            {productItem.pro_name}
                          </Typography>
                          <Typography style={{ color: '#64748b' }}>
                            {productItem.pro_barcode}
                          </Typography>
                        </Box>
                        <Typography>
                          ฿ {productItem.pro_price * productItem.pro_quantity}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            )
          })
        )}
      </Box>
    </Box>
  )
}
