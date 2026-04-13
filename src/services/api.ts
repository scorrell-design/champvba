import type { Group } from '../types/group'
import type { Member } from '../types/member'
import type { Product } from '../types/product'
import type { AuditEntry } from '../types/audit'
import type { Broker } from '../types/broker'
import type { Tag } from '../types/tag'
import type { DuplicateQueueItem } from '../types/duplicate'

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

async function loadBrokers(): Promise<Broker[]> {
  const { BROKERS } = await import('../data/brokers')
  return BROKERS
}

async function loadTags(): Promise<Tag[]> {
  const { TAGS } = await import('../data/tags')
  return TAGS
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
  const groupId = `GRP-${String(Math.floor(100000 + Math.random() * 900000))}`

  const group: Group = {
    id: groupId,
    legalName: '',
    dba: '',
    fein: '',
    cbsGroupId: '',
    tpaGroupCode: '',
    groupBrokerId: '',
    status: 'Pending Setup',
    groupType: 'Employer',
    agentType: 'Independent',
    address: { street: '', city: '', state: '', zip: '' },
    contact: { phone1: '', email1: '' },
    primaryContactName: '',
    primaryContactEmail: '',
    invoiceTemplate: 'Standard',
    ppoNetwork: 'First Health Network',
    pbm: 'CHAMP Rx',
    section125PostTax: 'Standard',
    dpc: 'N/A',
    internalProcess: 'Standard',
    enroller: 'Self-Enrolled',
    carrier: 'Champion Health',
    wellnessVendor: 'HealthWorks',
    isVBA: false,
    firstStopHealth: false,
    hasFirstStopHealth: false,
    hsaOffered: false,
    hasHSA: false,
    aciDivisionCode: '',
    firstHealthAcroCode: '',
    taxIdType: 'FEIN',
    denyMemberPortalAccess: false,
    shortPlanYearDates: '',
    childGroupIds: [],
    isParentGroup: false,
    agentName: '',
    agentNumber: '',
    agentCompany: '',
    agentPhone: '',
    agentEmail: '',
    createdDate: new Date().toISOString().split('T')[0],
    activeDate: '',
    benefitsEffectiveDate: '',
    anticipatedDate: '',
    planStartDate: '',
    planEndDate: '',
    openEnrollmentStartDate: '',
    openEnrollmentEndDate: '',
    isOpenEnrollment: false,
    memberCount: 0,
    products: [],
    notes: [],
    tags: [],
    templateType: 'standard',
    ...data,
    wltGroupNumber: '',
  } as Group

  const { GROUPS } = await import('../data/groups')
  GROUPS.push(group)

  return group
}

export async function updateGroup(id: string, data: Partial<Group>): Promise<Group> {
  await delay()
  const groups = await loadGroups()
  const existing = groups.find((g) => g.id === id)
  if (!existing) throw new Error(`Group ${id} not found`)
  const updated = { ...structuredClone(existing), ...data, id }
  const idx = groups.findIndex((g) => g.id === id)
  if (idx >= 0) Object.assign(groups[idx], updated)
  return updated
}

// ── Members ─────────────────────────────────────────────────────────

