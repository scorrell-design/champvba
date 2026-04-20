import { useState, useMemo } from 'react'
import { Pencil, Archive, ChevronDown, ChevronUp, Clock } from 'lucide-react'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { useToast } from '../feedback/Toast'
import { useNotesStore } from '../../stores/notes-store'
import { useAuditStore } from '../../stores/audit-store'
import { formatDateTime } from '../../utils/formatters'
import { CURRENT_USER } from '../../constants/user'
import type { Note } from '../../types/common'

interface NotesSectionProps {
  entityId: string
  entityType: 'Member' | 'Group'
  entityName: string
  originalNotes: Note[]
}

export function NotesSection({ entityId, entityType, entityName, originalNotes }: NotesSectionProps) {
  const [text, setText] = useState('')
  const { addToast } = useToast()
  const addNote = useNotesStore((s) => s.addNote)
  const editNote = useNotesStore((s) => s.editNote)
  const archiveNote = useNotesStore((s) => s.archiveNote)
  const editedNotes = useNotesStore((s) => s.edited)
  const archivedNotes = useNotesStore((s) => s.archived)
  const logAuditNote = useAuditStore((s) => s.logNote)
  const logNoteEdit = useAuditStore((s) => s.logNoteEdit)
  const logNoteArchive = useAuditStore((s) => s.logNoteArchive)
  const addedNotes = useNotesStore((s) => s.added[entityId])

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [expandedHistory, setExpandedHistory] = useState<Set<string>>(new Set())

  const userNotes = useMemo(() => {
    const all = [...(addedNotes ?? []), ...originalNotes]
    return all
      .filter((n) => n.type !== 'History Note')
      .map((n) => (editedNotes[n.id] ? { ...n, ...editedNotes[n.id], author: n.author, createdAt: n.createdAt } : n))
      .filter((n) => !archivedNotes[n.id])
  }, [addedNotes, originalNotes, editedNotes, archivedNotes])

  const handleSave = () => {
    if (!text.trim()) return
    const noteText = text.trim()
    addNote(entityId, {
      id: `N-${Date.now().toString(36)}`,
      text: noteText,
      author: CURRENT_USER,
      createdAt: new Date().toISOString(),
      isAdmin: false,
      type: 'User Note',
    })
    logAuditNote({ entityType, entityId, entityName, noteText })
    addToast('success', 'Note saved')
    setText('')
  }

  const handleEdit = (note: Note) => {
    setEditingId(note.id)
    setEditText(note.text)
  }

  const handleSaveEdit = (note: Note) => {
    if (!editText.trim() || editText.trim() === note.text) {
      setEditingId(null)
      return
    }
    const oldText = note.text
    editNote(entityId, note.id, editText.trim(), CURRENT_USER)
    logNoteEdit({ entityType, entityId, entityName, noteId: note.id, oldText, newText: editText.trim() })
    addToast('success', 'Note updated')
    setEditingId(null)
    setEditText('')
  }

  const handleArchive = (note: Note) => {
    archiveNote(entityId, note.id, CURRENT_USER)
    logNoteArchive({ entityType, entityId, entityName, noteId: note.id, notePreview: note.text })
    addToast('success', 'Note archived')
  }

  const toggleHistory = (noteId: string) => {
    setExpandedHistory((prev) => {
      const next = new Set(prev)
      if (next.has(noteId)) next.delete(noteId)
      else next.add(noteId)
      return next
    })
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
        <div className="mt-3 flex items-center justify-end">
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
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-800">{note.author}</span>
                    <span className="text-xs text-gray-400">{formatDateTime(note.createdAt)}</span>
                    {note.lastEditedAt && (
                      <Badge variant="gray">
                        edited {formatDateTime(note.lastEditedAt)}
                        {note.lastEditedBy && ` by ${note.lastEditedBy}`}
                      </Badge>
                    )}
                  </div>
                  {editingId === note.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        rows={3}
                        className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleSaveEdit(note)} disabled={!editText.trim()}>
                          Save
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => setEditingId(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">{note.text}</p>
                  )}

                  {note.editHistory && note.editHistory.length > 0 && editingId !== note.id && (
                    <div className="mt-2">
                      <button
                        onClick={() => toggleHistory(note.id)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-gray-600"
                      >
                        <Clock className="h-3 w-3" />
                        {note.editHistory.length} edit{note.editHistory.length > 1 ? 's' : ''}
                        {expandedHistory.has(note.id) ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </button>
                      {expandedHistory.has(note.id) && (
                        <div className="mt-2 space-y-1 border-l-2 border-gray-200 pl-3">
                          {note.editHistory.map((edit, i) => (
                            <div key={i} className="text-xs text-gray-400">
                              <span className="font-medium">{edit.editedBy}</span> edited on {formatDateTime(edit.editedAt)}
                              {edit.text && (
                                <p className="mt-0.5 text-gray-500 italic">Previous: "{edit.text}"</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {editingId !== note.id && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(note)}
                      className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      title="Edit note"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleArchive(note)}
                      className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-amber-600"
                      title="Archive note"
                    >
                      <Archive className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
