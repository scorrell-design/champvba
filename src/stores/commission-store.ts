import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Commission, CopyCommissionsParams, CopyCommissionsResult } from '../types/commission'
import { CURRENT_USER } from '../constants/user'
import { MOCK_COMMISSIONS } from '../data/commissions'

interface CommissionStore {
  commissions: Commission[]

  getCommissionsForProduct: (groupId: string, productId: string) => Commission[]
  getCommissionsForGroup: (groupId: string) => Commission[]
  getCommissionById: (id: string) => Commission | undefined
  getGroupsWithCommissions: () => string[]

  addCommission: (c: Omit<Commission, 'id' | 'createdAt' | 'createdBy'>) => Commission
  updateCommission: (id: string, updates: Partial<Commission>) => void
  deleteCommission: (id: string) => void
  copyCommissions: (params: CopyCommissionsParams) => CopyCommissionsResult
}

function generateCommissionId(existing: Commission[]): string {
  const maxNum = existing
    .map((c) => {
      const match = String(c.id).match(/^C-(\d+)$/)
      return match ? parseInt(match[1], 10) : 0
    })
    .reduce((max, n) => Math.max(max, n), 10000)
  return `C-${maxNum + 1}`
}

export const useCommissionStore = create<CommissionStore>()(
  persist(
    (set, get) => ({
      commissions: MOCK_COMMISSIONS,

      getCommissionsForProduct: (groupId, productId) =>
        get().commissions.filter(
          (c) => String(c.groupId) === String(groupId) && String(c.productId) === String(productId),
        ),

      getCommissionsForGroup: (groupId) =>
        get().commissions.filter((c) => String(c.groupId) === String(groupId)),

      getCommissionById: (id) => get().commissions.find((c) => String(c.id) === String(id)),

      getGroupsWithCommissions: () =>
        Array.from(new Set(get().commissions.map((c) => c.groupId))),

      addCommission: (partial) => {
        const newCommission: Commission = {
          ...partial,
          id: generateCommissionId(get().commissions),
          createdAt: new Date().toISOString(),
          createdBy: CURRENT_USER,
        }
        set((state) => ({ commissions: [...state.commissions, newCommission] }))
        return newCommission
      },

      updateCommission: (id, updates) => {
        set((state) => ({
          commissions: state.commissions.map((c) =>
            String(c.id) === String(id)
              ? {
                  ...c,
                  ...updates,
                  lastModifiedAt: new Date().toISOString(),
                  lastModifiedBy: CURRENT_USER,
                }
              : c,
          ),
        }))
      },

      deleteCommission: (id) => {
        set((state) => ({
          commissions: state.commissions.filter((c) => String(c.id) !== String(id)),
        }))
      },

      copyCommissions: (params) => {
        const { fromGroupId, fromProductIds, toGroupIds, mode, previewOnly } = params
        const all = get().commissions
        const source = all.filter(
          (c) =>
            String(c.groupId) === String(fromGroupId) &&
            (!fromProductIds || fromProductIds.includes(c.productId)),
        )

        const result: CopyCommissionsResult = {
          wouldAdd: 0,
          wouldRemove: 0,
          copied: 0,
          errors: [],
        }

        if (source.length === 0) {
          result.errors.push(`Source group ${fromGroupId} has no commissions to copy.`)
          return result
        }

        const newCommissions: Commission[] = []
        const removals: string[] = []

        for (const destGroupId of toGroupIds) {
          if (mode === 'replace') {
            const affectedProductIds = new Set(source.map((s) => s.productId))
            const toRemove = all.filter(
              (c) => String(c.groupId) === String(destGroupId) && affectedProductIds.has(c.productId),
            )
            removals.push(...toRemove.map((c) => c.id))
            result.wouldRemove += toRemove.length
          }

          for (const s of source) {
            const copied: Commission = {
              ...s,
              id: generateCommissionId([...all, ...newCommissions]),
              groupId: destGroupId,
              createdAt: new Date().toISOString(),
              createdBy: CURRENT_USER,
              lastModifiedAt: undefined,
              lastModifiedBy: undefined,
            }
            newCommissions.push(copied)
            result.wouldAdd++
          }
        }

        if (!previewOnly) {
          set((state) => ({
            commissions: [
              ...state.commissions.filter((c) => !removals.includes(c.id)),
              ...newCommissions,
            ],
          }))
          result.copied = newCommissions.length
        }

        return result
      },
    }),
    { name: 'champ-commission-store' },
  ),
)
