import type { ProductStatus } from '../utils/constants'

export interface Product {
  id: string
  productId: string
  name: string
  category: string
  monthlyFee: number
  status: ProductStatus
  commissionable: boolean
  websiteDisplay: boolean
  websiteOrder: number
}

export interface MemberProduct {
  id: string
  productId: string
  name: string
  category: string
  fee: number
  period: string
  benefitTier: string
  status: ProductStatus
  createdDate: string
  activeDate: string | null
  inactiveDate: string | null
  paidThrough: string | null
  paidStatus: boolean
  paymentsCount: number
  commissions?: ProductCommission[]
}

export interface ProductCommission {
  agentId: string
  agentName: string
  type: 'flat' | 'percentage'
  amount: number
  effectiveDate: string
  notes?: string
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
