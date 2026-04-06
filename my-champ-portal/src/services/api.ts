import type { Group } from '../types/group'
import type { Member } from '../types/member'
import type { Product } from '../types/product'
import type { AuditEntry } from '../types/audit'

function delay(ms?: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms ?? 200 + Math.random() * 200))
}

async function loadGroups(): Promise<Group[]> {
  const { GROUPS } = await import('../data/groups')
  return GROUPS
}

async function loadMembers(): Promise<Member[]> {
  const { MEMBERS } = await import('../data/members')
  return MEMBERS
}

async function loadProducts(): Promise<Product[]> {
  const { PRODUCTS } = await import('../data/products')
  return PRODUCTS
}

async function loadAuditLog(): Promise<AuditEntry[]> {
  const { AUDIT_LOG } = await import('../data/audit-log')
  return AUDIT_LOG
}

// ── Groups ──────────────────────────────────────────────────────────

export async function fetchGroups(): Promise<Group[]> {
  await delay()
  const groups = await loadGroups()
  return structuredClone(groups)
}

export async function fetchGroup(id: string): Promise<Group | undefined> {
  await delay()
  const groups = await loadGroups()
  const group = groups.find((g) => g.id === id)
  return group ? structuredClone(group) : undefined
}

export async function createGroup(data: Partial<Group>): Promise<Group> {
  await delay()
  const group: Group = {
    id: `GRP-${Date.now().toString(36).toUpperCase()}`,
    legalName: '',
    dba: '',
    fein: '',
    cbsGroupId: '',
    wltGroupNumber: '',
    tpaGroupCode: '',
    tmHwCode: '',
    groupBrokerId: '',
    status: 'Pending Setup',
    groupType: '',
    agentType: '',
    address: { street: '', city: '', state: '', zip: '' },
    contact: { phone1: '', email1: '' },
    primaryContactName: '',
    primaryContactEmail: '',
    invoiceTemplate: '',
    ppoNetwork: '',
    pbm: '',
    section125PostTax: '',
    dpc: '',
    internalProcess: '',
    enroller: '',
    carrier: '',
    hwTeleHealth: false,
    wellnessVendor: '',
    hwBehavioralHealth: false,
    firstStopHealth: false,
    hsaOffered: false,
    aciDivisionCode: '',
    firstHealthAcroCode: '',
    taxIdType: '',
    denyMemberPortalAccess: false,
    shortPlanYearDates: '',
    agentName: '',
    agentNumber: '',
    agentCompany: '',
    agentPhone: '',
    agentEmail: '',
    createdDate: new Date().toISOString().split('T')[0],
    activeDate: '',
    benefitsEffectiveDate: '',
    memberCount: 0,
    products: [],
    paymentProcessors: [],
    notes: [],
    templateType: 'standard',
    ...data,
  } as Group
  return group
}

export async function updateGroup(id: string, data: Partial<Group>): Promise<Group> {
  await delay()
  const groups = await loadGroups()
  const existing = groups.find((g) => g.id === id)
  if (!existing) throw new Error(`Group ${id} not found`)
  return { ...structuredClone(existing), ...data, id }
}

// ── Members ─────────────────────────────────────────────────────────

export interface MemberFilters {
  groupId?: string
  status?: string
  type?: string
  search?: string
}

export async function fetchMembers(filters?: MemberFilters): Promise<Member[]> {
  await delay()
  let members = await loadMembers()
  members = structuredClone(members)

  if (filters?.groupId) {
    members = members.filter((m) => m.groupId === filters.groupId)
  }
  if (filters?.status) {
    members = members.filter((m) => m.status === filters.status)
  }
  if (filters?.type) {
    members = members.filter((m) => m.type === filters.type)
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase()
    members = members.filter(
      (m) =>
        m.firstName.toLowerCase().includes(q) ||
        m.lastName.toLowerCase().includes(q) ||
        m.memberId.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q),
    )
  }

  return members
}

export async function fetchMember(id: string): Promise<Member | undefined> {
  await delay()
  const members = await loadMembers()
  const member = members.find((m) => m.id === id)
  return member ? structuredClone(member) : undefined
}

