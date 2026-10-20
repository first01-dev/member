interface AddressLocation {
  name: string
}

export interface SubDistrict extends AddressLocation {
  zip_code: string
}

export interface District extends AddressLocation {
  sub_district: SubDistrict[]
}

export interface Province extends AddressLocation {
  district: District[]
}