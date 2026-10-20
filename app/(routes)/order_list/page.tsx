'use client'
import { ProductItem } from '@/models/type'
import ApiService from '@/services/ApiService'
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Icon,
  IconButton,
  Paper,
  Skeleton,
  Step,
  StepContent,
  StepIconProps,
  StepLabel,
  Stepper,
  Tab,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography,
} from '@mui/material'
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord'
import Barcode from 'react-barcode'

import React, { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import {
  CustomStepConnector,
  loadingAnimation,
  QontoConnector,
  QontoStepIconRoot,
  SearchIconWrapper,
  SearchStyle,
  StyledInputBase,
  StyledTableCell,
  StyledTableRow,
} from '@/services/Styles'
import {
  AccountBalanceWalletRounded,
  AssignmentTurnedInRounded,
  CalendarMonthRounded,
  CalendarTodayRounded,
  Check,
  ChevronRight,
  Close,
  LocalMallRounded,
  LocalShippingRounded,
  MenuBookRounded,
  Search,
} from '@mui/icons-material'
import { formatBalance } from '@/services/StringUtils'

import { shipID } from '@/models/constant'
import Lottie from 'react-lottie'
import axios from 'axios'

function QontoStepIcon(props: StepIconProps) {
  const { active, completed, className } = props

  return (
    <QontoStepIconRoot ownerState={{ active, completed }} className={className}>
      {completed ? (
        <div className="QontoStepIcon-circle" />
      ) : (
        <div className="QontoStepIcon-circle" />
      )}
    </QontoStepIconRoot>
  )
}

export default function OrderList() {
  const [valueStatus, setValueStatus] = React.useState(0)
  const [status, setStatus] = React.useState('all')
  const [myStationList, setMyStationList] = React.useState<any>()
  const [stationInfo, setStationInfo] = React.useState<ProductItem[]>([])
  const [trackingDetail, setTrackingDetail] = React.useState<any>([])
  const [orderList, setOrderList] = React.useState<any>()
  const [filteredOrderList, setFilteredOrderList] = React.useState<any>()
  const [myStationDetail, setMyStationDetail] = React.useState<any>()
  const [loading, setLoading] = React.useState(false)

  const [openStationDetail, setOpenStationDetail] = useState(false)

  const [selectedButton, setSelectedButton] = useState<string>('all')

  const buttonList = [
    { key: 'all', label: 'ทั้งหมด' },
    { key: 'recive_store', label: 'รับที่สาขา' },
    { key: 'delivery', label: 'จัดส่งบ้าน' },
  ]

  const handleChangeStatus = (
    e: React.MouseEvent<HTMLDivElement>,
    status: string,
  ) => {
    setStatus(status)
  }

  const getOrderList = async () => {
    const res = await ApiService.getOrderList()

    const filteredOrders = res.data.filter(
      (order: any) =>
        order.type !== 'normal' && !order.type.startsWith('buffet'),
    )
    setOrderList(res.data)
    setFilteredOrderList(filteredOrders)
  }

  const getStationDetail = async (order_Id: string) => {
    try {
      setOpenStationDetail(true)
      setLoading(true)
      const res = await ApiService.getOrderInfo(order_Id)

      const station = res.data

      setMyStationDetail(station)
      setStationInfo(station.items || [])
      setLoading(false)
    } catch (err) {
      setMyStationDetail(null)
      setStationInfo([])
      setTrackingDetail([])
      setOpenStationDetail(false)
      setLoading(false)
    }
  }

  const getTrackingInfo = async (
    trackingNumber?: string,
    shipId?: string | number,
  ) => {
    try {
      if (!trackingNumber) return null

      // เรียก Thailand Post API เฉพาะไปรษณีย์ไทย
      if (String(shipId) !== '58002') {
        setTrackingDetail([])
        return null
      }

      const response = await axios.post('/api/thailand-post/tracking', {
        barcode: trackingNumber,
      })

      const data = response.data.data.response?.items?.[trackingNumber] ?? []

      setTrackingDetail(data)

      return response.data
    } catch (error: any) {
      console.error('Tracking Error:', error.response?.data || error)

      setTrackingDetail([])

      return null
    }
  }

  const getTrackingUrl = (
    shipId?: string | number,
    trackingNumber?: string,
  ) => {
    if (!shipId || !trackingNumber) return null

    const id = String(shipId)

    const trackingUrls: Record<string, string> = {
      // DHL

      //thaipost
      '58002' : `https://track.thailandpost.co.th/dashboard?trackNumber=${trackingNumber}`,


      '58003': `https://www.dhl.com/th-en/home/tracking/tracking-express.html?submit=1&tracking-id=${trackingNumber}`,

      // Ninja
      '58004': `https://www.ninjavan.co/th-th/track-trace?tracking_number=${trackingNumber}`,

      // Quantium
      '58005': `https://www.quantium.co.th/track?tracking_number=${trackingNumber}`,

      // Kerry Express
      '58006': `https://th.kerryexpress.com/th/track/?track=${trackingNumber}`,

      // DHL COD
      '62001': `https://www.dhl.com/th-en/home/tracking/tracking-express.html?submit=1&tracking-id=${trackingNumber}`,

      // DHL พิเศษ
      '62002': `https://www.dhl.com/th-en/home/tracking/tracking-express.html?submit=1&tracking-id=${trackingNumber}`,

      // Flash Express
      '63003': `https://www.flashexpress.com/tracking/?se=${trackingNumber}`,
      // J&T Express
      '64001': `https://www.jtexpress.co.th/service/track?waybillNo=${trackingNumber}`,
    }
    return trackingUrls[id] ?? null
  }

  const handleTrackingClick = async () => {
    const shipId = String(myStationDetail?.track_shipid)
    const trackingNumber = myStationDetail?.track_number

    if (!trackingNumber) return

    // Thailand Post → ดึงข้อมูล Tracking
    // if (shipId === '58002') {
    //   await getTrackingInfo(trackingNumber, shipId)
    //   return
    // }

    // บริษัทอื่น → เปิดเว็บ Tracking
    const url = getTrackingUrl(shipId, trackingNumber)

    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  const OrderCard = ({ order }: { order: any }) => {
    const steps = getSteps(order.type)

    const stepDates =
      order.type === 'recive_store'
        ? [order.created_at, order.instore_date, order.success_at]
        : [order.created_at, order.track_number, order.success_at]

    const statusText = mapStatusTH(
      order.status,
      order.delivery_type || order.type,
    )

    return (
      <div onClick={() => getStationDetail(order.id)} className="order-card">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Typography fontSize={16} fontWeight={600}>
              {orderType(order.type)}
            </Typography>
            <ChevronRight />
          </div>

          <Chip
            label={
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {statusText !== 'สำเร็จ' && (
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: '#1677ff',
                    }}
                  />
                )}
                {statusText}
              </div>
            }
          />
        </div>

        <Divider style={{ margin: '10px 0' }} />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <Typography>เลขที่ :</Typography>
          <Typography fontWeight={600}>{order.number}</Typography>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <Typography>วันที่ซื้อ :</Typography>

          <Typography fontWeight={600}>
            {dayjs(order.created_at).format('DD/MM/YYYY')}
          </Typography>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <Typography>ราคารวม :</Typography>
          <Typography fontWeight={600}>
            {formatBalance(order.paid_amount)} บาท
          </Typography>
        </div>

        {(order.type === 'delivery' || order.type === 'recive_store') && (
          <Stepper
            alternativeLabel
            activeStep={getActiveStepFromStatus(order.status, order.type)}
            connector={<QontoConnector />}
          >
            {steps.map((label, stepIndex) => (
              <Step key={label}>
                <StepLabel
                  StepIconComponent={QontoStepIcon}
                  optional={
                    stepDates[stepIndex] && (
                      <Typography variant="caption" color="text.secondary">
                        {stepIndex === 1 && order.type !== 'recive_store'
                          ? stepDates[stepIndex]
                          : dayjs(stepDates[stepIndex]).format('DD/MM/YYYY')}
                      </Typography>
                    )
                  }
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        )}
      </div>
    )
  }

  const canShowTracking =
    ['delivery', 'online'].includes(myStationDetail?.delivery_type ?? '') &&
    Boolean(myStationDetail?.track_number)

  const statusTrack = (status: string) => {
    if (!trackingDetail?.length) return null
    const sortedTracking = [...trackingDetail].reverse()
    const activeStep = 0

    return (
      <Box sx={{ maxWidth: '100%' }}>
        <Stepper
          activeStep={activeStep}
          orientation="vertical"
          connector={<CustomStepConnector />}
        >
          {sortedTracking.map((step: any, index: number) => (
            <Step key={index}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                }}
              >
                {/* วันที่ */}
                <Box
                  sx={{
                    width: 55,
                    flexShrink: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    mr: 1,
                    pt: 0.5,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {dayjs(step.status_date).format('DD/MM')}
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    {dayjs(step.status_date).format('HH:mm')}
                  </Typography>
                </Box>

                {/* Icon + สถานะ */}
                <Box sx={{ flex: 1 }}>
                  <StepLabel
                    StepIconComponent={QontoStepIcon}
                    StepIconProps={
                      {
                        active: index === activeStep,
                        completed: false,
                      } as any
                    }
                    sx={{
                      p: 0,
                      textAlign: 'left',
                    }}
                  >
                    {step.status_detail}
                  </StepLabel>
                </Box>
              </Box>
            </Step>
          ))}
        </Stepper>
      </Box>
    )
  }

  const baseData = status === 'all' ? orderList : filteredOrderList

const data =
  selectedButton === 'all'
    ? baseData
    : baseData.filter(
        (order: any) => order.type === selectedButton
      )

  const getSteps = (delivery_type: string) => {
    if (delivery_type === 'recive_store') {
      return ['รอดำเนินการ', 'ถึงสาขาแล้ว', 'สำเร็จ']
    }

    return ['รอดำเนินการ', 'ขนส่งเข้ารับแล้ว']
  }

  const getActiveStepFromStatus = (status: string, delivery_type: string) => {
    if (delivery_type === 'recive_store') {
      switch (status) {
        case 'pending':
          return 0

        case 'instore':
          return 1

        case 'recived':
          return 2

        default:
          return 0
      }
    }

    switch (status) {
      case 'pending':
        return 0

      case 'shipped':
        return 1

      default:
        return 0
    }
  }

  const mapStatusTH = (status: string, delivery_type: string) => {
    if (delivery_type === 'recive_store') {
      switch (status) {
        case 'pending':
          return 'รอดำเนินการ'

        case 'shipped':
          return 'ขนส่งเข้ารับแล้ว'
        case 'instore':
          return 'ถึงสาขาแล้ว'

        case 'recived':
          return 'สำเร็จ'

        default:
          return ''
      }
    }

    switch (status) {
      case 'pending':
        return 'รอดำเนินการ'

      case 'shipped':
        return 'ขนส่งเข้ารับแล้ว'

      case 'complete':
        return 'สำเร็จ'

      default:
        return ''
    }
  }

  const orderType = (type: string) => {
    if (type?.startsWith('buffet')) {
      const price = type.replace('buffet', '')
      return `📚 บุฟเฟต์ ${price}`
    }
    switch (type) {
      case 'normal':
        return '🛍️ หน้าร้าน '
      case 'recive_store':
        return '📦 รับที่สาขา'
      case 'delivery':
        return '🚚 จัดส่งบ้าน'
      case 'online':
        return '🛒 Yaakz.com'
      default:
        return ''
    }
  }

  React.useEffect(() => {
    getOrderList()
  }, [])
  return (
    <div>
      <div
        style={{
          backgroundColor: '#3e8bf7',
          height: 85,
          borderRadius: '0px 0px 20px 20px',
        }}
      />

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          margin: '-60px 0px 20px 20px',
          color: '#fff',
          gap: 10,
        }}
      >
        <AssignmentTurnedInRounded />
        <Typography fontSize={24} align="left">
          Order
        </Typography>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 10,
          justifyContent: 'center',
          marginTop: 50,
        }}
      >
        {buttonList.map((button) => (
          <Button
            key={button.key}
            variant="contained"
            onClick={() => {
              setSelectedButton(button.key)
              handleChangeStatus(null as any, button.key)
            }}
            sx={{
              padding: 1,
              borderRadius: '20px',
              textTransform: 'none',
              backgroundColor:
                selectedButton === button.key ? '#1976d2' : '#fff',
              color: selectedButton === button.key ? '#fff' : '#1976d2',

              '&:hover': {
                backgroundColor:
                  selectedButton === button.key ? '#1565c0' : '#f5f5f5',
              },
              boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px',
            }}
          >
            {button.label}
          </Button>
        ))}
      </div>
      {status === 'yaakz station' && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Tabs
            centered={false}
            variant="scrollable"
            scrollButtons="auto"
            value={valueStatus}
            onChange={(e, newValue) => setValueStatus(newValue)}
          >
            <Tab label="รอดำเนินการ" />
            <Tab label="กำลังจัดส่ง" />
            <Tab label="ถึงสาขาแล้ว" />
            <Tab label="เสร็จสิ้นแล้ว" />
          </Tabs>
        </div>
      )}

      <div className="order-list-container">
        {data?.map((order: any) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
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
        onClose={() => setOpenStationDetail(false)}
        open={openStationDetail}
      >
        <DialogTitle
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography>รายละเอียด</Typography>
          <IconButton>
            <Close onClick={() => setOpenStationDetail(false)} />
          </IconButton>
        </DialogTitle>
        <DialogContent
          style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
        >
          <div>
            <Typography fontSize={14}>เลขที่คำสั่งซื้อ</Typography>
            <Typography fontWeight={600}>
              {myStationDetail?.invoice_num}
            </Typography>
          </div>
          <div>
            <Typography fontSize={14}>สาขา</Typography>
            <Typography fontWeight={600}>
              {myStationDetail?.store_name}
            </Typography>
          </div>
          <div>
            <Typography fontSize={14}>วันที่ซื้อ</Typography>
            <Typography fontWeight={600}>
              {dayjs(myStationDetail?.created_at).format('DD/MM/YYYY')}
            </Typography>
          </div>
          <div>
            <Typography fontSize={14}>สถานะ</Typography>
            <Typography fontWeight={600}>
              {mapStatusTH(
                myStationDetail?.status,
                myStationDetail?.delivery_type,
              )}
            </Typography>
          </div>
          {canShowTracking && (
          <Box
            style={{
              borderRadius: 10,
              backgroundColor: '#f7f7f7',
              marginTop: 10,
              padding: '10px 0px 0px 10px',
            }}
          >
            
              <Typography fontSize={13} color="text.secondary" mb={0.5}>
                ข้อมูลการจัดส่ง
              </Typography>
           
          
              <div>
                {canShowTracking && (
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <Typography fontWeight={600}>
                        {shipID[
                          String(
                            myStationDetail?.track_shipid,
                          ) as keyof typeof shipID
                        ] ?? 'ประเภทการจัดส่งไม่ทราบ'}
                        &nbsp;:
                      </Typography>

                      <Typography fontSize={15} fontWeight={600}>
                        {myStationDetail?.track_number}
                      </Typography>

                      <Typography
                        component="span"
                        onClick={handleTrackingClick}
                        sx={{
                          fontSize: 12,
                          color: '#1976d2',
                          textDecoration: 'none',
                          whiteSpace: 'nowrap',
                          cursor: 'pointer',

                          '&:hover': {
                            textDecoration: 'underline',
                          },
                        }}
                      >
                        ดูเพิ่มเติม →
                      </Typography>
                    </div>

                    <Box sx={{ marginTop: 3 }}>
                      {statusTrack(myStationDetail?.status_date)}
                    </Box>
                  </div>
                )}
              </div>
     {/* {loading && (
              <Lottie options={loadingAnimation} height="10%" width="100%" />
     )} */}
          </Box>
           )}
          <div
            style={{
              alignItems: 'center',
              gap: 10,
              backgroundColor: '#f5f5f5',
              padding: 5,
              borderRadius: 10,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: 10,
              }}
            >
              <LocalMallRounded />
              <Typography fontWeight={600}>
                รายการสินค้า ({myStationDetail?.total_item} รายการ)
              </Typography>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                backgroundColor: '#fff',
                padding: 10,
                borderRadius: 10,
              }}
            >
              {stationInfo.map((row, index) => (
                <div key={index}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 10,
                    }}
                  >
                    <div>
                      <Typography>{row.product_name}</Typography>
                      <Typography style={{ color: '#888' }}>
                        {row.product_barcode}
                      </Typography>
                    </div>
                    <Typography>x{row.product_quantity}</Typography>
                  </div>
                  <Divider style={{ margin: '10px 0' }} />
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
