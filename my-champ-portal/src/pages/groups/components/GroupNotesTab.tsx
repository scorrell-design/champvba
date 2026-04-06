import { NotesSection } from '../../../components/forms/NotesSection'
import type { Note } from '../../../types/common'

interface GroupNotesTabProps {
  groupId: string
  notes: Note[]
}

export const GroupNotesTab = ({ groupId, notes }: GroupNotesTabProps) => {
  return <NotesSection entityId={groupId} originalNotes={notes} />
}
