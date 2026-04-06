import type { Group, PaymentProcessor } from '../types/group'
import { PRODUCTS } from './products'

function getProductsByTemplate(
  templateType: Group['templateType'],
) {
  const base = PRODUCTS.filter((p) => ['37618', '37680', '40624'].includes(p.productId))
  const hsa = PRODUCTS.find((p) => p.productId === '37700')!
  const firstStop = PRODUCTS.find((p) => p.productId === '37750')!

  switch (templateType) {
    case 'standard':
      return base
    case 'hsa':
      return [...base, hsa]
    case 'firstStop':
      return [...base, firstStop]
    case 'firstStopHsa':
      return [...base, hsa, firstStop]
  }
}

function listBillProcessor(
  id: string,
  linkedProducts: string[],
  active = true,
): PaymentProcessor {
  return {
    id,
    status: active ? 'Active' : 'Inactive',
    type: 'List Bill',
    adminLabel: 'List Bill – Employer Remittance',
    displayLabel: 'List Bill',
    processor: 'Internal',
    active,
    allowPayments: true,
    allowRefunds: false,
    displayOnFrontend: true,
    frontendCreateTransaction: false,
    markTransactionComplete: true,
    stickProcessorToMember: false,
    linkedProducts,
  }
}

const SHARED: Pick<
  Group,
  | 'groupType'
  | 'agentType'
  | 'invoiceTemplate'
  | 'ppoNetwork'
  | 'pbm'
  | 'section125PostTax'
  | 'dpc'
  | 'internalProcess'
  | 'enroller'
  | 'carrier'
  | 'hwTeleHealth'
  | 'wellnessVendor'
  | 'hwBehavioralHealth'
  | 'aciDivisionCode'
  | 'firstHealthAcroCode'
  | 'taxIdType'
  | 'denyMemberPortalAccess'
  | 'shortPlanYearDates'
> = {
  groupType: 'Employer',
  agentType: 'Independent',
  invoiceTemplate: 'Standard',
  ppoNetwork: 'First Health Network',
  pbm: 'CHAMP Rx',
  section125PostTax: 'Standard',
  dpc: 'N/A',
  internalProcess: 'Standard',
  enroller: 'Self-Enrolled',
  carrier: 'Champion Health',
  hwTeleHealth: true,
  wellnessVendor: 'HealthWorks',
  hwBehavioralHealth: false,
  aciDivisionCode: 'DIV-001',
  firstHealthAcroCode: 'FH-100',
  taxIdType: 'FEIN',
  denyMemberPortalAccess: false,
  shortPlanYearDates: 'N/A',
}

