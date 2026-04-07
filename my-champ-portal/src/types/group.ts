import type { Address, BillingContact, ContactInfo, Note } from './common'
import type { Product } from './product'
import type { GroupStatus } from '../utils/constants'

export interface PaymentProcessor {
  id: string
  status: 'Active' | 'Inactive'
  type: string
  adminLabel: string
  displayLabel: string
  processor: string
  active: boolean
  allowPayments: boolean
  allowRefunds: boolean
  displayOnFrontend: boolean
  frontendCreateTransaction: boolean
  markTransactionComplete: boolean
  stickProcessorToMember: boolean
  linkedProducts: string[]
}

export interface Group {
  id: string
  legalName: string
  dba: string
  fein: string
  cbsGroupId: string
  wltGroupNumber: string
  tpaGroupCode: string
  tmHwCode: string
  groupBrokerId: string
  status: GroupStatus
  groupType: string
  agentType: string
  address: Address
  secondaryAddress?: Address
  contact: ContactInfo
  billingContact?: BillingContact
  primaryContactName: string
  primaryContactEmail: string
  invoiceTemplate: string
  ppoNetwork: string
  pbm: string
  section125PostTax: string
  dpc: string
  internalProcess: string
  enroller: string
  carrier: string
  hwTeleHealth: boolean
  wellnessVendor: string
  hwBehavioralHealth: boolean
  isVBA: boolean
  firstStopHealth: boolean
  hasFirstStopHealth: boolean
  hsaOffered: boolean
  hasHSA: boolean
  aciDivisionCode: string
  firstHealthAcroCode: string
  taxIdType: string
  denyMemberPortalAccess: boolean
  shortPlanYearDates: string
  websiteUrl?: string
  managementUrl?: string
  domainName?: string
  secureDomainName?: string
  parentGroupId?: string
  agentName: string
  agentNumber: string
  agentCompany: string
  agentPhone: string
  agentEmail: string
  createdDate: string
  activeDate: string
  inactiveDate?: string
  benefitsEffectiveDate: string
  memberCount: number
  products: Product[]
  paymentProcessors: PaymentProcessor[]
  notes: Note[]
  templateType: 'standard' | 'hsa' | 'firstStop' | 'firstStopHsa'
}
