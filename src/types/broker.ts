export interface Broker {
  id: string
  name: string
  agentNumber: string
  company: string
  phone: string
  email: string
  address?: {
    street: string
    city: string
    state: string
    zip: string
  }
  tinNpiCode?: string
  agentType: 'main' | 'parent' | 'individual'
  parentBrokerId: string | null
  childBrokerIds: string[]
  status: 'Active' | 'Inactive'
  associatedGroupIds: string[]
  commissionRate?: number
}
