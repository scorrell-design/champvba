import type { Member } from '../types/member'
import type { MemberProduct } from '../types/product'
import type { Note } from '../types/common'
import type { MemberStatus, MemberType, HoldReason } from '../utils/constants'
import { PRODUCT_TEMPLATES } from './products'

const GROUP_CFG = [
  { groupId: 'g-1', groupName: 'Apex Manufacturing LLC', domain: 'apexmfg.com', agentId: 'A-7821', template: 'standard' as const, effectiveDate: '2024-04-01', createdDate: '2024-03-20' },
  { groupId: 'g-2', groupName: 'Redwood Financial Services', domain: 'redwoodfinancial.com', agentId: 'A-4456', template: 'hsa' as const, effectiveDate: '2024-07-01', createdDate: '2024-06-15' },
  { groupId: 'g-3', groupName: 'Coastal Logistics Group', domain: 'coastallogistics.com', agentId: 'A-6103', template: 'firstStop' as const, effectiveDate: '2024-02-01', createdDate: '2024-01-22' },
  { groupId: 'g-4', groupName: 'Summit Healthcare Partners', domain: 'summithcp.com', agentId: 'A-5590', template: 'firstStopHsa' as const, effectiveDate: '2024-10-01', createdDate: '2024-09-10' },
  { groupId: 'g-5', groupName: 'Prairie Wind Energy Co.', domain: 'prairiewind.energy', agentId: 'A-8912', template: 'standard' as const, effectiveDate: '2025-05-01', createdDate: '2025-03-05' },
  { groupId: 'g-6', groupName: 'Ironbridge Construction Inc.', domain: 'ironbridgeinc.com', agentId: 'A-3347', template: 'standard' as const, effectiveDate: '2024-02-01', createdDate: '2024-01-12' },
] as const

const CATEGORY_MAP: Record<string, string> = {
  '37618': 'Employer Fee',
  '37680': 'Section 125',
  '40624': 'Claims Funding',
  '37700': 'HSA',
  '37750': 'First Stop Health',
}

function monthsBetween(start: string, end: string): number {
  const [sy, sm] = start.split('-').map(Number)
  const [ey, em] = end.split('-').map(Number)
  return (ey - sy) * 12 + (em - sm)
}

function buildMemberProducts(
  memberIdx: number,
  templateType: 'standard' | 'hsa' | 'firstStop' | 'firstStopHsa',
  effectiveDate: string,
  isActive: boolean,
  inactiveDate: string | null,
): MemberProduct[] {
  const template = PRODUCT_TEMPLATES[templateType]
  const endDate = isActive ? '2026-04-01' : (inactiveDate ?? effectiveDate)
  const payments = Math.max(0, monthsBetween(effectiveDate, endDate))

  return template.products.map((p, i) => ({
    id: `mp-${memberIdx}-${i}`,
    productId: p.productId,
    name: p.name,
    category: CATEGORY_MAP[p.productId],
    fee: p.monthlyFee,
    period: 'Monthly',
    benefitTier: 'Employee Only',
    status: isActive ? 'Active' as const : 'Inactive' as const,
    createdDate: effectiveDate,
    activeDate: effectiveDate,
    inactiveDate: isActive ? null : inactiveDate,
    paidThrough: isActive ? '2026-03-31' : inactiveDate,
    paidStatus: isActive,
    paymentsCount: payments,
  }))
}

interface Seed {
  firstName: string
  lastName: string
  mi?: string
  gender: string
  dob: string
  age: number
  ssn: string
  status: MemberStatus
  type: MemberType
  gIdx: number
  employeeId: string
  phone: string
  street: string
  city: string
  state: string
  zip: string
  holdReason?: HoldReason
  inactiveDate?: string
  inactiveReason?: string
  notes?: { text: string; author: string; date: string; type: Note['type'] }[]
}

