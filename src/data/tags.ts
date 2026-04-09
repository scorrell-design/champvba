import type { Tag } from '../types/tag'

export const TAGS: Tag[] = [
  { id: 'tag-vba', name: 'VBA', color: 'blue', type: 'group', appliesTo: 'Both', description: 'VBA administered group', isSystem: true, status: 'Active' },
  { id: 'tag-hsa', name: 'HSA', color: 'green', type: 'group', appliesTo: 'Both', description: 'Offers HSA products', isSystem: true, status: 'Active' },
  { id: 'tag-firststop', name: 'First Stop', color: 'purple', type: 'group', appliesTo: 'Both', description: 'First Stop Health enrolled', isSystem: true, status: 'Active' },
  { id: 'tag-oe', name: 'Open Enrollment', color: 'orange', type: 'group', appliesTo: 'Both', description: 'Currently in open enrollment period', isSystem: true, status: 'Active' },
  { id: 'tag-appuser', name: 'App User', color: 'teal', type: 'member', appliesTo: 'Members', description: 'Has an active mobile app account', isSystem: true, status: 'Active' },
]
