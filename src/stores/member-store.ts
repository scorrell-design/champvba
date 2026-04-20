import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Member } from '../types/member'
import { MEMBERS } from '../data/members'

interface MemberStore {
  members: Member[]
  addMember: (member: Member) => void
  updateMember: (id: string, updates: Partial<Member>) => void
  getMemberById: (id: string) => Member | undefined
  getMembersByGroupId: (groupId: string) => Member[]
}

export const useMemberStore = create<MemberStore>()(
  persist(
    (set, get) => ({
      members: MEMBERS,
      addMember: (member) =>
        set((state) => ({
          members: [...state.members, member],
        })),
      updateMember: (id, updates) =>
        set((state) => ({
          members: state.members.map((m) =>
            String(m.id) === String(id) ? { ...m, ...updates } : m,
          ),
        })),
      getMemberById: (id) => get().members.find((m) => String(m.id) === String(id)),
      getMembersByGroupId: (gid) => get().members.filter((m) => String(m.groupId) === String(gid)),
    }),
    { name: 'champ-member-store' },
  ),
)

export function generateMemberId(): string {
  const members = useMemberStore.getState().members
  const maxNum = members
    .map((m) => {
      const match = String(m.memberId).match(/^M-(\d+)$/)
      return match ? parseInt(match[1], 10) : 0
    })
    .reduce((max, n) => Math.max(max, n), 48000)
  return `M-${maxNum + 1}`
}

export function generateMemberInternalId(): string {
  const members = useMemberStore.getState().members
  const maxNum = members
    .map((m) => {
      const match = String(m.id).match(/^m-(\d+)$/)
      return match ? parseInt(match[1], 10) : 0
    })
    .reduce((max, n) => Math.max(max, n), 0)
  return `m-${maxNum + 1}`
}
