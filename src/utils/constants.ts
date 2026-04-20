export const MEMBER_STATUSES = ['Active', 'Inactive', 'Terminated', 'On Hold', 'Merged'] as const
export type MemberStatus = (typeof MEMBER_STATUSES)[number]

export const GROUP_STATUSES = ['Active', 'Inactive', 'Pending Setup'] as const
export type GroupStatus = (typeof GROUP_STATUSES)[number]

export const MEMBER_TYPES = ['VBA', 'Non-VBA'] as const
export type MemberType = (typeof MEMBER_TYPES)[number]

export const PRODUCT_STATUSES = ['Active', 'Future Active', 'Inactive', 'Pending'] as const
export type ProductStatus = (typeof PRODUCT_STATUSES)[number]

export const INACTIVE_REASONS = [
  'No Longer Eligible',
  'Opt Out',
  'Product Switch',
  'No Deduction',
  'Group Move to VBA for Administration',
  'Voluntary Termination',
  'Group Cancellation',
] as const
export type InactiveReason = (typeof INACTIVE_REASONS)[number]

export const HOLD_REASONS = ['Negatively Impacted'] as const
export type HoldReason = (typeof HOLD_REASONS)[number]

export const PRODUCT_TEMPLATES = {
  standard: { name: 'Standard Build', hsa: false, firstStop: false },
  hsa: { name: 'HSA Build', hsa: true, firstStop: false },
  firstStop: { name: 'First Stop Build', hsa: false, firstStop: true },
  firstStopHsa: { name: 'First Stop + HSA Build', hsa: true, firstStop: true },
} as const

export const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC',
] as const
