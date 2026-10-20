import router from 'next/router'
import toast from 'react-hot-toast'
import { clearAllLocalStorage } from './StorageUtils'

const initAutoLogout = () => {
  const timer = setInterval(() => {
    clearAllLocalStorage()

    toast.error('Session expired. Please log in again.')
  }, 48 * 60 * 60 * 1000)

  return () => clearInterval(timer)
}

export default initAutoLogout