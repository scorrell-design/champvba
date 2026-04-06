import { useState, useMemo } from 'react'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { useToast } from '../feedback/Toast'
import { useNotesStore } from '../../stores/notes-store'
import { formatDateTime } from '../../utils/formatters'
import type { Note } from '../../types/common'

interface NotesSectionProps {
  entityId: string
  originalNotes: Note[]
}

export function NotesSection({ entityId, originalNotes }: NotesSectionProps) {
  const [text, setText] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const { addToast } = useToast()
  const addNote = useNotesStore((s) => s.addNote)
  const addedNotes = useNotesStore((s) => s.added[entityId])

  const userNotes = useMemo(() => {
    const all = [...(addedNotes ?? []), ...originalNotes]
    return all.filter((n) => n.type !== 'History Note')
  }, [addedNotes, originalNotes])

  const handleSave = () => {
    if (!text.trim()) return
    addNote(entityId, {
      id: `N-${Date.now().toString(36)}`,
      text: text.trim(),
      author: 'Stephanie C.',
      createdAt: new Date().toISOString(),
      isAdmin,
      type: isAdmin ? 'Admin Only' : 'User Note',
    })
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
        {userNotes.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">No notes yet</p>
        ) : (
          userNotes.map((note) => (
            <Card key={note.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-800">{note.author}</span>
                    <span className="text-xs text-gray-400">{formatDateTime(note.createdAt)}</span>
                    {note.isAdmin && <Badge variant="purple">Admin</Badge>}
                  </div>
                  <p className="text-sm text-gray-600">{note.text}</p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
