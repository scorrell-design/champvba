import { NotesSection } from '../../../components/forms/NotesSection'
import type { Note } from '../../../types/common'

interface MemberNotesTabProps {
  memberId: string
  notes: Note[]
}

export const MemberNotesTab = ({ memberId, notes }: MemberNotesTabProps) => {
  return <NotesSection entityId={memberId} originalNotes={notes} />
}
