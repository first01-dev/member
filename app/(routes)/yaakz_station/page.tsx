'use client'
import { ProductItem } from '@/models/type'
import ApiService from '@/services/ApiService'
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Icon,
  IconButton,
  Paper,
  Step,
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
import Barcode from 'react-barcode'

import React, { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import {
  QontoConnector,
  QontoStepIconRoot,
  SearchIconWrapper,
  SearchStyle,
  StyledInputBase,
  StyledTableCell,
  StyledTableRow,
} from '@/services/Styles'
import { Check, Close, LocalMallRounded, Search } from '@mui/icons-material'

function QontoStepIcon(props: StepIconProps) {
  const { active, completed, className } = props

  return (
    <QontoStepIconRoot ownerState={{ active, completed }} className={className}>
      {completed ? (
        <Check className="QontoStepIcon-completedIcon" />
      ) : (
        <div className="QontoStepIcon-circle" />
      )}
    </QontoStepIconRoot>
  )
}

export default function YaakzStation() {
  const [value, setValue] = React.useState(0)
  const [valueStatus, setValueStatus] = React.useState(0)
  const [myStationList, setMyStationList] = React.useState<any>()
  const [stationInfo, setStationInfo] = React.useState<ProductItem[]>([])
  const [myStationDetail, setMyStationDetail] = React.useState<any>()
  const [loading, setLoading] = React.useState(false)

  const [openStationDetail, setOpenStationDetail] = useState(false)

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue)
  }

  const getStationList = async () => {
    setLoading(true)
    try {
      const res = await ApiService.getStationList()
      const data = res.data?.data ?? []

      if (!Array.isArray(data)) {
        setMyStationList([])
        setStationInfo([])
        return
      }

      const sortedData = data.sort(
        (a: any, b: any) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
      )

      // ดึง detail ของแต่ละ station
      const stationsWithInfo = await Promise.all(
        sortedData.map(async (station: any) => {
          try {
            const resDetail = await ApiService.getStationInfo(station.id)

            return {
              ...station,
              items: resDetail.data?.data?.[0]?.items || [],
              instore_date: resDetail.data?.data?.[0]?.instore_at,
              track_number: resDetail.data?.data?.[0]?.track_number,
            }
          } catch {
            return {
              ...station,
              items: [],
            }
          }
        }),
      )

      setMyStationList(stationsWithInfo)
    } catch (err) {
      setMyStationList([])
      setStationInfo([])
    } finally {
      setLoading(false)
    }
  }

  const getStationDetail = async (stationId: string) => {
    setOpenStationDetail(true)
    try {
      const res = await ApiService.getStationInfo(stationId)

      const station = res.data.data[0]

      setMyStationDetail(station)
      setStationInfo(station.items || [])
    } catch (err) {
      setMyStationDetail(null)
      setStationInfo([])
    }
  }

  const getSteps = (delivery_type: string) => {
    if (delivery_type === 'recive_store') {
      return ['รอดำเนินการ', 'ถึงสาขาแล้ว', 'เสร็จสิ้นแล้ว']
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

  const statusMap = ['pending', 'shipped', 'instore', 'recived']

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
          return 'เสร็จสิ้นแล้ว'

        default:
          return ''
      }
    }

    switch (status) {
      case 'pending':
        return 'รอดำเนินการ'

      case 'shipped':
        return 'ขนส่งเข้ารับแล้ว'

      default:
        return ''
    }
  }

  const filteredList = myStationList?.filter(
    (row: any) => row.status === statusMap[valueStatus],
  )

  React.useEffect(() => {
    getStationList()
  }, [])
  return (
    <div>
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
        <LocalMallRounded />
        <Typography fontSize={24} align="left">
          Yaakz Station
        </Typography>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            marginTop: -10,
            width: '90%',
          }}
        >
          <SearchStyle
            style={{
              backgroundColor: '#fff',
              width: '100%', // 👈 สำคัญ
              marginTop: 30,
            }}
          >
            <SearchIconWrapper>
              <Search />
            </SearchIconWrapper>

            <StyledInputBase
              placeholder="ค้นหาหมายเลข Station…"
              inputProps={{ 'aria-label': 'search' }}
              style={{ width: '100%' }} // 👈 เพิ่มตรงนี้ด้วย
            />
          </SearchStyle>
        </div>
      </div>

      <Tabs
        centered
        value={valueStatus}
        onChange={(e, newValue) => setValueStatus(newValue)}
      >
        <Tab label="รอดำเนินการ" />
        <Tab label="กำลังจัดส่ง" />
        <Tab label="ถึงสาขาแล้ว" />
        <Tab label="เสร็จสิ้นแล้ว" />
      </Tabs>

      {!filteredList || filteredList.length === 0 ? (
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
          ไม่มีรายการ
        </Typography>
      ) : (
        <div>
          {filteredList.map((row: any, index: number) => {
            const steps = getSteps(row.delivery_type)

            const stepDates =
              row.delivery_type === 'recive_store'
                ? [row.created_at, row.instore_date, row.success_at]
                : [row.created_at, row.track_number, row.success_at]

            return (
              <div
                className="box-item-station"
                key={index}
                onClick={() => getStationDetail(row.id)}
              >
                <div style={{ width: '100%', marginTop: -5 }}>
                  <Typography>
                    หมายเลข Station : {row.invoice_number}
                  </Typography>

                  <Typography style={{ fontSize: '14px' }}>
                    วันที่ซื้อ : {dayjs(row.created_at).format('DD/MM/YYYY')}
                  </Typography>

                  <Typography style={{ fontSize: '14px' }}>
                    จำนวน : {row.total_item} รายการ
                  </Typography>

                  <Stepper
                    key={row.id}
                    alternativeLabel
                    activeStep={getActiveStepFromStatus(
                      row.status,
                      row.delivery_type,
                    )}
                    connector={<QontoConnector />}
                  >
                    {steps.map((label, stepIndex) => (
                      <Step key={label}>
                        <StepLabel
                          StepIconComponent={QontoStepIcon}
                          optional={
                            stepDates[stepIndex] && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {stepIndex === 1 &&
                                row.delivery_type !== 'recive_store'
                                  ? stepDates[stepIndex]
                                  : dayjs(stepDates[stepIndex]).format(
                                      'DD/MM/YYYY',
                                    )}
                              </Typography>
                            )
                          }
                        >
                          {label}
                        </StepLabel>
                      </Step>
                    ))}
                  </Stepper>
                </div>
              </div>
            )
          })}
        </div>
      )}
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
          <Typography>เลขที่ : {myStationDetail?.invoice_number}</Typography>
          <Typography>
            วันที่ซื้อ :{' '}
            {dayjs(myStationDetail?.created_at).format('DD/MM/YYYY')}
          </Typography>
          <Typography>จำนวน : {myStationDetail?.total_item} รายการ</Typography>
          <Typography>
            สถานะ :{' '}
            {mapStatusTH(
              myStationDetail?.status,
              myStationDetail?.delivery_type,
            )}
          </Typography>
          {myStationDetail?.delivery_type === 'recive_store' ||
            (myStationDetail?.track_number !== '' && (
              <Box style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <Typography>
                  หมายเลขพัสดุ : {myStationDetail?.track_number}
                </Typography>
              </Box>
            ))}

          <TableContainer component={Paper} style={{ boxShadow: 'none' }}>
            <Table aria-label="customized table">
              <TableHead>
                <TableRow>
                  <StyledTableCell>รายการ</StyledTableCell>
                  <StyledTableCell align="right">จำนวน</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stationInfo?.map((row, index) => (
                  <StyledTableRow key={index}>
                    <StyledTableCell component="th" scope="row">
                      <Typography>{row.product_name}</Typography>

                      <Typography style={{ color: '#888' }}>
                        {row.product_barcode}
                      </Typography>
                    </StyledTableCell>
                    <StyledTableCell align="right">
                      {row.product_quantity}
                    </StyledTableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
      </Dialog>
    </div>
  )
}
