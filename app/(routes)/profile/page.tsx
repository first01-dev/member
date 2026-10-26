'use client'
import FromAddAddressProps from '@/components/dialogs/AddAddress/page'
import FormEditAddressProps from '@/components/dialogs/EditAddress/page'
import FormEditUserProps, {
  FormEditUserBody,
} from '@/components/dialogs/FormEditUser/page'
import { Province } from '@/interface/ThaiAddress'
import { key } from '@/models/constant'
import { AddressBook, EditUser, ProductItem, StationList } from '@/models/type'
import ApiService from '@/services/ApiService'
import { Navigation } from '@/services/Navigation'
import {
  clearAllLocalStorage,
  clearLocalStorage,
  getLocalStorage,
  setLocalStorage,
} from '@/services/StorageUtils'

import { loadingAnimation } from '@/services/Styles'
import {
  AccountCircleRounded,
  BadgeOutlined,
  EditOutlined,
  EmailOutlined,
  PhoneOutlined,
} from '@mui/icons-material'
import { Typography, IconButton, Button, Avatar, Badge } from '@mui/material'

import Image from 'next/image'
import { Box, Grid, Stack, width } from '@mui/system'
import React from 'react'

import toast from 'react-hot-toast'
import Lottie from 'react-lottie'
import router from 'next/router'

import { useEffect, useState } from 'react'

import { useSearchParams } from 'next/navigation'

import { Suspense } from 'react'

export interface FormBookAddressForm {
  name: string
  address: string
  sub_district: string
  district: string
  province: string
  post_code: string
  phone: string
  current: 1
}

