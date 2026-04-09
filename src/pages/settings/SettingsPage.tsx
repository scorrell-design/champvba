import { useState } from 'react'
import { Plus, Pencil, Ban } from 'lucide-react'
import { PageHeader } from '../../components/layout/PageHeader'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Button } from '../../components/ui/Button'
import { Badge, type BadgeVariant } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { useTags, useCreateTag, useUpdateTag } from '../../hooks/useQueries'
import type { Tag } from '../../types/tag'

const TAG_COLORS = [
  { value: 'blue', label: 'Blue', bg: 'bg-primary-500' },
  { value: 'green', label: 'Green', bg: 'bg-success-500' },
  { value: 'purple', label: 'Purple', bg: 'bg-purple-500' },
  { value: 'orange', label: 'Orange', bg: 'bg-warning-500' },
  { value: 'teal', label: 'Teal', bg: 'bg-teal-500' },
  { value: 'red', label: 'Red', bg: 'bg-danger-500' },
  { value: 'gray', label: 'Gray', bg: 'bg-gray-400' },
] as const

const TAG_TYPE_OPTIONS = [
  { value: 'group', label: 'Group-level (inherited by members)' },
  { value: 'member', label: 'Member-level (applied directly)' },
]

const colorToBadgeVariant: Record<string, BadgeVariant> = {
  blue: 'info',
  green: 'success',
  purple: 'purple',
  orange: 'warning',
  teal: 'teal',
  red: 'danger',
  gray: 'gray',
}

interface TagFormData {
  name: string
  color: string
  type: 'group' | 'member'
  description: string
}

const emptyForm: TagFormData = {
  name: '',
  color: 'blue',
  type: 'group',
  description: '',
}

