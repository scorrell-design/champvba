import { useState, useMemo } from 'react'
import { ArrowRight, Check, AlertTriangle, Info } from 'lucide-react'
import { Modal } from '../../../components/ui/Modal'
import { Button } from '../../../components/ui/Button'
import { Badge } from '../../../components/ui/Badge'
import { SearchBar } from '../../../components/ui/SearchBar'
import { useToast } from '../../../components/feedback/Toast'
import { useCommissionStore } from '../../../stores/commission-store'
import { useGroups } from '../../../hooks/useQueries'
import { logAuditEntry } from '../../../utils/audit'
import { formatCurrency } from '../../../utils/formatters'
import { cn } from '../../../utils/cn'
import type { Group } from '../../../types/group'
import type { CopyCommissionsResult } from '../../../types/commission'

interface CopyCommissionsModalProps {
  targetGroup: Group
  onClose: () => void
}

export const CopyCommissionsModal = ({ targetGroup, onClose }: CopyCommissionsModalProps) => {
  const { addToast } = useToast()
  const { data: allGroups = [] } = useGroups()
  const allCommissions = useCommissionStore((s) => s.commissions)
  const copyCommissions = useCommissionStore((s) => s.copyCommissions)

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [sourceGroupId, setSourceGroupId] = useState('')
  const [sourceSearch, setSourceSearch] = useState('')
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set())
  const [mode, setMode] = useState<'merge' | 'replace'>('merge')
  const [previewResult, setPreviewResult] = useState<CopyCommissionsResult | null>(null)

  const groupIdsWithCommissions = useMemo(
    () => new Set(allCommissions.map((c) => c.groupId)),
    [allCommissions],
  )

  const sourceGroups = useMemo(() => {
    return allGroups.filter(
      (g) => g.id !== targetGroup.id && groupIdsWithCommissions.has(g.id),
    )
  }, [allGroups, targetGroup.id, groupIdsWithCommissions])

  const filteredSourceGroups = useMemo(() => {
    if (!sourceSearch.trim()) return sourceGroups
    const q = sourceSearch.toLowerCase()
    return sourceGroups.filter(
      (g) => g.legalName.toLowerCase().includes(q) || g.id.toLowerCase().includes(q),
    )
  }, [sourceGroups, sourceSearch])

  const sourceGroup = allGroups.find((g) => g.id === sourceGroupId)
  const sourceCommissions = useMemo(
    () => (sourceGroupId ? allCommissions.filter((c) => c.groupId === sourceGroupId) : []),
    [sourceGroupId, allCommissions],
  )

  const productIdsWithCommissions = useMemo(
    () => Array.from(new Set(sourceCommissions.map((c) => c.productId))),
    [sourceCommissions],
  )

  const getProductName = (pid: string) => {
    const fromSource = sourceGroup?.products.find((p) => p.productId === pid)
    if (fromSource) return fromSource.name
    const fromTarget = targetGroup.products.find((p) => p.productId === pid)
    if (fromTarget) return fromTarget.name
    return pid
  }

  const handleSelectSource = (groupId: string) => {
    setSourceGroupId(groupId)
    const comms = allCommissions.filter((c) => c.groupId === groupId)
    setSelectedProductIds(new Set(comms.map((c) => c.productId)))
    setStep(2)
  }

  const toggleProduct = (pid: string) => {
    setSelectedProductIds((prev) => {
      const next = new Set(prev)
      if (next.has(pid)) next.delete(pid)
      else next.add(pid)
      return next
    })
  }

  const toggleAllProducts = () => {
    if (selectedProductIds.size === productIdsWithCommissions.length) {
      setSelectedProductIds(new Set())
    } else {
      setSelectedProductIds(new Set(productIdsWithCommissions))
    }
  }

  const handlePreview = () => {
    const result = copyCommissions({
      fromGroupId: sourceGroupId,
      fromProductIds: Array.from(selectedProductIds),
      toGroupIds: [targetGroup.id],
      mode,
      previewOnly: true,
    })
    setPreviewResult(result)
    setStep(3)
  }

  const handleExecute = () => {
    const result = copyCommissions({
      fromGroupId: sourceGroupId,
      fromProductIds: Array.from(selectedProductIds),
      toGroupIds: [targetGroup.id],
      mode,
      previewOnly: false,
    })

    logAuditEntry({
      entityType: 'Group',
      entityId: targetGroup.id,
      entityName: targetGroup.legalName,
      fieldChanged: 'Commissions (Bulk Copy)',
      oldValue: '',
      newValue: `${result.copied} commissions copied from ${sourceGroup?.legalName ?? sourceGroupId}. Mode: ${mode}.`,
      action: 'Commissions Copied',
    })

    addToast(
      'success',
      `${result.copied} commission${result.copied !== 1 ? 's' : ''} copied from ${sourceGroup?.legalName ?? sourceGroupId}.`,
    )
    onClose()
  }

  const handleClose = () => {
    setStep(1)
    setSourceGroupId('')
    setSourceSearch('')
    setSelectedProductIds(new Set())
    setPreviewResult(null)
    onClose()
  }

  return (
    <Modal open onClose={handleClose} title="Copy Commissions" size="xl">
      {/* Step 1: Select source group */}
      {step === 1 && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Select a group to copy commissions from. Only groups with configured commissions are shown.
          </p>

          <SearchBar
            value={sourceSearch}
            onChange={setSourceSearch}
            placeholder="Search groups by name or ID…"
          />

          {sourceGroups.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">
              No other groups have commissions configured.
            </p>
          ) : (
            <div className="max-h-[350px] space-y-2 overflow-y-auto">
              {filteredSourceGroups.map((g) => {
                const comms = allCommissions.filter((c) => c.groupId === g.id)
                const productCount = new Set(comms.map((c) => c.productId)).size
                return (
                  <button
                    key={g.id}
                    onClick={() => handleSelectSource(g.id)}
                    className="flex w-full items-center justify-between rounded-lg border border-gray-200 px-4 py-3 text-left transition-colors hover:border-primary-300 hover:bg-primary-50"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{g.legalName}</p>
                      <p className="text-xs text-gray-500">{g.id}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="gray">
                        {comms.length} commission{comms.length !== 1 ? 's' : ''}
                      </Badge>
                      <Badge variant="gray">
                        {productCount} product{productCount !== 1 ? 's' : ''}
                      </Badge>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          <div className="flex justify-end border-t border-gray-100 pt-4">
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Select products + mode */}
      {step === 2 && sourceGroup && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 rounded-lg border border-primary-200 bg-primary-50 px-3 py-2">
            <Info className="h-4 w-4 text-primary-500 shrink-0" />
            <p className="text-sm text-primary-700">
              Copying from <span className="font-semibold">{sourceGroup.legalName}</span> to{' '}
              <span className="font-semibold">{targetGroup.legalName}</span>
            </p>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-700">Products with Commissions</h4>
              <button
                onClick={toggleAllProducts}
                className="text-xs font-medium text-primary-600 hover:underline"
              >
                {selectedProductIds.size === productIdsWithCommissions.length
                  ? 'Deselect All'
                  : 'Select All'}
              </button>
            </div>

            <div className="space-y-2 rounded-lg border border-gray-200 p-3">
              {productIdsWithCommissions.map((pid) => {
                const commsForProduct = sourceCommissions.filter((c) => c.productId === pid)
                return (
                  <label
                    key={pid}
                    className={cn(
                      'flex cursor-pointer items-center justify-between rounded-md px-3 py-2 transition-colors',
                      selectedProductIds.has(pid)
                        ? 'bg-primary-50 border border-primary-200'
                        : 'bg-gray-50 border border-transparent hover:bg-gray-100',
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedProductIds.has(pid)}
                        onChange={() => toggleProduct(pid)}
                        className="h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-200"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-800">
                          {getProductName(pid)}
                        </span>
                        <span className="ml-2 text-xs text-gray-400">({pid})</span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {commsForProduct.length} commission{commsForProduct.length !== 1 ? 's' : ''}
                    </span>
                  </label>
                )
              })}
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-semibold text-gray-700">Copy Mode</h4>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="mode"
                  checked={mode === 'merge'}
                  onChange={() => setMode('merge')}
                  className="h-4 w-4 border-gray-300 text-primary-500 focus:ring-primary-200"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">Merge</span>
                  <p className="text-xs text-gray-500">Keep existing commissions, add new ones</p>
                </div>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="mode"
                  checked={mode === 'replace'}
                  onChange={() => setMode('replace')}
                  className="h-4 w-4 border-gray-300 text-primary-500 focus:ring-primary-200"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">Replace</span>
                  <p className="text-xs text-gray-500">
                    Delete destination commissions for selected products first
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div className="flex justify-between border-t border-gray-100 pt-4">
            <Button variant="secondary" onClick={() => { setStep(1); setSourceGroupId('') }}>
              Back
            </Button>
            <Button onClick={handlePreview} disabled={selectedProductIds.size === 0}>
              Preview
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Preview + confirm */}
      {step === 3 && previewResult && sourceGroup && (
        <div className="space-y-4">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h4 className="text-sm font-semibold text-gray-800 mb-3">Preview Results</h4>
            <dl className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <dt className="text-xs font-medium uppercase text-gray-400">Will Be Added</dt>
                <dd className="text-lg font-semibold text-success-600">
                  {previewResult.wouldAdd}
                </dd>
              </div>
              {mode === 'replace' && (
                <div>
                  <dt className="text-xs font-medium uppercase text-gray-400">Will Be Removed</dt>
                  <dd className="text-lg font-semibold text-red-600">
                    {previewResult.wouldRemove}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-xs font-medium uppercase text-gray-400">Products Affected</dt>
                <dd className="text-lg font-semibold text-gray-900">
                  {selectedProductIds.size}
                </dd>
              </div>
            </dl>
          </div>

          {previewResult.errors.length > 0 && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium text-red-700">Errors</span>
              </div>
              <ul className="text-sm text-red-600 space-y-1">
                {previewResult.errors.map((err, i) => (
                  <li key={i}>• {err}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs font-medium uppercase text-gray-500">
                  <th className="px-3 py-2">Product</th>
                  <th className="px-3 py-2">Commissions</th>
                  <th className="px-3 py-2">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {Array.from(selectedProductIds).map((pid) => {
                  const comms = sourceCommissions.filter((c) => c.productId === pid)
                  return (
                    <tr key={pid}>
                      <td className="px-3 py-2 font-medium text-gray-800">
                        {getProductName(pid)}
                      </td>
                      <td className="px-3 py-2">
                        {comms.map((c) => (
                          <div key={c.id} className="text-xs text-gray-600">
                            {c.agentName} —{' '}
                            {c.payoutType === 'flat'
                              ? formatCurrency(c.amount)
                              : `${c.amount}%`}
                          </div>
                        ))}
                      </td>
                      <td className="px-3 py-2 text-gray-500">{sourceGroup.legalName}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-blue-50 border border-blue-200 px-3 py-2">
            <Check className="h-4 w-4 text-blue-500 shrink-0" />
            <p className="text-sm text-blue-700">
              {previewResult.wouldAdd} commission{previewResult.wouldAdd !== 1 ? 's' : ''} will be
              added to <span className="font-semibold">{targetGroup.legalName}</span>
              {mode === 'replace' && previewResult.wouldRemove > 0
                ? ` (${previewResult.wouldRemove} existing will be removed)`
                : ''}
              .
            </p>
          </div>

          <div className="flex justify-between border-t border-gray-100 pt-4">
            <Button variant="secondary" onClick={() => setStep(2)}>
              Go Back
            </Button>
            <Button onClick={handleExecute} disabled={previewResult.errors.length > 0}>
              Confirm & Copy
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
