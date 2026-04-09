export interface CommissionPayout {
  brokerName: string
  brokerId: string
  payoutType: 'percent' | 'dollar'
  amount: number
}

export interface DynamicPayout {
  payTo: string
  payoutType: 'percent' | 'dollar'
  amount: number
}

export interface CommissionFilters {
  priceType: string
  benefit: string
  paymentPeriod: string
  priceRecord: string
}

export interface ProductCommission {
  groupId: string
  productId: string
  brokerPayouts: CommissionPayout[]
  dynamicPayouts: DynamicPayout[]
  filters: CommissionFilters
}

export const COMMISSIONS: ProductCommission[] = [
  {
    groupId: 'g-1',
    productId: '37618',
    brokerPayouts: [
      { brokerName: 'Concierge Benefit Services', brokerId: '113017', payoutType: 'percent', amount: 0 },
      { brokerName: 'CBS Internal Admin Level (CBS Broker)', brokerId: '115243', payoutType: 'dollar', amount: 54 },
      { brokerName: 'Champion Health (MAIN)', brokerId: '636851', payoutType: 'dollar', amount: 45 },
      { brokerName: 'Marcus Webb', brokerId: 'A-7821', payoutType: 'dollar', amount: 0 },
      { brokerName: 'Pinnacle Benefits Group', brokerId: 'GB-70101', payoutType: 'dollar', amount: 54 },
    ],
    dynamicPayouts: [
      { payTo: 'Enroller for Member Product', payoutType: 'percent', amount: 0 },
      { payTo: 'Assigned for Member Product', payoutType: 'percent', amount: 0 },
    ],
    filters: {
      priceType: 'Product',
      benefit: 'Employee Only',
      paymentPeriod: 'Monthly',
      priceRecord: 'Product - $44.00 per Month for Employee Only',
    },
  },
  {
    groupId: 'g-1',
    productId: '37680',
    brokerPayouts: [
      { brokerName: 'Concierge Benefit Services', brokerId: '113017', payoutType: 'percent', amount: 0 },
      { brokerName: 'CBS Internal Admin Level (CBS Broker)', brokerId: '115243', payoutType: 'dollar', amount: 70 },
      { brokerName: 'Champion Health (MAIN)', brokerId: '636851', payoutType: 'dollar', amount: 45 },
      { brokerName: 'Marcus Webb', brokerId: 'A-7821', payoutType: 'dollar', amount: 0 },
      { brokerName: 'Pinnacle Benefits Group', brokerId: 'GB-70101', payoutType: 'dollar', amount: 70 },
    ],
    dynamicPayouts: [
      { payTo: 'Enroller for Member Product', payoutType: 'percent', amount: 0 },
      { payTo: 'Assigned for Member Product', payoutType: 'percent', amount: 0 },
    ],
    filters: {
      priceType: 'Product',
      benefit: 'Employee Only',
      paymentPeriod: 'Monthly',
      priceRecord: 'Product - $70.00 per Month for Employee Only',
    },
  },
  {
    groupId: 'g-2',
    productId: '37618',
    brokerPayouts: [
      { brokerName: 'Concierge Benefit Services', brokerId: '113017', payoutType: 'percent', amount: 0 },
      { brokerName: 'CBS Internal Admin Level (CBS Broker)', brokerId: '115243', payoutType: 'dollar', amount: 44 },
      { brokerName: 'Champion Health (MAIN)', brokerId: '636851', payoutType: 'dollar', amount: 40 },
      { brokerName: 'Diana Cho', brokerId: 'A-4456', payoutType: 'dollar', amount: 5 },
      { brokerName: 'Pacific Brokers Alliance', brokerId: 'GB-70102', payoutType: 'dollar', amount: 44 },
    ],
    dynamicPayouts: [
      { payTo: 'Enroller for Member Product', payoutType: 'percent', amount: 0 },
      { payTo: 'Assigned for Member Product', payoutType: 'percent', amount: 0 },
    ],
    filters: {
      priceType: 'Product',
      benefit: 'Employee Only',
      paymentPeriod: 'Monthly',
      priceRecord: 'Product - $44.00 per Month for Employee Only',
    },
  },
  {
    groupId: 'g-2',
    productId: '40624',
    brokerPayouts: [
      { brokerName: 'Concierge Benefit Services', brokerId: '113017', payoutType: 'percent', amount: 0 },
      { brokerName: 'CBS Internal Admin Level (CBS Broker)', brokerId: '115243', payoutType: 'dollar', amount: 120 },
      { brokerName: 'Champion Health (MAIN)', brokerId: '636851', payoutType: 'dollar', amount: 100 },
      { brokerName: 'Diana Cho', brokerId: 'A-4456', payoutType: 'dollar', amount: 10 },
      { brokerName: 'Pacific Brokers Alliance', brokerId: 'GB-70102', payoutType: 'dollar', amount: 120 },
    ],
    dynamicPayouts: [
      { payTo: 'Enroller for Member Product', payoutType: 'percent', amount: 0 },
      { payTo: 'Assigned for Member Product', payoutType: 'percent', amount: 0 },
    ],
    filters: {
      priceType: 'Product',
      benefit: 'Employee Only',
      paymentPeriod: 'Monthly',
      priceRecord: 'Product - $120.00 per Month for Employee Only',
    },
  },
]

export function getCommission(groupId: string, productId: string): ProductCommission | undefined {
  return COMMISSIONS.find((c) => c.groupId === groupId && c.productId === productId)
}
