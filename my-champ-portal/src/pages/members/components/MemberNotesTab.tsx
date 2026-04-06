import { useState } from 'react'
import { MessageSquare } from 'lucide-react'
import { Card } from '../../../components/ui/Card'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { Textarea } from '../../../components/ui/Textarea'
import { Select } from '../../../components/ui/Select'
import { formatDateTime } from '../../../utils/formatters'
import type { Note } from '../../../types/common'

interface MemberNotesTabProps {
  notes: Note[]
}

const NOTE_TYPE_OPTIONS = [
  { value: 'History Note', label: 'History Note' },
  { value: 'User Note', label: 'User Note' },
  { value: 'Admin Only', label: 'Admin Only' },
]

const typeVariant = {
  'History Note': 'info' as const,
  'User Note': 'gray' as const,
  'Admin Only': 'warning' as const,
}

export const MemberNotesTab = ({ notes }: MemberNotesTabProps) => {
  const [text, setText] = useState('')
  const [noteType, setNoteType] = useState('History Note')

  const handleAdd = () => {
    if (!text.trim()) return
    setText('')
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">Add Note</h3>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter a note…"
          />
          <div className="flex items-end gap-3">
            <Select
              options={NOTE_TYPE_OPTIONS}
              value={noteType}
              onChange={(e) => setNoteType(e.target.value)}
              className="w-48"
            />
            <Button size="sm" onClick={handleAdd} disabled={!text.trim()}>
              Add Note
            </Button>
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        {notes.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-gray-400">
            <MessageSquare className="h-10 w-10" />
            <p className="text-sm">No notes yet</p>
          </div>
        ) : (
          notes.map((note) => (
            <Card key={note.id} className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">{note.author}</span>
                  <span className="text-xs text-gray-400">{formatDateTime(note.createdAt)}</span>
                  <Badge variant={typeVariant[note.type]}>{note.type}</Badge>
                </div>
                <p className="mt-1 text-sm text-gray-700">{note.text}</p>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
