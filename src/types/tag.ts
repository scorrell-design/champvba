export interface Tag {
  id: string
  name: string
  color: string
  type: 'group' | 'member'
  appliesTo: 'Groups' | 'Members' | 'Both'
  description?: string
  isSystem: boolean
  status: 'Active' | 'Inactive'
}
