import { NotesSection } from '../../../components/forms/NotesSection'
import type { Note } from '../../../types/common'

interface MemberNotesTabProps {
  memberId: string
  memberName: string
  notes: Note[]
}

export const MemberNotesTab = ({ memberId, memberName, notes }: MemberNotesTabProps) => {
  return <NotesSection entityId={memberId} entityType="Member" entityName={memberName} originalNotes={notes} />
}
