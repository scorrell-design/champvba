export interface Address {
  street: string
  street2?: string
  city: string
  state: string
  zip: string
}

export interface ContactInfo {
  phone1: string
  phone2?: string
  email1: string
  email2?: string
  fax?: string
  bestCallTime?: string
  doNotCall?: boolean
  emailOptOut?: boolean
}

export interface BillingContact {
  name: string
  address: string
  city: string
  state: string
  zip: string
  phone: string
  fax?: string
  email: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

export interface Note {
  id: string
  text: string
  author: string
  createdAt: string
  isAdmin: boolean
  type: 'History Note' | 'User Note' | 'Admin Only'
}
