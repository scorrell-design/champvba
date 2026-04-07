export interface RFCAgent {
  firstName: string
  lastName: string
  agentNumber: string
  company: string
  phone: string
  email: string
  tinNpiCode?: string
}

export interface RFCContact {
  name: string
  email: string
}

export interface RFCEligibilityContact {
  email: string
  phone: string
}

export interface RFCBillingContact {
  name: string
  address?: string
  city?: string
  state?: string
  zip?: string
  phone?: string
  fax?: string
  email?: string
}

export type RFCStatus = 'new' | 'in_review' | 'ready_to_build' | 'completed'

export interface RFC {
  id: string
  status: RFCStatus
  dateSubmitted: string

  agent: RFCAgent

  legalName: string
  dba?: string
  fein: string

  address: {
    street: string
    street2?: string
    city: string
    state: string
    zip: string
  }

  phone: string
  primaryContact: RFCContact
  eligibilityContact?: RFCEligibilityContact
  billingContact?: RFCBillingContact

  hsaFlag: 'yes' | 'no' | 'unsure'
  firstStopHealthFlag: boolean

  ppoNetwork: string
  pbm?: string

  groupType?: string
  section125PostTax?: string
}
