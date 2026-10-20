import { AxiosInstance, AxiosResponse } from 'axios'
import {
  getCustomerInstance,
  getCentralInstance,
  getProductInstance,
} from './AxiosUtils'
import { key } from '@/models/constant'
import { getLocalStorage } from './StorageUtils'

class ApiService {
  httpCustomer: AxiosInstance
  httpProduct: AxiosInstance
  httpCentral: AxiosInstance

  constructor() {
    this.httpCustomer = getCustomerInstance()
    this.httpProduct = getProductInstance()

    this.httpCentral = getCentralInstance()
  }

  async login(username: string, password: string): Promise<AxiosResponse<any>> {
    const payload = {
      email: username,
      password: password,
    }
    return await this.httpCustomer.post('/authentication', payload)
  }

  async register(
    type?: string,
    username?: string,
    password?: string,
    name?: string,
  ): Promise<AxiosResponse<any>> {
    const payload = {
      type: type,
      email: username,
      password: password,
      name: name,
    }
    return await this.httpCustomer.post('/customers', payload)
  }

  async getActivate(token: number): Promise<AxiosResponse<any>> {
    return await this.httpCustomer.get(`customers/activate/${token}`)
  }

  async creatForgotPassword(email: string): Promise<AxiosResponse<any>> {
    const payload = {
      email: email,
    }
    return await this.httpCustomer.post(`customers/forgotpassword`, payload)
  }

  async updateNewPassword(
    token: string,
    password?: string,
  ): Promise<AxiosResponse<any>> {
    const payload = {
      token: token,
      password: password,
    }
    return await this.httpCustomer.post(`customers/gennewpass`, payload)
  }

async getCustomer(id?: string): Promise<AxiosResponse<any> | null> {
  const token = getLocalStorage(key.TOKEN);

  if (!token || !id) {
    return null;
  }

  return await this.httpCustomer.get(`/customers/${id}`);
}

  async updateCustomer(id: string, payload: any): Promise<AxiosResponse<any>> {
    return await this.httpCustomer.patch(`/customers/${id}`, payload)
  }

  async getAddressBookList(): Promise<AxiosResponse<any>> {
    return await this.httpCustomer.get('/addressbooks')
  }

  async createAddressBook(payload: any): Promise<AxiosResponse<any>> {
    return await this.httpCustomer.post('/addressbooks', payload)
  }

  async updateAddressBook(
    id: string,
    payload: any,
  ): Promise<AxiosResponse<any>> {
    return await this.httpCustomer.patch(`/addressbooks/${id}`, payload)
  }

  async getProducts(
    search?: string,
    searchType?: string,
    start?: number,
    length?: number,
  ): Promise<AxiosResponse<any>> {
    if (search) {
      let url = `/products?${searchType}=${search}`
      if (start !== undefined && length !== undefined) {
        url += `&start=${start}&length=${length}`
      }
      return await this.httpCustomer.get(url)
    } else {
      return await this.httpCustomer.get('/products')
    }
  }

  async getProductsPromotion(
    search: string = '',
    start: number = 0,
    length: number = 25,
  ): Promise<AxiosResponse<any>> {
    return await this.httpCustomer.get('/products/promo', {
      params: {
        'search[value]': search,
        draw: '1',
        start,
        length,
      },
    })
  }

  async getProductsPromotionList(
    start: number = 0,
    length: number = 25,
  ): Promise<AxiosResponse<any>> {
    return await this.httpCustomer.get('/products/promo_list', {
      params: {
        draw: '1',
        start,
        length,
      },
    })
  }

  async getProductInfo(id: number): Promise<AxiosResponse<any>> {
    return await this.httpCustomer.get(`/products/${id}`)
  }

  async getOrderList(): Promise<AxiosResponse<any>> {
    return await this.httpCustomer.get('/order')
  }

  async getOrderInfo(id: string): Promise<AxiosResponse<any>> {
    return await this.httpCustomer.get(`/order/${id}`)
  }

  async getOrderTrackingInfo(payload: any): Promise<AxiosResponse<any>> {
    return await this.httpCustomer.get(`/trackinfo`, payload)
  }

  async getStationList(): Promise<AxiosResponse<any>> {
    return await this.httpCustomer.get('/station')
  }

  async getStationInfo(id: string): Promise<AxiosResponse<any>> {
    return await this.httpCustomer.get(`/station/${id}`)
  }

  async getPreStationList(): Promise<AxiosResponse<any>> {
    return await this.httpCustomer.get('/prestation')
  }

  async getPreStationInfo(id: string): Promise<AxiosResponse<any>> {
    return await this.httpCustomer.get(`/prestation/${id}`)
  }

  async addPreStation(payload: any): Promise<AxiosResponse<any>> {
    return await this.httpCustomer.post('/prestation', payload)
  }

  async getStockNew(): Promise<AxiosResponse<any>> {
    return await this.httpCustomer.get(`/products/new?type=set`)
  }

  async getBookShelf(): Promise<AxiosResponse<any>> {
    return await this.httpCustomer.get('/bookshelf')
  }

  async addBookShelf(payload: any): Promise<AxiosResponse<any>> {
    return await this.httpCustomer.post('/bookshelf', payload)
  }

  async getBookShelfInfo(shelf_id: string): Promise<AxiosResponse<any>> {
    return await this.httpCustomer.get(`/bookfav?shelf_id=${shelf_id}`)
  }

  async deleteFromShelf(
    book_id: string,
    payload: any,
  ): Promise<AxiosResponse<any>> {
    return await this.httpCustomer.delete(`/bookfav/${book_id}`, {
      data: payload,
    })
  }

  async deleteShelf(
    book_id: string,
    payload: any,
  ): Promise<AxiosResponse<any>> {
    return await this.httpCustomer.delete(`/bookshelf/${book_id}`, {
      data: payload,
    })
  }

  async editShelf(book_id: string, payload: any): Promise<AxiosResponse<any>> {
    return await this.httpCustomer.patch(`/bookshelf/${book_id}`, payload)
  }

  async getBookFavorites(search?: string): Promise<AxiosResponse<any>> {
    if (search) {
      return await this.httpCustomer.get(`/bookfav?keywords=${search}`)
    } else {
      return await this.httpCustomer.get(`/bookfav`)
    }
  }

  async addBookToShelf(
    book_id: string,
    payload: any,
  ): Promise<AxiosResponse<any>> {
    return await this.httpCustomer.post(`/bookfav/${book_id}`, payload)
  }

  async addBookToFavorites(payload: any): Promise<AxiosResponse<any>> {
    return await this.httpCustomer.post(`/bookfav`, payload)
  }

  async getBookToFavorites(book_id: string): Promise<AxiosResponse<any>> {
    return await this.httpCustomer.get(`/bookfav/${book_id}`)
  }
  async updateBookToShelf(
    book_id: any,
    payload: any,
  ): Promise<AxiosResponse<any>> {
    return await this.httpCustomer.patch(`/bookfav/${book_id}`, payload)
  }

  async deleteBook(book_id: any, payload?: any): Promise<AxiosResponse<any>> {
    return await this.httpCustomer.delete(`/bookfav/${book_id}`, {
      data: payload,
    })
  }
  async getCouponsList(): Promise<AxiosResponse<any>> {
    return await this.httpCustomer.get('/customer_coupon')
  }

  async getCouponsInfo(coupon_code: string): Promise<AxiosResponse<any>> {
    return await this.httpCustomer.get(`/customer_coupon/${coupon_code}`)
  }

  async getThailandAddressList(): Promise<AxiosResponse<any>> {
    return await this.httpCentral.get('/address/list')
  }
}

export default new ApiService()
