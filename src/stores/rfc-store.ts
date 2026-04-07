import { create } from 'zustand'
import type { RFC } from '../types/rfc'
import { RFCS } from '../data/rfcs'

interface RFCState {
  rfcs: RFC[]
  selectedRfc: RFC | null

  setSelectedRfc: (rfc: RFC | null) => void
  setRfcForWizard: (rfc: RFC) => void
  getRfcForWizard: () => RFC | null
  clearWizardRfc: () => void
  updateStatus: (id: string, status: RFC['status']) => void
  markCompleted: (id: string) => void
  getPendingCount: () => number
}

let wizardRfc: RFC | null = null

export const useRFCStore = create<RFCState>((set, get) => ({
  rfcs: RFCS,
  selectedRfc: null,

  setSelectedRfc: (rfc) => set({ selectedRfc: rfc }),

  setRfcForWizard: (rfc) => {
    wizardRfc = rfc
  },

  getRfcForWizard: () => wizardRfc,

  clearWizardRfc: () => {
    wizardRfc = null
  },

  updateStatus: (id, status) =>
    set((s) => ({
      rfcs: s.rfcs.map((r) => (r.id === id ? { ...r, status } : r)),
      selectedRfc: s.selectedRfc?.id === id ? { ...s.selectedRfc, status } : s.selectedRfc,
    })),

  markCompleted: (id) =>
    set((s) => ({
      rfcs: s.rfcs.map((r) => (r.id === id ? { ...r, status: 'completed' as const } : r)),
    })),

  getPendingCount: () =>
    get().rfcs.filter((r) => r.status === 'new' || r.status === 'ready_to_build' || r.status === 'in_review').length,
}))