export default function MyListProps() {
  const [loading, setLoading] = React.useState(false)

  const [isLoading, setIsLoading] = React.useState(false)
  const [sentType, setSentType] = React.useState('recive_store')
  
  const searchParams = useSearchParams()
  
  const [openFormAddAddress, setOpenFormAddAddress] = React.useState(false)
  const [openFormEditAddress, setOpenFormEditAddress] = React.useState(false)
  const [openFormEditUser, setOpenFormEditUser] = React.useState(false)
  const [editAddress, setEditAddress] = React.useState<AddressBook | null>(null)

  const [addressList, setAddressList] = React.useState<AddressBook[]>([])
  const [statusAddress, setStatusAddress] = React.useState('')

  const [provinceAddressList, setProvinceAddressList] = React.useState<
    Province[]
  >([])

  const [userInfo, setUserInfo] = React.useState<FormEditUserBody | null>(null)

  const [googleInfo, setGoogleInfo] = React.useState<any>('')

  const navigate = Navigation()
  
  const [isFromPreviousPage, setIsFromPreviousPage] = useState(false)

  const handleOprnFormEditAddress = (item: AddressBook) => {
    setEditAddress(item)
    setOpenFormEditAddress(true)
  }

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
  const getThailandAddressList = async () => {
    const res = await ApiService.getThailandAddressList()
    setProvinceAddressList(res.data.filter((item: any) => item))
  }

  const getAddressList = async (): Promise<AddressBook[]> => {
    setLoading(true)
    try {
      const res = await ApiService.getAddressBookList()
      await getThailandAddressList()

      setAddressList(res.data.data)
      setStatusAddress(res.data.status)
      return addressList
    } catch (err) {
      setAddressList([])
      return []
    } finally {
      setLoading(false)
    }
  }

  const onSaveEditUser = async (data: FormEditUserBody) => {
    setIsLoading(true)
    try {
      const { _id } = getLocalStorage(key.CUSTOMER)

      if (!data.name) {
        toast.error('กรุณากรอกชื่อ')
        return
      } else if (!data.phone) {
        toast.error('กรุณากรอกเบอร์โทรศัพท์')
        return
      }

      const payload: EditUser = {
        name: data.name,
        email: data.email,
        gender: data.gender,
        phone: data.phone,
        bod: data.bod,
        current: 1,
      }

      const res = await ApiService.updateCustomer(_id, payload)
      if (res.status === 200 && res.data) {
        toast.success('บันทึกข้อมูลเรียบร้อย')

        await getCustomerList()
      }
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล')
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmitAddAddress = async (
    data: AddressBook,
    onSuccess?: () => void,
  ) => {
    setIsLoading(true)
    setLoading(true)
    const customer = getLocalStorage(key.CUSTOMER)
    const payload: AddressBook = {
      ...data,
      name: customer.name,
    }

    const res = await ApiService.createAddressBook(payload)

    if (res.data.status === 'success') {
      toast.success(res.data.message)
      getAddressList()
      setLoading(false)
      onSuccess?.()
    } else {
      toast.error(res.data.message)
      setLoading(false)
    }
  }

  const onSubmitEditAddress = async (
    data: AddressBook,
    onSuccess?: () => void,
  ) => {
    setIsLoading(true)
    setLoading(true)

    // ใช้ _id ที่ส่งมาจากฟอร์ม
    const addressId = data._id || editAddress?._id

    if (!addressId) {
      toast.error('ไม่พบข้อมูลที่อยู่ที่จะแก้ไข')
      return
    }

    // สร้างข้อมูลที่จะส่งไป API (ไม่รวม _id)
    const { _id, ...addressData } = data

    const res = await ApiService.updateAddressBook(addressId, addressData)

    if (res.data.status === 'success') {
      if (!addressId) {
        setLoading(false)
        toast.error(res.data.message)
        return
      } else {
        setLoading(false)
      }

      toast.success(res.data.message)

      await getAddressList()

      setOpenFormEditAddress(false)

      // อัปเดต state addressList เฉพาะกรณี addressId มีจริง
      setAddressList((prev) =>
        prev.map((addr) =>
          addr._id === addressId ? { ...addr, ...addressData } : addr,
        ),
      )

      onSuccess?.()
    }
  }

  const onLogout = async () => {
    clearAllLocalStorage()
    await navigate.Home()
  }

  React.useEffect(() => {
    getAddressList()
    getCustomerList()
  }, [])


  return (
    <Box>
      <div style={{ height: 'calc(100vh - 180px)', overflow: 'scroll' }}>
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
          <AccountCircleRounded />
          <Typography fontSize={24} align="left">
            Profile
          </Typography>
        </div>

        <div
          style={{
            boxShadow:
              '0 4px 8px 0 rgba(184, 184, 184, 0.2), 0 6px 20px 0 rgba(187, 187, 187, 0.19)',
            margin: '10px 20px 0px 20px',
            zIndex: 1,
            borderRadius: 20,
            backgroundColor: '#fff',

            padding: '20px 10px 20px 10px',

            display: 'flex',
            justifyContent: 'space-evenly',
            textAlign: 'center',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Image
              src="/images/LOGO_YAAKZ_MEMBER-02.png"
              alt=""
              width={0}
              height={0}
              sizes="100vw"
              style={{
                width: '100%',
                height: '100%',
                maxWidth: '180px',
                maxHeight: '140px',
              }}
            />
          </div>

          <div
            style={{
              display: 'grid',
              justifyContent: 'left',
              textAlign: 'left',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <BadgeOutlined />
              <Typography fontSize={16} style={{ width: '100%', marginTop: 5 }}>
                {userInfo?.name || '-'}
              </Typography>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <EmailOutlined />
              <Typography fontSize={16} style={{ width: '100%' }}>
                {userInfo?.email || '-'}
              </Typography>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <PhoneOutlined />
              <Typography fontSize={16} style={{ width: '100%' }}>
                {userInfo?.phone || '-'}
              </Typography>
            </div>

            <Button
              variant="outlined"
              size="small"
              style={{ marginTop: 5, borderRadius: 20, width: '70%' }}
              onClick={() => setOpenFormEditUser(true)}
            >
              ปรับปรุงข้อมูล
            </Button>
          </div>
        </div>
        <div
          style={{
            marginTop: 20,
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Typography style={{ marginLeft: 30 }}>ที่อยู่จัดส่ง</Typography>
          {statusAddress === 'error' && (
            <Typography
              fontSize={14}
              style={{
                cursor: 'pointer',
                marginRight: 30,
                textDecoration: 'underline',
              }}
              onClick={() => setOpenFormAddAddress(true)}
            >
              เพิ่มที่อยู่
            </Typography>
          )}
        </div>

        <div style={{ minHeight: 225 }}>
          {loading ? (
            <Lottie options={loadingAnimation} height={225} width={225} />
          ) : addressList?.length > 0 ? (
            addressList?.map((item: AddressBook, index: number) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    margin: '20px 20px 20px 20px',
                    width: '88%',
                    zIndex: 1,
                    borderRadius: 20,
                    backgroundColor: '#fff',
                    boxShadow:
                      '0 4px 8px 0 rgba(184, 184, 184, 0.2), 0 6px 20px 0 rgba(187, 187, 187, 0.19)',
                    padding: '20px 10px 20px 10px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Typography fontSize={14}>{item.name}</Typography>
                    <IconButton onClick={() => handleOprnFormEditAddress(item)}>
                      <EditOutlined />
                    </IconButton>
                  </div>

                  <Typography fontSize={14}>
                    {item.address} {item.sub_district} {item.district}{' '}
                    {item.province} {item.post_code}
                  </Typography>
                </div>
              </div>
            ))
          ) : (
            <div
              style={{
                margin: '20px 20px 20px 20px',
                zIndex: 1,
                borderRadius: 20,
                backgroundColor: '#fff',
                boxShadow:
                  '0 4px 8px 0 rgba(184, 184, 184, 0.2), 0 6px 20px 0 rgba(187, 187, 187, 0.19)',
                padding: '20px 10px 40px 10px',
              }}
            >
              <Typography textAlign="center">ไม่มีที่อยู่ในระบบ</Typography>
            </div>
          )}
        </div>

        {/* )} */}
      </div>
      {/* </div> */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: 20,
        }}
      >
        <Button
          onClick={(_) => onLogout()}
          variant="contained"
          size="medium"
          style={{ width: '90%' }}
          className="btn-confirm"
        >
          ออกจากระบบ
        </Button>
      </div>

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

      <FormEditAddressProps
        open={openFormEditAddress}
        address={editAddress!}
        provinceList={provinceAddressList}
        onClose={() => {
          setOpenFormEditAddress(false)
          setEditAddress(null) // เคลียร์ข้อมูลที่เลือก
        }}
        onSubmit={onSubmitEditAddress}
      />

      <Suspense fallback={<div>กำลังโหลด...</div>}>
        <FromAddAddressProps
          open={openFormAddAddress}
          onClose={() => setOpenFormAddAddress(false)}
          onSubmit={onSubmitAddAddress}
          isFromPreviousPage={isFromPreviousPage}
        />
      </Suspense>
    </Box>
  )
}
