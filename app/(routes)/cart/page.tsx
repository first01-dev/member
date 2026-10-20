'use client'

import { key } from '@/models/constant'
import { useRouter } from 'next/navigation'
import { CartItem } from '@/models/type'
import ApiService from '@/services/ApiService'
import { getLocalStorage } from '@/services/StorageUtils'
import { getImageUrlFromDynamic } from '@/services/StringUtils'
import {
  AddRounded,
  ArrowBackIosNewRounded,
  DeleteRounded,
  RemoveRounded,
} from '@mui/icons-material'
import { Button, IconButton, Typography } from '@mui/material'
import Image from 'next/image'
import React from 'react'
import toast from 'react-hot-toast'
export default function CartPage() {
   const router = useRouter()
   
  const [cart, setCart] = React.useState<CartItem[]>([])
  const [customer, setCustomer] = React.useState<any>(null)

  const handleIncrement = (index: number) => {
    const updatedCart = [...cart]
    const item = updatedCart[index]
    if (!item) return
    item.quantity = (item.quantity ?? 0) + 1
    setCart(updatedCart)
    localStorage.setItem('cart', JSON.stringify(updatedCart))
  }

  const handleDecrement = (index: number) => {
    const updatedCart = [...cart]
    const item = updatedCart[index]
    if (!item) return
    if ((item.quantity ?? 0) > 1) {
      item.quantity = (item.quantity ?? 0) - 1
      setCart(updatedCart)
      localStorage.setItem('cart', JSON.stringify(updatedCart))
    }
  }
  const onSubmit = async () => {

    const payload = {
      name: customer?.name,
      phone: customer?.phone,
      item_list: cart.map((item) => ({
        pro_id: item.id,
        pro_barcode: item.barcode,
        pro_name: item.name,
        pro_price: item.price,
        pro_ref: item.ref,
        pro_quantity: item.quantity,

      })),
    }

   
    const res = await ApiService.addPreStation(payload)
    if(res.data.status === 'success'){
      localStorage.removeItem('cart')
      setCart([])
      router.push('/pre_station_list')
      toast.success(res.data.message)
    }else{
      toast.error(res.data.message)
    }
  }
  React.useEffect(() => {
    const customer = getLocalStorage(key.CUSTOMER)
    const cartData = localStorage.getItem('cart')
    if (cartData) {
      const parsedCart: CartItem[] = JSON.parse(cartData)
      const sortedCart = parsedCart.sort((a, b) => {
        const dateA = a.added_time ? new Date(a.added_time) : new Date(0)
        const dateB = b.added_time ? new Date(b.added_time) : new Date(0)
        return dateB.getTime() - dateA.getTime()
      })
      setCart(sortedCart)

    }
    if (customer) {
     setCustomer(customer)
    }

   
  }, [])

  const totalPrice = cart.reduce((acc, item: any) => acc + item.price * item.quantity, 0)
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100dvh',
      }}
    >
      {/* Header */}
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

        <Typography variant="h6">New List</Typography>
      </div>

      {cart.length === 0 ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
              height: '80dvh',
          }}
        >
          <Typography>ไม่มีสินค้าในถุง</Typography>
        </div>
      ) : (<div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          padding: 16,
          height: '78dvh',
          overflowY: 'auto',
        }}
      >
        {cart.map((item, index) => (
          <div key={index} className="box-cart">
            <div className="justify-content start">
              <div
                style={{
                  marginTop: 1,
                  marginLeft: 'auto',
                  marginRight: 'auto',
                  width: 120,
                  height: item.picture ? 130 : 130, // 👈 เปลี่ยนตรงนี้
                  position: 'relative',
                  overflow: 'hidden',
                  backgroundColor: '#fff',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  borderRadius: 10,
                }}
              >
                {item.picture ? (
                  <Image
                    src={getImageUrlFromDynamic(item.picture)}
                    alt=""
                    fill
                    sizes="160px"
                    style={{
                      objectFit: 'contain',
                      objectPosition: 'center',
                      backgroundColor: '#fff',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#000',
                      fontSize: 12,
                    }}
                  >
                    ไม่มีรูปภาพ
                  </div>
                )}
              </div>
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  paddingLeft: 8,
                  justifyContent: 'space-between',
                }}
              >
                <div className="justify-content between align-items-center">
                  <div>
                   
                    <Typography>{item.name}</Typography>
                    <Typography style={{ color: '#666' }}>
                      {item.barcode}
                    </Typography>
                  </div>
                  <IconButton onClick={() => {
                    const updatedCart = cart.filter((_, i) => i !== index)
                    setCart(updatedCart)
                    localStorage.setItem('cart', JSON.stringify(updatedCart))
                  }}>
                    <DeleteRounded />
                  </IconButton>
                </div>
                <div className="justify-content between align-items-center">
                  <Typography>฿ {item.price}</Typography>
                  <div className="box-quantity">
                    <IconButton size="small" onClick={() => handleDecrement(index)}>
                      <RemoveRounded />
                    </IconButton>
                    <Typography>{item.quantity}</Typography>
                    <IconButton size="small" onClick={() => handleIncrement(index)}>
                      <AddRounded />
                    </IconButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
)}
      
      {cart.length > 0 && (
        <div className="box-chkout">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography>ยอดรวมโดยประมาณ</Typography>
        <Typography>฿ {totalPrice.toFixed(2)}</Typography>
        </div>
        <Button style={{borderRadius:10}} onClick={onSubmit} variant="contained" color="primary" fullWidth>
          บันทึก
        </Button>
      </div>
      )}
    </div>
  )
}
