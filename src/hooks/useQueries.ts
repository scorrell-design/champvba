import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Group } from '../types/group'
import type { Member } from '../types/member'
import {
  fetchGroups,
  fetchGroup,
  fetchMembers,
  fetchMember,
  fetchProducts,
  fetchAuditLog,
  fetchDashboardStats,
  createGroup,
  updateGroup,
  createMember,
  updateMember,
  terminateMember,
} from '../services/api'
import type { MemberFilters, AuditFilters } from '../services/api'

// ── Query keys ──────────────────────────────────────────────────────

export const queryKeys = {
  groups: ['groups'] as const,
  group: (id: string) => ['groups', id] as const,
  members: (filters?: MemberFilters) => ['members', filters ?? {}] as const,
  member: (id: string) => ['members', id] as const,
  products: ['products'] as const,
  auditLog: (filters?: AuditFilters) => ['audit-log', filters ?? {}] as const,
  dashboardStats: ['dashboard-stats'] as const,
}

// ── Query hooks ─────────────────────────────────────────────────────

export function useGroups() {
  return useQuery({
    queryKey: queryKeys.groups,
    queryFn: fetchGroups,
  })
}

export function useGroup(id: string) {
  return useQuery({
    queryKey: queryKeys.group(id),
    queryFn: () => fetchGroup(id),
    enabled: !!id,
  })
}

export function useMembers(filters?: MemberFilters) {
  return useQuery({
    queryKey: queryKeys.members(filters),
    queryFn: () => fetchMembers(filters),
  })
}

export function useMember(id: string) {
  return useQuery({
    queryKey: queryKeys.member(id),
    queryFn: () => fetchMember(id),
    enabled: !!id,
  })
}

export function useProducts() {
  return useQuery({
    queryKey: queryKeys.products,
    queryFn: fetchProducts,
  })
}

export function useAuditLog(filters?: AuditFilters) {
  return useQuery({
    queryKey: queryKeys.auditLog(filters),
    queryFn: () => fetchAuditLog(filters),
  })
}

export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.dashboardStats,
    queryFn: fetchDashboardStats,
    refetchInterval: 1000 * 60 * 5,
  })
}

// ── Mutation hooks ──────────────────────────────────────────────────

export function useCreateGroup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Group>) => createGroup(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.groups })
      qc.invalidateQueries({ queryKey: queryKeys.dashboardStats })
    },
  })
}

export function useUpdateGroup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Group> }) => updateGroup(id, data),
    onSuccess: (_result, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.groups })
      qc.invalidateQueries({ queryKey: queryKeys.group(id) })
    },
  })
}

export function useCreateMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Member>) => createMember(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['members'] })
      qc.invalidateQueries({ queryKey: queryKeys.dashboardStats })
    },
  })
}

export function useUpdateMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Member> }) => updateMember(id, data),
    onSuccess: (_result, { id }) => {
      qc.invalidateQueries({ queryKey: ['members'] })
      qc.invalidateQueries({ queryKey: queryKeys.member(id) })
    },
  })
}

export function useTerminateMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: { productIds: string[]; inactiveDate: string; inactiveReason: string; notes?: string }
    }) => terminateMember(id, data),
    onSuccess: (_result, { id }) => {
      qc.invalidateQueries({ queryKey: ['members'] })
      qc.invalidateQueries({ queryKey: queryKeys.member(id) })
      qc.invalidateQueries({ queryKey: queryKeys.dashboardStats })
    },
  })
}