export const GROUPS: Group[] = [
  {
    ...SHARED,
    id: 'g-1',
    legalName: 'Apex Manufacturing LLC',
    dba: 'Apex Manufacturing',
    fein: '84-2917365',
    cbsGroupId: 'CBS-50201',
    wltGroupNumber: '10234',
    tpaGroupCode: 'TPA-1001',
    tmHwCode: 'HW-2201',
    groupBrokerId: 'GB-70101',
    status: 'Active',
    templateType: 'standard',
    firstStopHealth: false,
    hsaOffered: false,
    address: { street: '1420 Industrial Pkwy', city: 'Detroit', state: 'MI', zip: '48201' },
    contact: {
      phone1: '(313) 555-0140',
      email1: 'benefits@apexmfg.com',
      fax: '(313) 555-0141',
    },
    primaryContactName: 'Janet Kowalski',
    primaryContactEmail: 'janet.kowalski@apexmfg.com',
    agentName: 'Marcus Webb',
    agentNumber: 'A-7821',
    agentCompany: 'Pinnacle Benefits Group',
    agentPhone: '(313) 555-7821',
    agentEmail: 'mwebb@pinnaclebenefits.com',
    createdDate: '2024-03-15',
    activeDate: '2024-04-01',
    benefitsEffectiveDate: '2024-04-01',
    memberCount: 23,
    products: getProductsByTemplate('standard'),
    paymentProcessors: [listBillProcessor('pp-1', ['37618', '37680', '40624'])],
    notes: [
      {
        id: 'n-g1-1',
        text: 'Annual renewal completed. No plan design changes for 2025.',
        author: 'Stephanie C.',
        createdAt: '2025-01-10T14:30:00Z',
        isAdmin: true,
        type: 'Admin Only',
      },
      {
        id: 'n-g1-2',
        text: 'Employer requested updated census report for Q1 2025.',
        author: 'Tori M.',
        createdAt: '2025-03-05T09:15:00Z',
        isAdmin: false,
        type: 'History Note',
      },
    ],
  },
  {
    ...SHARED,
    id: 'g-2',
    legalName: 'Redwood Financial Services',
    dba: 'Redwood Financial',
    fein: '91-5028374',
    cbsGroupId: 'CBS-50202',
    wltGroupNumber: '10235',
    tpaGroupCode: 'TPA-1002',
    tmHwCode: 'HW-2202',
    groupBrokerId: 'GB-70102',
    status: 'Active',
    templateType: 'hsa',
    firstStopHealth: false,
    hsaOffered: true,
    address: { street: '2800 Sequoia Blvd', street2: 'Ste 400', city: 'San Francisco', state: 'CA', zip: '94104' },
    contact: {
      phone1: '(415) 555-2800',
      email1: 'hr@redwoodfinancial.com',
    },
    primaryContactName: 'Alan Gerber',
    primaryContactEmail: 'alan.gerber@redwoodfinancial.com',
    agentName: 'Diana Cho',
    agentNumber: 'A-4456',
    agentCompany: 'Pacific Brokers Alliance',
    agentPhone: '(415) 555-4456',
    agentEmail: 'dcho@pacificbrokers.com',
    createdDate: '2024-06-10',
    activeDate: '2024-07-01',
    benefitsEffectiveDate: '2024-07-01',
    memberCount: 31,
    products: getProductsByTemplate('hsa'),
    paymentProcessors: [listBillProcessor('pp-2', ['37618', '37680', '40624', '37700'])],
    notes: [
      {
        id: 'n-g2-1',
        text: 'HSA custodian verified: HealthEquity. Funding schedule confirmed.',
        author: 'Kacy L.',
        createdAt: '2024-07-02T11:00:00Z',
        isAdmin: true,
        type: 'Admin Only',
      },
    ],
  },
  {
    ...SHARED,
    id: 'g-3',
    legalName: 'Coastal Logistics Group',
    dba: 'Coastal Logistics',
    fein: '36-7194820',
    cbsGroupId: 'CBS-50203',
    wltGroupNumber: '10236',
    tpaGroupCode: 'TPA-1003',
    tmHwCode: 'HW-2203',
    groupBrokerId: 'GB-70103',
    status: 'Active',
    templateType: 'firstStop',
    firstStopHealth: true,
    hsaOffered: false,
    address: { street: '755 Harbor Dr', city: 'Charleston', state: 'SC', zip: '29401' },
    contact: {
      phone1: '(843) 555-0755',
      email1: 'admin@coastallogistics.com',
      fax: '(843) 555-0756',
    },
    primaryContactName: 'Denise Harmon',
    primaryContactEmail: 'denise.harmon@coastallogistics.com',
    agentName: 'Kevin Briggs',
    agentNumber: 'A-6103',
    agentCompany: 'Southeast Benefits Consulting',
    agentPhone: '(843) 555-6103',
    agentEmail: 'kbriggs@sebenefits.com',
    createdDate: '2024-01-20',
    activeDate: '2024-02-01',
    benefitsEffectiveDate: '2024-02-01',
    memberCount: 18,
    products: getProductsByTemplate('firstStop'),
    paymentProcessors: [listBillProcessor('pp-3', ['37618', '37680', '40624', '37750'])],
    notes: [
      {
        id: 'n-g3-1',
        text: 'First Stop Health enrollment window opened March 1. Agent confirmed participation.',
        author: 'Lillie R.',
        createdAt: '2025-03-01T08:45:00Z',
        isAdmin: false,
        type: 'History Note',
      },
      {
        id: 'n-g3-2',
        text: 'Billing discrepancy resolved for Feb 2025 invoice. Credit applied.',
        author: 'Stephanie C.',
        createdAt: '2025-03-12T16:20:00Z',
        isAdmin: true,
        type: 'Admin Only',
      },
    ],
  },
  {
    ...SHARED,
    id: 'g-4',
    legalName: 'Summit Healthcare Partners',
    dba: 'Summit Healthcare',
    fein: '47-8305162',
    cbsGroupId: 'CBS-50204',
    wltGroupNumber: '10237',
    tpaGroupCode: 'TPA-1004',
    tmHwCode: 'HW-2204',
    groupBrokerId: 'GB-70104',
    status: 'Active',
    templateType: 'firstStopHsa',
    firstStopHealth: true,
    hsaOffered: true,
    address: { street: '3100 Peak View Rd', city: 'Denver', state: 'CO', zip: '80202' },
    contact: {
      phone1: '(720) 555-3100',
      email1: 'benefits@summithcp.com',
    },
    primaryContactName: 'Roger Muñoz',
    primaryContactEmail: 'roger.munoz@summithcp.com',
    agentName: 'Sarah Okafor',
    agentNumber: 'A-5590',
    agentCompany: 'Mountain West Insurance',
    agentPhone: '(720) 555-5590',
    agentEmail: 'sokafor@mtnwestins.com',
    createdDate: '2024-09-05',
    activeDate: '2024-10-01',
    benefitsEffectiveDate: '2024-10-01',
    memberCount: 12,
    products: getProductsByTemplate('firstStopHsa'),
    paymentProcessors: [
      listBillProcessor('pp-4a', ['37618', '37680', '40624', '37700']),
      listBillProcessor('pp-4b', ['37750']),
    ],
    notes: [
      {
        id: 'n-g4-1',
        text: 'Dual processor setup for First Stop isolation per compliance requirement.',
        author: 'Kacy L.',
        createdAt: '2024-10-02T10:00:00Z',
        isAdmin: true,
        type: 'Admin Only',
      },
    ],
  },
  {
    ...SHARED,
    id: 'g-5',
    legalName: 'Prairie Wind Energy Co.',
    dba: 'Prairie Wind Energy',
    fein: '55-2048791',
    cbsGroupId: 'CBS-50205',
    wltGroupNumber: '10238',
    tpaGroupCode: 'TPA-1005',
    tmHwCode: 'HW-2205',
    groupBrokerId: 'GB-70105',
    status: 'Pending Setup',
    templateType: 'standard',
    firstStopHealth: false,
    hsaOffered: false,
    address: { street: '601 Turbine Ln', city: 'Wichita', state: 'KS', zip: '67202' },
    contact: {
      phone1: '(316) 555-0601',
      email1: 'hr@prairiewind.energy',
    },
    primaryContactName: 'Beth Langford',
    primaryContactEmail: 'beth.langford@prairiewind.energy',
    agentName: 'Tom Hendricks',
    agentNumber: 'A-8912',
    agentCompany: 'Heartland Brokers',
    agentPhone: '(316) 555-8912',
    agentEmail: 'thendricks@heartlandbrokers.com',
    createdDate: '2025-03-01',
    activeDate: '',
    benefitsEffectiveDate: '2025-05-01',
    memberCount: 0,
    products: getProductsByTemplate('standard'),
    paymentProcessors: [listBillProcessor('pp-5', ['37618', '37680', '40624'], false)],
    notes: [
      {
        id: 'n-g5-1',
        text: 'Implementation in progress. Agent submitting census by April 15.',
        author: 'Tori M.',
        createdAt: '2025-03-15T13:00:00Z',
        isAdmin: false,
        type: 'History Note',
      },
    ],
  },
  {
    ...SHARED,
    id: 'g-6',
    legalName: 'Ironbridge Construction Inc.',
    dba: 'Ironbridge Construction',
    fein: '73-4162058',
    cbsGroupId: 'CBS-50206',
    wltGroupNumber: '10239',
    tpaGroupCode: 'TPA-1006',
    tmHwCode: 'HW-2206',
    groupBrokerId: 'GB-70106',
    status: 'Inactive',
    templateType: 'standard',
    firstStopHealth: false,
    hsaOffered: false,
    address: { street: '890 Steel Works Ave', city: 'Pittsburgh', state: 'PA', zip: '15201' },
    contact: {
      phone1: '(412) 555-0890',
      email1: 'payroll@ironbridgeinc.com',
    },
    primaryContactName: 'Victor Brandt',
    primaryContactEmail: 'victor.brandt@ironbridgeinc.com',
    agentName: 'Rachel Dunn',
    agentNumber: 'A-3347',
    agentCompany: 'Steel City Benefits',
    agentPhone: '(412) 555-3347',
    agentEmail: 'rdunn@steelcitybenefits.com',
    createdDate: '2024-01-10',
    activeDate: '2024-02-01',
    inactiveDate: '2025-01-31',
    benefitsEffectiveDate: '2024-02-01',
    memberCount: 8,
    products: getProductsByTemplate('standard'),
    paymentProcessors: [listBillProcessor('pp-6', ['37618', '37680', '40624'], false)],
    notes: [
      {
        id: 'n-g6-1',
        text: 'Group terminated effective 1/31/2025. All members moved to terminated status.',
        author: 'Stephanie C.',
        createdAt: '2025-01-31T17:00:00Z',
        isAdmin: true,
        type: 'Admin Only',
      },
      {
        id: 'n-g6-2',
        text: 'Final invoice reconciliation completed. Outstanding balance $0.',
        author: 'Lillie R.',
        createdAt: '2025-02-15T10:30:00Z',
        isAdmin: true,
        type: 'Admin Only',
      },
    ],
  },
]
