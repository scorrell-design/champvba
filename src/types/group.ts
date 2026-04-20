import type { Address, BillingContact, ContactInfo, Note } from './common'
import type { Product } from './product'
import type { GroupStatus } from '../utils/constants'

export interface Group {
  id: string
  legalName: string
  dba: string
  fein: string
  cbsGroupId: string
  wltGroupNumber: string
  tpaGroupCode: string
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
  wellnessVendor: string
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
  parentGroupId?: string | null
  childGroupIds: string[]
  isParentGroup: boolean
  locationName?: string | null
  agentName: string
  agentNumber: string
  agentCompany: string
  agentPhone: string
  agentEmail: string
  createdDate: string
  activeDate: string
  inactiveDate?: string
  benefitsEffectiveDate: string
  anticipatedDate: string
  planStartDate: string
  planEndDate: string
  openEnrollmentStartDate: string
  openEnrollmentEndDate: string
  isOpenEnrollment: boolean
  memberCount: number
  products: Product[]
  notes: Note[]
  tags: string[]
  templateType: 'standard' | 'hsa' | 'firstStop' | 'firstStopHsa'
  eligibilityContact?: {
    name: string
    email: string
    phone?: string
    title?: string
  }
}