export async function createMember(data: Partial<Member>): Promise<Member> {
  await delay()
  const member: Member = {
    id: `MBR-${Date.now().toString(36).toUpperCase()}`,
    memberId: '',
    firstName: '',
    lastName: '',
    ssn: '',
    dob: '',
    age: 0,
    gender: '',
    email: '',
    phone: '',
    address: { street: '', city: '', state: '', zip: '' },
    employeeId: '',
    agentId: '',
    groupId: '',
    groupName: '',
    status: 'Active',
    type: 'Non-VBA',
    vbaEligible: false,
    optIn: false,
    coverageEffectiveDate: '',
    createdDate: new Date().toISOString().split('T')[0],
    activeDate: null,
    inactiveDate: null,
    products: [],
    notes: [],
    ...data,
  } as Member
  return member
}

export async function updateMember(id: string, data: Partial<Member>): Promise<Member> {
  await delay()
  const members = await loadMembers()
  const existing = members.find((m) => m.id === id)
  if (!existing) throw new Error(`Member ${id} not found`)
  return { ...structuredClone(existing), ...data, id }
}

export async function terminateMember(
  id: string,
  data: { productIds: string[]; inactiveDate: string; inactiveReason: string; notes?: string },
): Promise<Member> {
  await delay()
  const members = await loadMembers()
  const existing = members.find((m) => m.id === id)
  if (!existing) throw new Error(`Member ${id} not found`)

  const terminated = structuredClone(existing)
  terminated.status = 'Terminated'
  terminated.inactiveDate = data.inactiveDate
  terminated.inactiveReason = data.inactiveReason

  terminated.products = terminated.products.map((p) =>
    data.productIds.includes(p.productId)
      ? { ...p, status: 'Inactive' as const, inactiveDate: data.inactiveDate }
      : p,
  )

  if (data.notes) {
    terminated.notes.push({
      id: `N-${Date.now().toString(36)}`,
      text: data.notes,
      author: 'Admin',
      createdAt: new Date().toISOString(),
      isAdmin: true,
      type: 'Admin Only',
    })
  }

  return terminated
}

// ── Products ────────────────────────────────────────────────────────

export async function fetchProducts(): Promise<Product[]> {
  await delay()
  const products = await loadProducts()
  return structuredClone(products)
}

// ── Audit Log ───────────────────────────────────────────────────────

export interface AuditFilters {
  entityType?: string
  changedBy?: string
  dateFrom?: string
  dateTo?: string
  system?: string
}

export async function fetchAuditLog(filters?: AuditFilters): Promise<AuditEntry[]> {
  await delay()
  let entries = await loadAuditLog()
  entries = structuredClone(entries)

  if (filters?.entityType) {
    entries = entries.filter((e) => e.entityType === filters.entityType)
  }
  if (filters?.changedBy) {
    entries = entries.filter((e) => e.changedBy === filters.changedBy)
  }
  if (filters?.dateFrom) {
    entries = entries.filter((e) => e.timestamp >= filters.dateFrom!)
  }
  if (filters?.dateTo) {
    entries = entries.filter((e) => e.timestamp <= filters.dateTo!)
  }
  if (filters?.system) {
    entries = entries.filter((e) => e.systemsAffected.includes(filters.system as never))
  }

  return entries
}

// ── Dashboard ───────────────────────────────────────────────────────

export async function fetchDashboardStats(): Promise<{
  openEnrollment: { count: number; status: string; daysLeft: number }
  totalMembers: { count: number; delta: number; deltaPercent: number }
  activeGroups: { count: number }
  pendingNotifications: { count: number }
}> {
  await delay()
  const [members, groups] = await Promise.all([loadMembers(), loadGroups()])

  const activeMembers = members.filter((m) => m.status === 'Active')
  const activeGroups = groups.filter((g) => g.status === 'Active')

  return {
    openEnrollment: { count: 12, status: 'Active', daysLeft: 18 },
    totalMembers: {
      count: activeMembers.length,
      delta: 24,
      deltaPercent: 2.4,
    },
    activeGroups: { count: activeGroups.length },
    pendingNotifications: { count: 7 },
  }
}