export function SettingsPage() {
  const { data: tags = [], isLoading: tagsLoading } = useTags()
  const createTagMutation = useCreateTag()
  const updateTagMutation = useUpdateTag()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [form, setForm] = useState<TagFormData>(emptyForm)
  const [formError, setFormError] = useState('')

  const openCreateModal = () => {
    setEditingTag(null)
    setForm(emptyForm)
    setFormError('')
    setModalOpen(true)
  }

  const openEditModal = (tag: Tag) => {
    setEditingTag(tag)
    setForm({
      name: tag.name,
      color: tag.color,
      type: tag.type,
      description: tag.description ?? '',
    })
    setFormError('')
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingTag(null)
    setForm(emptyForm)
    setFormError('')
  }

  const handleSave = () => {
    const trimmedName = form.name.trim()
    if (!trimmedName) {
      setFormError('Tag name is required')
      return
    }

    const duplicate = tags.find(
      (t) => t.name.toLowerCase() === trimmedName.toLowerCase() && t.id !== editingTag?.id,
    )
    if (duplicate) {
      setFormError('A tag with this name already exists')
      return
    }

    if (editingTag) {
      const data: Partial<Tag> = editingTag.isSystem
        ? { color: form.color }
        : {
            name: trimmedName,
            color: form.color,
            type: form.type,
            appliesTo: form.type === 'group' ? 'Both' : 'Members',
            description: form.description || undefined,
          }
      updateTagMutation.mutate(
        { id: editingTag.id, data },
        { onSuccess: closeModal },
      )
    } else {
      createTagMutation.mutate(
        {
          name: trimmedName,
          color: form.color,
          type: form.type,
          appliesTo: form.type === 'group' ? 'Both' : 'Members',
          description: form.description || undefined,
        },
        { onSuccess: closeModal },
      )
    }
  }

  const handleDeactivate = (tag: Tag) => {
    updateTagMutation.mutate({
      id: tag.id,
      data: { status: tag.status === 'Active' ? 'Inactive' : 'Active' },
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage portal preferences and configuration."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="text-section-title text-gray-900">General</h3>
          <div className="mt-4 space-y-4">
            <Input label="Portal Name" defaultValue="CHAMP Admin Portal" />
            <Select
              label="Default Page Size"
              options={[
                { value: '10', label: '10 rows' },
                { value: '20', label: '20 rows' },
                { value: '50', label: '50 rows' },
              ]}
              defaultValue="20"
            />
            <Select
              label="Date Format"
              options={[
                { value: 'MM/dd/yyyy', label: 'MM/DD/YYYY' },
                { value: 'yyyy-MM-dd', label: 'YYYY-MM-DD' },
                { value: 'MMM d, yyyy', label: 'MMM D, YYYY' },
              ]}
              defaultValue="MMM d, yyyy"
            />
          </div>
        </Card>

        <Card>
          <h3 className="text-section-title text-gray-900">Notifications</h3>
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-800">CBS Change Alerts</p>
                <p className="text-xs text-gray-500">Notify when FEIN or legal name changes</p>
              </div>
              <div className="relative h-6 w-11 cursor-pointer rounded-full bg-primary-500 transition-colors">
                <span className="absolute left-[22px] top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform" />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-800">Import Completion</p>
                <p className="text-xs text-gray-500">Notify when file imports finish</p>
              </div>
              <div className="relative h-6 w-11 cursor-pointer rounded-full bg-primary-500 transition-colors">
                <span className="absolute left-[22px] top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform" />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-800">Batch Update Alerts</p>
                <p className="text-xs text-gray-500">Notify on mass update operations</p>
              </div>
              <div className="relative h-6 w-11 cursor-pointer rounded-full bg-gray-300 transition-colors">
                <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform" />
              </div>
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <h3 className="text-section-title text-gray-900">System Information</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-gray-50 px-4 py-3">
              <p className="text-xs text-gray-500">Version</p>
              <p className="text-sm font-medium text-gray-800">V1.0.0 (April 2026)</p>
            </div>
            <div className="rounded-lg bg-gray-50 px-4 py-3">
              <p className="text-xs text-gray-500">Environment</p>
              <p className="text-sm font-medium text-gray-800">Demo / Prototype</p>
            </div>
            <div className="rounded-lg bg-gray-50 px-4 py-3">
              <p className="text-xs text-gray-500">Last Sync</p>
              <p className="text-sm font-medium text-gray-800">Apr 6, 2026 · 9:00 AM</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button variant="primary">Save Settings</Button>
      </div>

      {/* ── Tag Management ──────────────────────────────────────────── */}
      <Card padding={false}>
        <div className="flex items-center justify-between px-6 pt-6 pb-3">
          <div>
            <h3 className="text-section-title text-gray-900">Tag Management</h3>
            <p className="mt-0.5 text-xs text-gray-500">Create and manage tags for groups and members.</p>
          </div>
          <Button onClick={openCreateModal}>
            <Plus className="h-4 w-4" />
            Add Tag
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-t border-gray-200 bg-gray-50">
                <th className="px-6 py-3 text-left text-table-header uppercase text-gray-500">Tag Name</th>
                <th className="px-6 py-3 text-left text-table-header uppercase text-gray-500">Color</th>
                <th className="px-6 py-3 text-left text-table-header uppercase text-gray-500">Type</th>
                <th className="px-6 py-3 text-left text-table-header uppercase text-gray-500">Applies To</th>
                <th className="px-6 py-3 text-left text-table-header uppercase text-gray-500">Status</th>
                <th className="px-6 py-3 text-right text-table-header uppercase text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tagsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="border-t border-gray-200">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-6 py-3">
                        <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : tags.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-400">
                    No tags created yet
                  </td>
                </tr>
              ) : (
                tags.map((tag) => (
                  <tr key={tag.id} className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-3">
                      <Badge variant={colorToBadgeVariant[tag.color] ?? 'gray'}>
                        {tag.name}
                      </Badge>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`h-3 w-3 rounded-full ${TAG_COLORS.find((c) => c.value === tag.color)?.bg ?? 'bg-gray-400'}`} />
                        <span className="text-sm capitalize text-gray-700">{tag.color}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-700">
                      {tag.type === 'group' ? 'Group' : 'Member'}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-700">{tag.appliesTo}</td>
                    <td className="px-6 py-3">
                      <Badge variant={tag.status === 'Active' ? 'success' : 'gray'} dot>
                        {tag.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(tag)}
                          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100"
                        >
                          <Pencil className="h-3 w-3" />
                          Edit
                        </button>
                        {!tag.isSystem && (
                          <button
                            type="button"
                            onClick={() => handleDeactivate(tag)}
                            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-danger-600 hover:bg-danger-50"
                          >
                            <Ban className="h-3 w-3" />
                            {tag.status === 'Active' ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Tag Create/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingTag ? 'Edit Tag' : 'Create Tag'}
        footer={
          <>
            <Button variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button
              onClick={handleSave}
              isLoading={createTagMutation.isPending || updateTagMutation.isPending}
            >
              {editingTag ? 'Save Changes' : 'Create Tag'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Tag Name"
            required
            value={form.name}
            onChange={(e) => {
              setForm((f) => ({ ...f, name: e.target.value }))
              setFormError('')
            }}
            placeholder="e.g. Premium Plan"
            disabled={editingTag?.isSystem}
            error={formError || undefined}
          />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Tag Color <span className="ml-0.5 text-danger-500">*</span>
            </label>
            <div className="flex flex-wrap gap-3">
              {TAG_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, color: c.value }))}
                  className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${c.bg} ${
                    form.color === c.value
                      ? 'ring-2 ring-offset-2 ring-primary-500 scale-110'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                  title={c.label}
                >
                  {form.color === c.value && (
                    <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          <Select
            label="Tag Type"
            required
            options={TAG_TYPE_OPTIONS}
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as 'group' | 'member' }))}
            disabled={editingTag?.isSystem}
          />

          <Input
            label="Description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Optional description…"
            disabled={editingTag?.isSystem}
          />

          {editingTag?.isSystem && (
            <p className="rounded-lg bg-warning-50 px-3 py-2 text-xs text-warning-700">
              System tags can only have their color changed. Name, type, and description are locked.
            </p>
          )}
        </div>
      </Modal>
    </div>
  )
}