function buildMember(seed: Seed, index: number): Member {
  const cfg = GROUP_CFG[seed.gIdx]
  const isActive = seed.status === 'Active' || seed.status === 'On Hold'
  const email = `${seed.firstName.toLowerCase()}.${seed.lastName.toLowerCase()}@${cfg.domain}`

  return {
    id: `m-${index + 1}`,
    memberId: `M-48${String(index + 1).padStart(3, '0')}`,
    firstName: seed.firstName,
    lastName: seed.lastName,
    middleInitial: seed.mi,
    ssn: seed.ssn,
    dob: seed.dob,
    age: seed.age,
    gender: seed.gender,
    email,
    phone: seed.phone,
    address: { street: seed.street, city: seed.city, state: seed.state, zip: seed.zip },
    employeeId: seed.employeeId,
    agentId: cfg.agentId,
    groupId: cfg.groupId,
    groupName: cfg.groupName,
    status: seed.status,
    type: seed.type,
    vbaEligible: seed.type === 'VBA',
    holdReason: seed.holdReason,
    optIn: isActive,
    coverageEffectiveDate: cfg.effectiveDate,
    createdDate: cfg.createdDate,
    activeDate: isActive ? cfg.effectiveDate : null,
    inactiveDate: seed.inactiveDate ?? null,
    inactiveReason: seed.inactiveReason,
    products: buildMemberProducts(
      index + 1,
      cfg.template,
      cfg.effectiveDate,
      isActive,
      seed.inactiveDate ?? null,
    ),
    notes: (seed.notes ?? []).map((n, ni) => ({
      id: `n-m${index + 1}-${ni + 1}`,
      text: n.text,
      author: n.author,
      createdAt: n.date,
      isAdmin: n.type === 'Admin Only',
      type: n.type,
    })),
  }
}

