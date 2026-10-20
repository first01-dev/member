'use client'
import { key } from '@/models/constant'
import { Coupons } from '@/models/type'
import ApiService from '@/services/ApiService'
import { getLocalStorage } from '@/services/StorageUtils'
import Image from 'next/image'
import {
  CardGiftcardRounded,
  Close,
  LocalActivityRounded,
  MenuBookRounded,
} from '@mui/icons-material'
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Tab,
  Tabs,
  Typography,
} from '@mui/material'
import { Box } from '@mui/system'
import dayjs from 'dayjs'
import React from 'react'
import Barcode from 'react-barcode'

export default function CouponsPage() {
  const [value, setValue] = React.useState(0)
  const [points, setPoints] = React.useState(0)

  const [coupons, setCoupons] = React.useState<Coupons[]>([])
  const [couponsInfo, setCouponsInfo] = React.useState<Coupons[]>([])

  const [openCoupon, setOpenCoupon] = React.useState(false)

  const getCouponsList = async () => {
    const res = await ApiService.getCouponsList()

    setCoupons(res.data.data)
  }

  const distributedCoupons = coupons?.filter(
    (coupon) => coupon.status === 'distributed',
  )

  const usedCoupons = coupons?.filter((coupon) => coupon.status === 'used')

  const getCouponsInfo = async (coupon_code: string) => {
    setOpenCoupon(true)
    const res = await ApiService.getCouponsInfo(coupon_code)
    
    setCouponsInfo([res.data.data[0]])
  }
  const couponRule = JSON.parse(couponsInfo?.[0]?.rule || '{}')

  const chanel = () => {
    const channels: string[] = JSON.parse(couponsInfo?.[0]?.channel || '[]')

    if (channels.includes('store') && channels.includes('lnwshop')) {
      return 'Yaakz Shop (เฉพาะสาขาที่ร่วมรายการ) , เว็บ yaakz.com'
    }

    if (channels.includes('store')) {
      return 'Yaakz Shop (เฉพาะสาขาที่ร่วมรายการ)'
    }

    if (channels.includes('lnwshop')) {
      return 'เว็บ yaakz.com'
    }
  }

  React.useEffect(() => {
    getCouponsList()
  }, [])

  React.useEffect(() => {
    const stored = getLocalStorage(key.CUSTOMER)
    if (stored) {
      setPoints(stored.point || 0)
    }
  }, [])

  return (
    <Box>
      <div
        style={{
          backgroundColor: '#3e8bf7',
          height: 115,
          borderRadius: '0px 0px 20px 20px',
        }}
      />

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          margin: '-100px 0px 20px 20px',
          color: '#fff',
          gap: 10,
        }}
      >
        <LocalActivityRounded />
        <Typography fontSize={24} align="left">
          Coupons
        </Typography>
      </div>

      {/* <div className="box-points">
        <div className="box-points-left">
          <CardGiftcardRounded sx={{ width: 40, height: 40 }} />
          <div>
            <Typography style={{ fontSize: '12px', marginBottom: 5 }}>
              Yaakz Point
            </Typography>
            <div className="point">
              <Typography style={{ fontSize: '20px' }}>{Math.floor(parseFloat(points?.toString() || '0'))}</Typography>
              <div className="icon-point">
                <div className="icon-point2"></div>
                <Typography sx={{ mt: -2.6, ml: 0.7, color: '#fff' }}>
                  Y
                </Typography>
              </div>
            </div>
          </div>
        </div>
        <div className="box-points-right">
          <Typography style={{ fontSize: '14px' }}>0 คะแนน</Typography>
          <Typography style={{ fontSize: '14px', marginBottom: 5 }}>
           หมดอายุ -
          </Typography>
        </div>
      </div> */}

      <div
        style={{ display: 'flex', justifyContent: 'center', marginTop: '10%' }}
      >
        <Tabs
          style={{ backgroundColor: '#fff', width: '80%', borderRadius: 20 }}
          centered
          value={value}
          onChange={(e, newValue) => setValue(newValue)}
        >
          <Tab label="คูปองของฉัน" />
          <Tab label="คูปองที่ใช้แล้ว" />
        </Tabs>
      </div>

      <Box hidden={value !== 0}>
        {!distributedCoupons?.length ? (
          <Typography
            style={{
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              display: 'flex',
              gap: 20,
              marginTop: 20,
            }}
          >
            ไม่มีคูปอง
          </Typography>
        ) : (
          distributedCoupons.map((coupon, index) => {
            return (
              <div
                style={{
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  display: 'flex',

                  marginTop: 20,
                }}
                key={index}
              >
                <div
                  className="coupon"
                  onClick={() => getCouponsInfo(coupon.code)}
                >
                  {/* <div className="ready-stamp">
                      พร้อมใช้งาน
                    </div> */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      width: '100%',
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                        minWidth: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10,
                      }}
                    >
                      {coupon.discount_value && (
                        <div className="coupon-title">
                          คูปองส่วนลด{' '}
                          {Math.floor(parseFloat(coupon.discount_value))} บาท
                        </div>
                      )}

                      <div className="coupon-detail" style={{ fontSize: 14 }}>
                        ใช้คูปองภายใน:{' '}
                        {dayjs(coupon.start_on).format('DD/MM/YYYY')} -{' '}
                        {dayjs(coupon.expire_on).format('DD/MM/YYYY')}
                      </div>
                    </div>
                    <div className="coupon-divider" />
                    
                  </div>
                </div>
              </div>
            )
          })
        )}
      </Box>
      <Box hidden={value !== 1}>
        {!usedCoupons ? (
          <Typography
            style={{
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              display: 'flex',
              gap: 20,
              marginTop: 20,
            }}
          >
            ไม่มีคูปอง
          </Typography>
        ) : (
          usedCoupons.map((coupon, index) => {
            return (
              <div
                style={{
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  display: 'flex',
                  gap: 20,
                  marginTop: 20,
                }}
                key={index}
              >
                <div className="coupon2">
                  <div className="used-stamp">ใช้แล้ว</div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      width: '95%',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10,
                      }}
                    >
                      {coupon.discount_value && (
                        <div className="coupon-title">
                          คูปองส่วนลด{' '}
                          {Math.floor(parseFloat(coupon.discount_value))} บาท
                        </div>
                      )}

                      <div className="coupon-detail" style={{ fontSize: 14 }}>
                        ใช้คูปองภายใน:{' '}
                        {dayjs(coupon.start_on).format('DD/MM/YYYY')} -{' '}
                        {dayjs(coupon.expire_on).format('DD/MM/YYYY')}
                      </div>
                    </div>
                    <div className="coupon-divider"></div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </Box>

      <Dialog
        open={openCoupon}
        onClose={() => setOpenCoupon(false)}
        fullWidth
        maxWidth="xs"
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
              borderRadius: '28px',
              p: 0,

              backgroundColor: '#fff',

              WebkitMask: `
      radial-gradient(circle 18px at left 61%, transparent 99%, black 100%),
      radial-gradient(circle 18px at right 61%, transparent 99%, black 100%),
      linear-gradient(black, black)
    `,
              WebkitMaskComposite: 'source-over',
              maskComposite: 'intersect',
            },
          },
        }}
      >
        <DialogContent>
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography
              sx={{
                fontSize: 20,
              }}
            >
              รายละเอียดคูปอง
            </Typography>
            <IconButton
              style={{ marginLeft: 'auto' }}
              onClick={() => setOpenCoupon(false)}
            >
              <Close />
            </IconButton>
          </div>

          {/* Coupon Card */}
          <div
            style={{
              padding: 20,
            }}
          >
            {/* Discount */}
            <Typography
              sx={{
                textAlign: 'center',
                fontWeight: 700,
                fontSize: 28,
              }}
            >
              ลด{' '}
              {Math.floor(parseFloat(couponsInfo?.[0]?.discount_value || '0'))}
              {couponsInfo?.[0]?.discount_type === 'fixed' ? ' บาท' : '%'}
            </Typography>

            {couponsInfo?.[0]?.discount_max && (
              <Typography
                sx={{
                  textAlign: 'center',
                  color: '#666',
                  mt: 1,
                }}
              >
                ส่วนลดสูงสุด
                {Math.floor(parseFloat(couponsInfo?.[0]?.discount_max || '0'))}
                บาท
              </Typography>
            )}

            {/* Detail */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <Typography>
                ขั้นต่ำ{' '}
                {Math.floor(parseFloat(couponRule.order_amount_min || '0'))} บาท
              </Typography>

              <Typography>
                ใช้งานได้ :{' '}
                {couponsInfo?.[0]?.start_on && couponsInfo?.[0]?.expire_on
                  ? `${dayjs(couponsInfo?.[0]?.start_on).format(
                      'DD/MM/YYYY',
                    )} - ${dayjs(couponsInfo?.[0]?.expire_on).format(
                      'DD/MM/YYYY',
                    )}`
                  : '-'}
              </Typography>

              <Typography>ใช้ได้ที่ : {chanel()}</Typography>
            </div>

            <div
              style={{
                borderTop: '2px dashed #ddd',
                marginTop: 25,
              }}
            />
            {/* Barcode */}
            <div
              style={{
                marginTop: 24,
                textAlign: 'center',
              }}
            >
              <Barcode width={2} height={60} value={couponsInfo?.[0]?.code} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Box>
  )
}
