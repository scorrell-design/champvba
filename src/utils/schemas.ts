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
  dob: z.string().min(1, 'Date of birth is required'),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  phone: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((v) => !v || /^\d{10}$/.test(v.replace(/\D/g, '')), {
      message: 'Phone must be 10 digits if provided',
    }),
  ssn: z.string().regex(/^\d{3}-\d{2}-\d{4}$/, 'SSN format: ###-##-####'),
  groupId: z.string().min(1, 'Group is required'),
  coverageEffectiveDate: z.string().min(1, 'Coverage date is required'),
  planId: z.string().min(1, 'Plan is required'),
  employeeId: z.string().optional(),
  address: addressSchema,
  dependents: z.number().min(0).default(0),
  optIn: z.boolean().default(false),
  holdReason: z.string().optional(),
  additionalProductIds: z.array(z.string()).optional().default([]),
  additionalProductDates: z.record(z.string(), z.string()).optional().default({}),
})

export const groupInfoSchema = z.object({
  legalName: z.string().min(1, 'Legal name is required'),
  dba: z.string().optional(),
  fein: z.string().regex(/^\d{2}-\d{7}$/, 'FEIN format: ##-#######'),
  address: addressSchema,
  phone: z.string().min(10, 'Phone is required'),
  primaryContactName: z.string().min(1, 'Primary contact name is required'),
  primaryContactEmail: z.string().email('Invalid email'),
  eligibilityContactName: z.string().min(1, 'Eligibility contact name is required'),
  eligibilityContactEmail: z.string().email('Invalid eligibility contact email'),
  eligibilityContactPhone: z.string().optional().or(z.literal('')),
  eligibilityContactTitle: z.string().optional().or(z.literal('')),
  wltGroupNumber: z.string().length(5, 'WLT Group Number must be 5 digits'),
  ppoNetwork: z.string().min(1, 'PPO Network is required'),
  pbm: z.string().default('CleverRx'),
  invoiceTemplate: z.string().default('Champion Health, Inc.'),
})

export type AddMemberFormData = z.infer<typeof addMemberSchema>
export type GroupInfoFormData = z.infer<typeof groupInfoSchema>