const SEEDS: Seed[] = [
  // ── Apex Manufacturing (gIdx 0, standard, Detroit MI) ──────────────
  { firstName: 'James', lastName: 'Wilson', mi: 'R', gender: 'Male', dob: '1978-03-14', age: 48, ssn: '449774561', status: 'Active', type: 'Non-VBA', gIdx: 0, employeeId: 'EMP-4001', phone: '(313) 555-1001', street: '742 Maple St', city: 'Detroit', state: 'MI', zip: '48204' },
  { firstName: 'Maria', lastName: 'Gonzalez', gender: 'Female', dob: '1985-07-22', age: 40, ssn: '512839274', status: 'Active', type: 'VBA', gIdx: 0, employeeId: 'EMP-4002', phone: '(313) 555-1002', street: '1580 Gratiot Ave', city: 'Detroit', state: 'MI', zip: '48207' },
  { firstName: 'Tyrone', lastName: 'Jackson', mi: 'D', gender: 'Male', dob: '1972-11-05', age: 53, ssn: '378451926', status: 'Active', type: 'Non-VBA', gIdx: 0, employeeId: 'EMP-4003', phone: '(313) 555-1003', street: '309 Cass Ave', city: 'Detroit', state: 'MI', zip: '48201', notes: [{ text: 'Called to update mailing address per relocation within metro area.', author: 'Tori M.', date: '2025-11-18T09:30:00Z', type: 'History Note' }] },
  { firstName: 'Emily', lastName: 'Chen', gender: 'Female', dob: '1990-02-18', age: 36, ssn: '601283745', status: 'Active', type: 'Non-VBA', gIdx: 0, employeeId: 'EMP-4004', phone: '(313) 555-1004', street: '2271 Michigan Ave', city: 'Dearborn', state: 'MI', zip: '48124' },
  { firstName: 'Robert', lastName: 'Williams', mi: 'E', gender: 'Male', dob: '1968-09-30', age: 57, ssn: '283917456', status: 'Active', type: 'VBA', gIdx: 0, employeeId: 'EMP-4005', phone: '(313) 555-1005', street: '4520 Woodward Ave', city: 'Detroit', state: 'MI', zip: '48201' },
  { firstName: 'Aaliyah', lastName: 'Brown', gender: 'Female', dob: '1993-06-12', age: 32, ssn: '547192834', status: 'Active', type: 'Non-VBA', gIdx: 0, employeeId: 'EMP-4006', phone: '(313) 555-1006', street: '885 Livernois Ave', city: 'Detroit', state: 'MI', zip: '48209' },
  { firstName: 'David', lastName: 'Kim', gender: 'Male', dob: '1981-01-25', age: 45, ssn: '419275381', status: 'Active', type: 'Non-VBA', gIdx: 0, employeeId: 'EMP-4007', phone: '(248) 555-1007', street: '13400 W 10 Mile Rd', city: 'Southfield', state: 'MI', zip: '48075' },
  { firstName: 'Patricia', lastName: 'Moore', mi: 'A', gender: 'Female', dob: '1975-08-07', age: 50, ssn: '362814759', status: 'Active', type: 'VBA', gIdx: 0, employeeId: 'EMP-4008', phone: '(313) 555-1008', street: '6100 Grand River Ave', city: 'Detroit', state: 'MI', zip: '48208' },
  { firstName: 'Andre', lastName: 'Thompson', gender: 'Male', dob: '1987-04-19', age: 38, ssn: '538417269', status: 'Active', type: 'Non-VBA', gIdx: 0, employeeId: 'EMP-4009', phone: '(313) 555-1009', street: '2950 E Jefferson Ave', city: 'Detroit', state: 'MI', zip: '48207' },
  { firstName: 'Jennifer', lastName: 'Davis', gender: 'Female', dob: '1982-12-03', age: 43, ssn: '471925836', status: 'Active', type: 'Non-VBA', gIdx: 0, employeeId: 'EMP-4010', phone: '(734) 555-1010', street: '780 S Main St', city: 'Ann Arbor', state: 'MI', zip: '48104' },
  { firstName: 'Michael', lastName: 'Okonkwo', gender: 'Male', dob: '1976-05-28', age: 49, ssn: '295714382', status: 'Active', type: 'VBA', gIdx: 0, employeeId: 'EMP-4011', phone: '(313) 555-1011', street: '1175 W Warren Ave', city: 'Detroit', state: 'MI', zip: '48201' },
  { firstName: 'Lisa', lastName: 'Patel', gender: 'Female', dob: '1989-10-15', age: 36, ssn: '614283957', status: 'Active', type: 'Non-VBA', gIdx: 0, employeeId: 'EMP-4012', phone: '(248) 555-1012', street: '29100 Northwestern Hwy', city: 'Southfield', state: 'MI', zip: '48034' },
  { firstName: 'Christopher', lastName: 'Martinez', mi: 'J', gender: 'Male', dob: '1971-07-09', age: 54, ssn: '382571649', status: 'Inactive', type: 'Non-VBA', gIdx: 0, employeeId: 'EMP-4013', phone: '(313) 555-1013', street: '4381 Vernor Hwy', city: 'Detroit', state: 'MI', zip: '48209', inactiveDate: '2025-01-01', inactiveReason: 'Opt Out', notes: [{ text: 'Member opted out of Section 125 effective 2025-01-01. Enrolled in spouse\'s plan.', author: 'Stephanie C.', date: '2024-12-20T14:15:00Z', type: 'Admin Only' }] },
  { firstName: 'Samantha', lastName: 'Lee', gender: 'Female', dob: '1994-03-26', age: 32, ssn: '527419386', status: 'Active', type: 'Non-VBA', gIdx: 0, employeeId: 'EMP-4014', phone: '(313) 555-1014', street: '1920 Forest Ave', city: 'Detroit', state: 'MI', zip: '48207' },
  { firstName: 'Brian', lastName: 'Foster', mi: 'T', gender: 'Male', dob: '1980-11-17', age: 45, ssn: '459281734', status: 'On Hold', type: 'Non-VBA', gIdx: 0, employeeId: 'EMP-4015', phone: '(313) 555-1015', street: '7625 W Outer Dr', city: 'Detroit', state: 'MI', zip: '48235', holdReason: 'Negatively Impacted', notes: [{ text: 'Placed on hold 3/15/2026. Negatively impacted determination pending review.', author: 'Kacy L.', date: '2026-03-15T11:00:00Z', type: 'Admin Only' }] },
  { firstName: 'Nicole', lastName: 'Taylor', gender: 'Female', dob: '1986-08-04', age: 39, ssn: '318724965', status: 'Active', type: 'Non-VBA', gIdx: 0, employeeId: 'EMP-4016', phone: '(313) 555-1016', street: '3840 2nd Ave', city: 'Detroit', state: 'MI', zip: '48201' },
  { firstName: 'Marcus', lastName: 'Rivera', gender: 'Male', dob: '1979-02-14', age: 47, ssn: '572839146', status: 'Active', type: 'VBA', gIdx: 0, employeeId: 'EMP-4017', phone: '(734) 555-1017', street: '450 Town Center Dr', city: 'Dearborn', state: 'MI', zip: '48126' },
  { firstName: 'Ashley', lastName: 'Washington', gender: 'Female', dob: '1991-06-21', age: 34, ssn: '641527389', status: 'Active', type: 'Non-VBA', gIdx: 0, employeeId: 'EMP-4018', phone: '(313) 555-1018', street: '5500 Conner St', city: 'Detroit', state: 'MI', zip: '48213' },
  { firstName: 'Daniel', lastName: 'Park', mi: 'H', gender: 'Male', dob: '1984-09-08', age: 41, ssn: '493817256', status: 'Active', type: 'Non-VBA', gIdx: 0, employeeId: 'EMP-4019', phone: '(248) 555-1019', street: '2600 W Big Beaver Rd', city: 'Troy', state: 'MI', zip: '48084' },
  { firstName: 'Keisha', lastName: 'Robinson', gender: 'Female', dob: '1977-04-30', age: 48, ssn: '374928165', status: 'Inactive', type: 'Non-VBA', gIdx: 0, employeeId: 'EMP-4020', phone: '(313) 555-1020', street: '9601 Dexter Blvd', city: 'Detroit', state: 'MI', zip: '48206', inactiveDate: '2025-08-15', inactiveReason: 'No Deduction' },
  { firstName: 'Steven', lastName: 'Campbell', gender: 'Male', dob: '1983-01-12', age: 43, ssn: '528394716', status: 'Inactive', type: 'Non-VBA', gIdx: 0, employeeId: 'EMP-4021', phone: '(313) 555-1021', street: '14300 Greenfield Rd', city: 'Detroit', state: 'MI', zip: '48227', inactiveDate: '2025-10-01', inactiveReason: 'No Longer Eligible Section 125' },
  { firstName: 'Rachel', lastName: 'Adams', mi: 'L', gender: 'Female', dob: '1988-07-16', age: 37, ssn: '416293857', status: 'On Hold', type: 'VBA', gIdx: 0, employeeId: 'EMP-4022', phone: '(313) 555-1022', street: '1830 E Canfield St', city: 'Detroit', state: 'MI', zip: '48207', holdReason: 'Negatively Impacted', notes: [{ text: 'On hold pending payroll deduction reconciliation. HR notified.', author: 'Lillie R.', date: '2026-03-20T15:45:00Z', type: 'Admin Only' }] },
  { firstName: 'Omar', lastName: 'Hassan', gender: 'Male', dob: '1992-05-03', age: 33, ssn: '591374285', status: 'Active', type: 'Non-VBA', gIdx: 0, employeeId: 'EMP-4023', phone: '(313) 555-1023', street: '6340 Michigan Ave', city: 'Detroit', state: 'MI', zip: '48210' },

  // ── Redwood Financial Services (gIdx 1, hsa, San Francisco CA) ─────
  { firstName: 'Jonathan', lastName: 'Liu', gender: 'Male', dob: '1983-08-12', age: 42, ssn: '623815947', status: 'Active', type: 'Non-VBA', gIdx: 1, employeeId: 'EMP-5001', phone: '(415) 555-2001', street: '580 Market St', city: 'San Francisco', state: 'CA', zip: '94104' },
  { firstName: 'Sarah', lastName: 'Nakamura', mi: 'K', gender: 'Female', dob: '1979-11-28', age: 46, ssn: '487291365', status: 'Active', type: 'VBA', gIdx: 1, employeeId: 'EMP-5002', phone: '(415) 555-2002', street: '1200 Van Ness Ave', city: 'San Francisco', state: 'CA', zip: '94109' },
  { firstName: 'Derek', lastName: 'Osei', gender: 'Male', dob: '1986-03-07', age: 40, ssn: '539174826', status: 'Active', type: 'Non-VBA', gIdx: 1, employeeId: 'EMP-5003', phone: '(415) 555-2003', street: '3401 California St', city: 'San Francisco', state: 'CA', zip: '94118' },
  { firstName: 'Amanda', lastName: 'Burke', gender: 'Female', dob: '1990-01-15', age: 36, ssn: '612485937', status: 'Active', type: 'Non-VBA', gIdx: 1, employeeId: 'EMP-5004', phone: '(510) 555-2004', street: '1901 Harrison St', city: 'Oakland', state: 'CA', zip: '94612' },
  { firstName: 'Raj', lastName: 'Kapoor', mi: 'S', gender: 'Male', dob: '1974-06-22', age: 51, ssn: '375291846', status: 'Active', type: 'VBA', gIdx: 1, employeeId: 'EMP-5005', phone: '(415) 555-2005', street: '2100 Fillmore St', city: 'San Francisco', state: 'CA', zip: '94115' },
  { firstName: 'Megan', lastName: 'Sullivan', gender: 'Female', dob: '1988-09-04', age: 37, ssn: '548327196', status: 'Inactive', type: 'Non-VBA', gIdx: 1, employeeId: 'EMP-5006', phone: '(415) 555-2006', street: '750 Divisadero St', city: 'San Francisco', state: 'CA', zip: '94117', inactiveDate: '2025-05-15', inactiveReason: 'Voluntary Termination' },
  { firstName: 'Carlos', lastName: 'Reyes', gender: 'Male', dob: '1981-12-19', age: 44, ssn: '419582736', status: 'Active', type: 'Non-VBA', gIdx: 1, employeeId: 'EMP-5007', phone: '(650) 555-2007', street: '1040 El Camino Real', city: 'Redwood City', state: 'CA', zip: '94063' },
  { firstName: 'Tiffany', lastName: 'Nguyen', gender: 'Female', dob: '1993-04-11', age: 32, ssn: '562918347', status: 'Active', type: 'VBA', gIdx: 1, employeeId: 'EMP-5008', phone: '(415) 555-2008', street: '4500 Irving St', city: 'San Francisco', state: 'CA', zip: '94122' },
  { firstName: 'Gregory', lastName: 'Walsh', mi: 'P', gender: 'Male', dob: '1970-07-30', age: 55, ssn: '387524169', status: 'Active', type: 'Non-VBA', gIdx: 1, employeeId: 'EMP-5009', phone: '(415) 555-2009', street: '2800 Leavenworth St', city: 'San Francisco', state: 'CA', zip: '94133' },
  { firstName: 'Priya', lastName: 'Sharma', gender: 'Female', dob: '1985-02-25', age: 41, ssn: '524817396', status: 'On Hold', type: 'Non-VBA', gIdx: 1, employeeId: 'EMP-5010', phone: '(510) 555-2010', street: '5200 Broadway', city: 'Oakland', state: 'CA', zip: '94618', holdReason: 'Negatively Impacted' },
  { firstName: 'Nathan', lastName: 'Cross', gender: 'Male', dob: '1978-10-08', age: 47, ssn: '471638295', status: 'Active', type: 'VBA', gIdx: 1, employeeId: 'EMP-5011', phone: '(415) 555-2011', street: '901 Mission St', city: 'San Francisco', state: 'CA', zip: '94103' },
  { firstName: 'Diane', lastName: 'Fletcher', gender: 'Female', dob: '1976-05-16', age: 49, ssn: '398572146', status: 'Terminated', type: 'Non-VBA', gIdx: 1, employeeId: 'EMP-5012', phone: '(415) 555-2012', street: '3100 Geary Blvd', city: 'San Francisco', state: 'CA', zip: '94118', inactiveDate: '2025-09-15', inactiveReason: 'Voluntary Termination', notes: [{ text: 'Terminated 2025-09-15. Left employer voluntarily.', author: 'Tori M.', date: '2025-09-15T16:00:00Z', type: 'History Note' }] },
  { firstName: 'Jason', lastName: 'Tran', gender: 'Male', dob: '1982-08-23', age: 43, ssn: '516249387', status: 'Terminated', type: 'Non-VBA', gIdx: 1, employeeId: 'EMP-5013', phone: '(650) 555-2013', street: '800 Jefferson Ave', city: 'Redwood City', state: 'CA', zip: '94063', inactiveDate: '2025-11-01', inactiveReason: 'No Longer Eligible Section 125' },
  { firstName: 'Laura', lastName: 'Schmidt', gender: 'Female', dob: '1991-11-07', age: 34, ssn: '628175934', status: 'Active', type: 'Non-VBA', gIdx: 1, employeeId: 'EMP-5014', phone: '(415) 555-2014', street: '1660 Bush St', city: 'San Francisco', state: 'CA', zip: '94109' },

  // ── Coastal Logistics Group (gIdx 2, firstStop, Charleston SC) ─────
  { firstName: 'William', lastName: 'Porter', mi: 'B', gender: 'Male', dob: '1975-04-18', age: 50, ssn: '435781926', status: 'Active', type: 'Non-VBA', gIdx: 2, employeeId: 'EMP-6001', phone: '(843) 555-3001', street: '210 King St', city: 'Charleston', state: 'SC', zip: '29401' },
  { firstName: 'Angela', lastName: 'Mitchell', gender: 'Female', dob: '1984-09-22', age: 41, ssn: '517429386', status: 'Active', type: 'VBA', gIdx: 2, employeeId: 'EMP-6002', phone: '(843) 555-3002', street: '1450 Meeting St', city: 'Charleston', state: 'SC', zip: '29405' },
  { firstName: 'Darnell', lastName: 'Hayes', gender: 'Male', dob: '1989-01-30', age: 37, ssn: '482917536', status: 'Active', type: 'Non-VBA', gIdx: 2, employeeId: 'EMP-6003', phone: '(843) 555-3003', street: '575 Morrison Dr', city: 'Charleston', state: 'SC', zip: '29403' },
  { firstName: 'Stephanie', lastName: 'Brooks', mi: 'N', gender: 'Female', dob: '1980-06-14', age: 45, ssn: '371524896', status: 'Active', type: 'Non-VBA', gIdx: 2, employeeId: 'EMP-6004', phone: '(843) 555-3004', street: '820 Savannah Hwy', city: 'Charleston', state: 'SC', zip: '29407' },
  { firstName: 'Kevin', lastName: 'Duarte', gender: 'Male', dob: '1973-11-25', age: 52, ssn: '529841763', status: 'Inactive', type: 'Non-VBA', gIdx: 2, employeeId: 'EMP-6005', phone: '(843) 555-3005', street: '1100 Dorchester Rd', city: 'North Charleston', state: 'SC', zip: '29405', inactiveDate: '2025-06-01', inactiveReason: 'No Deduction', notes: [{ text: 'Inactive as of 2025-06-01. No deduction received for 60+ days.', author: 'Kacy L.', date: '2025-06-02T08:30:00Z', type: 'Admin Only' }] },
  { firstName: 'Tamika', lastName: 'Owens', gender: 'Female', dob: '1987-03-09', age: 39, ssn: '418273965', status: 'Active', type: 'VBA', gIdx: 2, employeeId: 'EMP-6006', phone: '(843) 555-3006', street: '3200 Rivers Ave', city: 'North Charleston', state: 'SC', zip: '29405' },
  { firstName: 'Ryan', lastName: 'Fitzgerald', gender: 'Male', dob: '1992-07-17', age: 33, ssn: '596324817', status: 'Active', type: 'Non-VBA', gIdx: 2, employeeId: 'EMP-6007', phone: '(843) 555-3007', street: '485 E Bay St', city: 'Charleston', state: 'SC', zip: '29403' },
  { firstName: 'Monica', lastName: 'Vasquez', gender: 'Female', dob: '1978-12-05', age: 47, ssn: '473182965', status: 'Terminated', type: 'Non-VBA', gIdx: 2, employeeId: 'EMP-6008', phone: '(843) 555-3008', street: '1600 Sam Rittenberg Blvd', city: 'Charleston', state: 'SC', zip: '29407', inactiveDate: '2025-07-31', inactiveReason: 'Group Cancellation', notes: [{ text: 'Terminated per employer request. Final deduction processed July 2025.', author: 'Stephanie C.', date: '2025-07-31T17:00:00Z', type: 'History Note' }] },
  { firstName: 'Charles', lastName: 'Dixon', gender: 'Male', dob: '1982-05-28', age: 43, ssn: '384729615', status: 'Active', type: 'VBA', gIdx: 2, employeeId: 'EMP-6009', phone: '(843) 555-3009', street: '920 Houston Northcutt Blvd', city: 'Mt Pleasant', state: 'SC', zip: '29464' },
  { firstName: 'Jasmine', lastName: 'Watts', gender: 'Female', dob: '1986-10-13', age: 39, ssn: '542918736', status: 'On Hold', type: 'VBA', gIdx: 2, employeeId: 'EMP-6010', phone: '(843) 555-3010', street: '2460 Mall Dr', city: 'North Charleston', state: 'SC', zip: '29406', holdReason: 'Negatively Impacted' },

  // ── Summit Healthcare Partners (gIdx 3, firstStopHsa, Denver CO) ───
  { firstName: 'Benjamin', lastName: 'Torres', mi: 'M', gender: 'Male', dob: '1981-03-27', age: 45, ssn: '527394186', status: 'Active', type: 'VBA', gIdx: 3, employeeId: 'EMP-7001', phone: '(720) 555-4001', street: '1601 Blake St', city: 'Denver', state: 'CO', zip: '80202', notes: [{ text: 'VBA enrollment confirmed. HSA contributions starting Oct 2024.', author: 'Kacy L.', date: '2024-10-03T09:00:00Z', type: 'History Note' }] },
  { firstName: 'Heather', lastName: 'Collins', gender: 'Female', dob: '1977-08-19', age: 48, ssn: '618472395', status: 'Active', type: 'Non-VBA', gIdx: 3, employeeId: 'EMP-7002', phone: '(720) 555-4002', street: '4200 E Colfax Ave', city: 'Denver', state: 'CO', zip: '80220' },
  { firstName: 'Anthony', lastName: 'Greene', mi: 'W', gender: 'Male', dob: '1985-12-02', age: 40, ssn: '493857216', status: 'Inactive', type: 'Non-VBA', gIdx: 3, employeeId: 'EMP-7003', phone: '(303) 555-4003', street: '8900 Wadsworth Blvd', city: 'Arvada', state: 'CO', zip: '80003', inactiveDate: '2025-12-01', inactiveReason: 'Opt Out' },
  { firstName: 'Victoria', lastName: 'Chang', gender: 'Female', dob: '1990-05-14', age: 35, ssn: '371629584', status: 'Active', type: 'Non-VBA', gIdx: 3, employeeId: 'EMP-7004', phone: '(720) 555-4004', street: '1550 Larimer St', city: 'Denver', state: 'CO', zip: '80202' },
  { firstName: 'Matthew', lastName: 'Singh', gender: 'Male', dob: '1974-09-23', age: 51, ssn: '584231967', status: 'Terminated', type: 'Non-VBA', gIdx: 3, employeeId: 'EMP-7005', phone: '(303) 555-4005', street: '6300 S Santa Fe Dr', city: 'Littleton', state: 'CO', zip: '80120', inactiveDate: '2025-08-01', inactiveReason: 'Voluntary Termination' },

  // ── Ironbridge Construction (gIdx 5, standard, Pittsburgh PA) ──────
  { firstName: 'Frank', lastName: 'DeLuca', mi: 'V', gender: 'Male', dob: '1969-06-11', age: 56, ssn: '425719386', status: 'Terminated', type: 'Non-VBA', gIdx: 5, employeeId: 'EMP-8001', phone: '(412) 555-5001', street: '340 Forbes Ave', city: 'Pittsburgh', state: 'PA', zip: '15222', inactiveDate: '2025-01-31', inactiveReason: 'Group Cancellation' },
  { firstName: 'Howard', lastName: 'Steele', gender: 'Male', dob: '1972-02-28', age: 54, ssn: '538214976', status: 'Terminated', type: 'Non-VBA', gIdx: 5, employeeId: 'EMP-8002', phone: '(412) 555-5002', street: '1525 Penn Ave', city: 'Pittsburgh', state: 'PA', zip: '15222', inactiveDate: '2025-01-31', inactiveReason: 'Group Cancellation' },
]

export const MEMBERS: Member[] = SEEDS.map(buildMember)
