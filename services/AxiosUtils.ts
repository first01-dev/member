import axios from 'axios'
import toast from 'react-hot-toast'
import { clearAllLocalStorage, clearLocalStorage, getLocalStorage } from '@/services/StorageUtils'
import { key } from '@/models/constant'
import router from 'next/router'

export function getCustomerInstance() {
  const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
  })

  

  instance.interceptors.request.use(
    (config) => {
      const token = getLocalStorage(key.TOKEN)

      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }

      return config
    },
    (error) => {
      return Promise.reject(error)
    },
  )


instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearLocalStorage(key.TOKEN);
      clearLocalStorage(key.CUSTOMER);

      // ไม่แสดง Toast ซ้ำทุกครั้งที่ API ตอบ 401
      // ให้หน้าที่ตรวจสอบสถานะ Login จัดการ redirect
    }

    return Promise.reject(error);
  },
);


  return instance
}

export function getProductInstance() {
  const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers : {
        'Content-Type': 'application/json'
      }
  })

  

  instance.interceptors.response.use(
    (response) => {
      return response
    },
    (error) => {
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.')
        localStorage.removeItem(key.TOKEN)

        
      }

      return Promise.reject(error)
    },
  
  )

  instance.interceptors.response.use(
    (response) => {
      return response
    },
    (error) => {
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.')
        localStorage.removeItem(key.TOKEN)

        
      }

      return Promise.reject(error)
    },
  )

  return instance
}

export function getCentralInstance() {
  const instance = axios.create({
    baseURL: 'https://api-pos-uat.bestcommercesolutions.com',
  })

  instance.interceptors.request.use(
    (config) => {
      config.headers.Authorization = `Bearer yr^voVolfSx8Xn*^`
      return config
    },
    (error) => {
      return Promise.reject(error)
    },
  )

  instance.interceptors.response.use(
    (response) => {
      return response
    },
    (error) => {
      if (error.response && error.response.status === 401) {
  clearAllLocalStorage()

  toast.error('Session expired. Please log in again.')
  router.push('/login/')
}
      return Promise.reject(error)
    },
  )

  return instance
}

