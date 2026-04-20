export interface Commission {
  id: string
  groupId: string
  productId: string
  agentId: string
  agentName: string
  agentType: 'agent' | 'broker' | 'enroller' | 'internal'
  payoutType: 'flat' | 'percentage'
  amount: number
  effectiveDate: string
  endDate?: string
  filters?: {
    priceType?: string
    benefitTier?: 'Employee Only' | 'EE+Spouse' | 'EE+Child' | 'Family'
    paymentPeriod?: 'Monthly' | 'Quarterly' | 'Annually'
  }
  notes?: string
  createdBy: string
  createdAt: string
  lastModifiedBy?: string
  lastModifiedAt?: string
}

export interface CopyCommissionsParams {
  fromGroupId: string
  fromProductIds?: string[]
  toGroupIds: string[]
  mode: 'merge' | 'replace'
  previewOnly?: boolean
}

export interface CopyCommissionsResult {
  wouldAdd: number
  wouldRemove: number
  copied: number
  errors: string[]
}
