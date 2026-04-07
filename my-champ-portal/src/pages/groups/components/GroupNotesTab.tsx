import { NotesSection } from '../../../components/forms/NotesSection'
import type { Note } from '../../../types/common'

interface GroupNotesTabProps {
  groupId: string
  groupName: string
  notes: Note[]
}

export const GroupNotesTab = ({ groupId, groupName, notes }: GroupNotesTabProps) => {
  return <NotesSection entityId={groupId} entityType="Group" entityName={groupName} originalNotes={notes} />
}
