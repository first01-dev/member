interface ProductItem {
   _id?: any
  id?: number
  shelf_id?: string
  name: string
  picture?: string
  barcode?: string
  isbn?: string
  ref_code?: string
  price?: string
  quantity?: number
  status?: string
  publisher?: any
  release_on?: string
  writer?: string
  detail?: string
  product_name?:string
  product_barcode?:string
  product_quantity?:string
  added_time?: string

}

interface StationList {
  id: number
  phone: string
  code: string
  items: ProductItem[]
}

interface EditUser {
  id?: number
  _method?: 'PATCH'
  name: string
  email: string
  phone: string
  password?: string
  bod: Date | string | null
  gender: string
  current:number
}

interface AddressBook {
  _id?: string
  name: string
  address: string
  sub_district: string
  district: string
  province: string
  post_code: string
  phone?: string
  current?: number
  editingStationId?: string
}

interface Session {
  user: {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

interface Coupons {
  id: string
    code: string
    count_remain?: number
    discount_max?: string | null
    discount_type?: string | null
    discount_value: string
    expire_on?: string | null
    rule:any
    status?: string
    start_on?: string | null
    channel?: string | null
}

interface CartItem {
  added_time?: string
  id: any
  name: string
  picture: string
  barcode?: string
  ref?: string
  price?: string
  quantity?: number
}

export type { ProductItem, StationList, EditUser, AddressBook, Session , Coupons, CartItem }
