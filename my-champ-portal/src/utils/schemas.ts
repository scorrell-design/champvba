import { z } from 'zod'

export const addressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  street2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().length(2, 'Use 2-letter state abbreviation'),
  zip: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
})

export const addMemberSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dob: z.string().refine((val) => {
    const date = new Date(val)
    const now = new Date()
    const age = Math.floor((now.getTime() - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    return age >= 18 && age <= 120
  }, 'Age must be between 18 and 120'),
  email: z.string().email('Invalid email format'),
  phone: z.string().min(10, 'Phone number is required'),
  ssn: z.string().regex(/^\d{3}-\d{2}-\d{4}$/, 'SSN format: ###-##-####'),
  groupId: z.string().min(1, 'Group is required'),
  coverageEffectiveDate: z.string().min(1, 'Coverage date is required'),
  planId: z.string().min(1, 'Plan is required'),
  vbaEligible: z.boolean(),
  employeeId: z.string().optional(),
  address: addressSchema,
  dependents: z.number().min(0).default(0),
  optIn: z.boolean().default(false),
  holdReason: z.string().optional(),
})

export const groupInfoSchema = z.object({
  legalName: z.string().min(1, 'Legal name is required'),
  dba: z.string().optional(),
  fein: z.string().regex(/^\d{2}-\d{7}$/, 'FEIN format: ##-#######'),
  address: addressSchema,
  phone: z.string().min(10, 'Phone is required'),
  primaryContactName: z.string().min(1, 'Primary contact name is required'),
  primaryContactEmail: z.string().email('Invalid email'),
  wltGroupNumber: z.string().length(5, 'WLT Group Number must be 5 digits'),
  ppoNetwork: z.string().min(1, 'PPO Network is required'),
  pbm: z.string().default('CleverRx'),
  invoiceTemplate: z.string().default('Champion Health, Inc.'),
})

export type AddMemberFormData = z.infer<typeof addMemberSchema>
export type GroupInfoFormData = z.infer<typeof groupInfoSchema>
