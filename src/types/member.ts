import type { Address, Note } from './common'
import type { MemberProduct } from './product'
import type { MemberStatus, MemberType, HoldReason } from '../utils/constants'

export type DependentRelationship = 'Spouse' | 'Child' | 'Domestic Partner' | 'Other'
export type MemberRelationship = 'Primary' | 'Spouse' | 'Child' | 'Domestic Partner'

export interface Dependent {
  id: string
  firstName: string
  lastName: string
  relationship: DependentRelationship
  dob: string
  ssn?: string
  gender: string
  status: 'Active' | 'Inactive'
  effectiveDate: string
  sameAddressAsMember: boolean
  address?: Address
  memberId?: string
}

export interface Member {
  id: string
  memberId: string
  firstName: string
  lastName: string
  middleInitial?: string
  ssn: string
  dob: string
  age: number
  gender: string
  email: string
  phone: string
  address: Address
  employeeId: string
  agentId: string
  groupId: string
  groupName: string
  status: MemberStatus
  type: MemberType
  vbaEligible: boolean
  holdReason?: HoldReason
  optIn: boolean
  coverageEffectiveDate: string
  createdDate: string
  activeDate: string | null
  inactiveDate: string | null
  inactiveReason?: string
  products: MemberProduct[]
  notes: Note[]
  dependents: Dependent[]
  ipAddress?: string
  isAppUser: boolean
  relationship: MemberRelationship
  primaryMemberId?: string | null
  mergedIntoMemberId?: string | null
  mergedFromMemberIds?: string[]
  mergedAt?: string | null
  mergedBy?: string | null
}
