import { create } from 'zustand'

export interface MappingTemplate {
  id: string
  name: string
  columnMapping: Record<string, string>
  createdAt: string
  createdBy: string
  isCustom: boolean
}

const defaultMapping: Record<string, string> = {
  'Agent ID': 'agentId',
  'Employee ID': 'employeeId',
  'Last Name': 'lastName',
  'First Name': 'firstName',
  'Middle Initial': 'middleInitial',
  SSN: 'ssn',
  DOB: 'dob',
  Gender: 'gender',
  'Address 1': 'address1',
  'Address 2': 'address2',
  City: 'city',
  State: 'state',
  Zip: 'zip',
  Phone: 'phone',
  Email: 'email',
  'Hire Date': 'hireDate',
  'Active Date': 'activeDate',
  'Plan Code': 'planCode',
}

const BUILT_IN: MappingTemplate[] = [
  {
    id: 'tpl-default',
    name: 'Standard Eligibility',
    columnMapping: { ...defaultMapping },
    createdAt: '2025-01-01T00:00:00Z',
    createdBy: 'System',
    isCustom: false,
  },
]

interface TemplateState {
  customTemplates: MappingTemplate[]
  allTemplates: () => MappingTemplate[]
  addTemplate: (template: MappingTemplate) => void
  removeTemplate: (id: string) => void
  findByName: (name: string) => MappingTemplate | undefined
}

export const useTemplateStore = create<TemplateState>((set, get) => ({
  customTemplates: [],

  allTemplates: () => [...BUILT_IN, ...get().customTemplates],

  addTemplate: (template) =>
    set((s) => {
      const idx = s.customTemplates.findIndex((t) => t.id === template.id)
      if (idx >= 0) {
        const updated = [...s.customTemplates]
        updated[idx] = template
        return { customTemplates: updated }
      }
      return { customTemplates: [...s.customTemplates, template] }
    }),

  removeTemplate: (id) =>
    set((s) => ({
      customTemplates: s.customTemplates.filter((t) => t.id !== id),
    })),

  findByName: (name) => {
    const lower = name.toLowerCase()
    return [...BUILT_IN, ...get().customTemplates].find(
      (t) => t.name.toLowerCase() === lower,
    )
  },
}))

export { defaultMapping }