export interface MemberFilters {
  groupId?: string
  status?: string
  type?: string
  search?: string
  relationship?: string
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
  if (filters?.relationship) {
    if (filters.relationship === 'Primary') {
      members = members.filter((m) => m.relationship === 'Primary')
    } else if (filters.relationship === 'Dependent') {
      members = members.filter((m) => m.relationship !== 'Primary')
    }
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
    dependents: [],
    isAppUser: false,
    relationship: 'Primary',
    primaryMemberId: null,
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

  existing.status = 'Terminated'
  existing.inactiveDate = data.inactiveDate
  existing.inactiveReason = data.inactiveReason
  existing.products = existing.products.map((p) =>
    data.productIds.includes(p.productId)
      ? { ...p, status: 'Inactive' as const, inactiveDate: data.inactiveDate }
      : p,
  )

  if (data.notes) {
    existing.notes.push({
      id: `N-${Date.now().toString(36)}`,
      text: data.notes,
      author: 'Admin',
      createdAt: new Date().toISOString(),
      isAdmin: false,
      type: 'User Note',
    })
  }

  return structuredClone(existing)
}

export async function reactivateMember(
  id: string,
  data: { reason: string; effectiveDate: string; notes?: string; productIdsToReactivate?: string[] },
): Promise<Member> {
  await delay()
  const members = await loadMembers()
  const existing = members.find((m) => m.id === id)
  if (!existing) throw new Error(`Member ${id} not found`)

  existing.status = 'Active'
  existing.activeDate = data.effectiveDate
  existing.inactiveDate = null
  existing.inactiveReason = undefined

  const reactivateAll = !data.productIdsToReactivate
  const productIdSet = new Set(data.productIdsToReactivate ?? [])
  existing.products = existing.products.map((p) => {
    if (p.status === 'Inactive' && (reactivateAll || productIdSet.has(p.productId))) {
      return { ...p, status: 'Active' as const, inactiveDate: undefined, inactiveReason: undefined }
    }
    return p
  })

  if (data.notes) {
    existing.notes.push({
      id: `N-${Date.now().toString(36)}`,
      text: data.notes,
      author: 'Admin',
      createdAt: new Date().toISOString(),
      isAdmin: false,
      type: 'User Note',
    })
  }

  return structuredClone(existing)
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

  return entries
}

// ── Brokers ─────────────────────────────────────────────────────────

export async function fetchBrokers(): Promise<Broker[]> {
  await delay()
  const brokers = await loadBrokers()
  return structuredClone(brokers)
}

export async function fetchBroker(id: string): Promise<Broker | undefined> {
  await delay()
  const brokers = await loadBrokers()
  const broker = brokers.find((b) => b.id === id)
  return broker ? structuredClone(broker) : undefined
}

// ── Tags ────────────────────────────────────────────────────────────

export async function fetchTags(): Promise<Tag[]> {
  await delay()
  const tags = await loadTags()
  return structuredClone(tags)
}

export async function createTag(data: Partial<Tag>): Promise<Tag> {
  await delay()
  const tag: Tag = {
    id: `tag-${Date.now().toString(36)}`,
    name: '',
    color: 'gray',
    type: 'group',
    appliesTo: 'Both',
    isSystem: false,
    status: 'Active',
    ...data,
  } as Tag
  const { TAGS } = await import('../data/tags')
  TAGS.push(tag)
  return tag
}

export async function updateTag(id: string, data: Partial<Tag>): Promise<Tag> {
  await delay()
  const { TAGS } = await import('../data/tags')
  const idx = TAGS.findIndex((t) => t.id === id)
  if (idx < 0) throw new Error(`Tag ${id} not found`)
  Object.assign(TAGS[idx], data)
  return structuredClone(TAGS[idx])
}

// ── Dashboard ───────────────────────────────────────────────────────

// ── Duplicates ───────────────────────────────────────────────────────

export async function fetchDuplicateQueue(): Promise<DuplicateQueueItem[]> {
  await delay()
  const { DUPLICATE_QUEUE } = await import('../data/duplicates')
  return structuredClone(DUPLICATE_QUEUE)
}

export async function checkDuplicateBySSN(ssn: string, excludeMemberId?: string): Promise<Member | null> {
  await delay(100)
  const members = await loadMembers()
  const normalized = ssn.replace(/\D/g, '')
  const match = members.find(
    (m) => m.ssn.replace(/\D/g, '') === normalized && m.id !== excludeMemberId && m.status !== 'Merged',
  )
  return match ? structuredClone(match) : null
}

// ── Dashboard ───────────────────────────────────────────────────────

export async function fetchDashboardStats(): Promise<{
  openEnrollment: { count: number; status: string; daysLeft: number }
  totalMembers: { count: number; delta: number; deltaPercent: number }
  activeGroups: { count: number }
  pendingNotifications: { count: number }
  pendingRFCs: { count: number }
}> {
  await delay()
  const [members, groups] = await Promise.all([loadMembers(), loadGroups()])

  const activeMembers = members.filter((m) => m.status === 'Active')
  const activeGroups = groups.filter((g) => g.status === 'Active')
  const oeGroups = groups.filter((g) => g.isOpenEnrollment)

  return {
    openEnrollment: { count: oeGroups.length, status: 'Active', daysLeft: 18 },
    totalMembers: {
      count: activeMembers.length,
      delta: 24,
      deltaPercent: 2.4,
    },
    activeGroups: { count: activeGroups.length },
    pendingNotifications: { count: 7 },
    pendingRFCs: { count: 4 },
  }
}
