import { useState } from 'react'
import { Card } from '../../../components/ui/Card'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { useToast } from '../../../components/feedback/Toast'
import { formatDateTime } from '../../../utils/formatters'
import type { Note } from '../../../types/common'

interface GroupNotesTabProps {
  notes: Note[]
}

export const GroupNotesTab = ({ notes }: GroupNotesTabProps) => {
  const [text, setText] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const { addToast } = useToast()

  const handleSave = () => {
    if (!text.trim()) return
    addToast('success', 'Note saved')
    setText('')
    setIsAdmin(false)
  }

  return (
    <div className="space-y-6">
      <Card>
        <h4 className="mb-3 text-sm font-medium text-gray-700">Add Note</h4>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          className="block w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-200"
          placeholder="Enter a note…"
        />
        <div className="mt-3 flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={isAdmin}
              onChange={(e) => setIsAdmin(e.target.checked)}
              className="rounded border-gray-300 text-primary-500 focus:ring-primary-200"
            />
            Admin Only
          </label>
          <Button size="sm" onClick={handleSave} disabled={!text.trim()}>
            Save Note
          </Button>
        </div>
      </Card>

      <div className="space-y-3">
        {notes.map((note) => (
          <Card key={note.id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-800">{note.author}</span>
                  <span className="text-xs text-gray-400">{formatDateTime(note.createdAt)}</span>
                  <Badge variant={note.type === 'Admin Only' ? 'purple' : 'gray'}>
                    {note.type}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{note.text}</p>
              </div>
            </div>
          </Card>
        ))}
        {notes.length === 0 && (
          <p className="py-8 text-center text-sm text-gray-400">No notes yet</p>
        )}
      </div>
    </div>
  )
}
