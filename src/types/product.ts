import type { ProductStatus } from '../utils/constants'

export interface Product {
  id: string
  productId: string
  name: string
  adminLabel?: string
  category: string
  monthlyFee: number
  status: ProductStatus
  commissionable: boolean
  websiteDisplay: boolean
  websiteOrder: number
}

export interface MemberProduct {
  id?: string
  productId: string
  name: string
  adminLabel?: string
  category: string
  fee: number
  period?: string
  benefitTier?: string
  status: ProductStatus
  cbsMemberNumber?: string
  anticipatedDate?: string | null
  createdDate?: string
  activeDate?: string | null
  inactiveDate?: string | null
  inactiveReason?: string
  paidThrough?: string | null
  paidStatus?: boolean
  paymentsCount?: number
  commissionable?: boolean
  isOverride?: boolean
}

export interface ProductTemplate {
  name: string
  hsa: boolean
  firstStop: boolean
  products: {
    productId: string
    name: string
    monthlyFee: number
  }[]
}
