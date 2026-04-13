import { useState, useMemo } from 'react'
import { Check, AlertTriangle, ArrowRight } from 'lucide-react'
import { Modal } from '../../../components/ui/Modal'
import { Button } from '../../../components/ui/Button'
import { Badge } from '../../../components/ui/Badge'
import { useToast } from '../../../components/feedback/Toast'
import { useAuditStore } from '../../../stores/audit-store'
import { formatCurrency } from '../../../utils/formatters'
import { cn } from '../../../utils/cn'
import type { Product, CommissionType } from '../../../types/product'
import type { Group } from '../../../types/group'

function fmtComm(type?: CommissionType, amount?: number): string {
  if (!type || amount == null) return 'None'
  return type === 'flat' ? formatCurrency(amount) : `${amount}%`
}

interface CopyCommissionsModalProps {
  open: boolean
  onClose: () => void
  parentGroupId: string
  parentProducts: Product[]
  childGroups: Group[]
}

type ConflictResolution = 'overwrite' | 'skip'

interface ChildConflict {
  childGroupId: string
  childGroupName: string
  productId: string
  productName: string
  parentComm: string
  childComm: string
  resolution: ConflictResolution
}

export const CopyCommissionsModal = ({ open, onClose, parentGroupId, parentProducts, childGroups }: CopyCommissionsModalProps) => {
  const { addToast } = useToast()
  const addAuditEntry = useAuditStore((s) => s.addEntry)

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [selectedChildIds, setSelectedChildIds] = useState<Set<string>>(new Set())
  const [conflicts, setConflicts] = useState<ChildConflict[]>([])

  const productsWithCommission = parentProducts.filter((p) => p.commissionType && p.commissionAmount != null)

  const toggleChild = (id: string) => {
    setSelectedChildIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (selectedChildIds.size === childGroups.length) {
      setSelectedChildIds(new Set())
    } else {
      setSelectedChildIds(new Set(childGroups.map((g) => g.id)))
    }
  }

  const goToPreview = () => {
    const newConflicts: ChildConflict[] = []
    const selectedGroups = childGroups.filter((g) => selectedChildIds.has(g.id))

    for (const child of selectedGroups) {
      for (const parentProd of productsWithCommission) {
        const childProd = child.products.find((p) => p.productId === parentProd.productId)
        if (childProd?.commissionType && childProd.commissionAmount != null) {
          const parentStr = fmtComm(parentProd.commissionType, parentProd.commissionAmount)
          const childStr = fmtComm(childProd.commissionType, childProd.commissionAmount)
          if (parentStr !== childStr) {
            newConflicts.push({
              childGroupId: child.id,
              childGroupName: child.locationName || child.legalName,
              productId: parentProd.productId,
              productName: parentProd.name,
              parentComm: parentStr,
              childComm: childStr,
              resolution: 'overwrite',
            })
          }
        }
      }
    }

    setConflicts(newConflicts)
    setStep(2)
  }

  const setAllResolutions = (r: ConflictResolution) => {
    setConflicts((prev) => prev.map((c) => ({ ...c, resolution: r })))
  }

  const toggleConflict = (idx: number) => {
    setConflicts((prev) => prev.map((c, i) => i === idx ? { ...c, resolution: c.resolution === 'overwrite' ? 'skip' : 'overwrite' } : c))
  }

  const selectedGroups = childGroups.filter((g) => selectedChildIds.has(g.id))
  const overwriteCount = conflicts.filter((c) => c.resolution === 'overwrite').length
  const skipCount = conflicts.filter((c) => c.resolution === 'skip').length

  const missingProducts = useMemo(() => {
    const result: { childName: string; productName: string }[] = []
    for (const child of selectedGroups) {
      for (const parentProd of productsWithCommission) {
        if (!child.products.find((p) => p.productId === parentProd.productId)) {
          result.push({ childName: child.locationName || child.legalName, productName: parentProd.name })
        }
      }
    }
    return result
  }, [selectedGroups, productsWithCommission])

  const totalUpdates = useMemo(() => {
    let count = 0
    for (const child of selectedGroups) {
      for (const parentProd of productsWithCommission) {
        const childProd = child.products.find((p) => p.productId === parentProd.productId)
        if (!childProd) continue
        const conflict = conflicts.find((c) => c.childGroupId === child.id && c.productId === parentProd.productId)
        if (conflict && conflict.resolution === 'skip') continue
        count++
      }
    }
    return count
  }, [selectedGroups, productsWithCommission, conflicts])

  const handleExecute = () => {
    const details: string[] = []
    for (const child of selectedGroups) {
      const updated: string[] = []
      for (const parentProd of productsWithCommission) {
        const childProd = child.products.find((p) => p.productId === parentProd.productId)
        if (!childProd) continue
        const conflict = conflicts.find((c) => c.childGroupId === child.id && c.productId === parentProd.productId)
        if (conflict && conflict.resolution === 'skip') continue
        updated.push(parentProd.name)
      }
      if (updated.length > 0) {
        details.push(`${child.locationName || child.legalName}: ${updated.join(', ')}`)
        addAuditEntry({
          entityType: 'Group',
          entityId: child.id,
          entityName: child.locationName || child.legalName,
          fieldChanged: 'Commission (Bulk Copy)',
          oldValue: '',
          newValue: `Commissions copied from parent group ${parentGroupId}: ${updated.join(', ')}`,
          changedBy: 'Stephanie C.',
          actionType: 'Product Updated',
        })
      }
    }

    addAuditEntry({
      entityType: 'Group',
      entityId: parentGroupId,
      entityName: '',
      fieldChanged: 'Commission Copy',
      oldValue: '',
      newValue: `Commissions copied to ${selectedGroups.length} child group${selectedGroups.length !== 1 ? 's' : ''}: ${totalUpdates} product${totalUpdates !== 1 ? 's' : ''} updated, ${overwriteCount} conflict${overwriteCount !== 1 ? 's' : ''} overwritten, ${skipCount} skipped`,
      changedBy: 'Stephanie C.',
      actionType: 'Product Updated',
    })

    addToast('success', `Commissions copied to ${selectedGroups.length} child group${selectedGroups.length !== 1 ? 's' : ''} successfully`)
    handleClose()
  }

  const handleClose = () => {
    setStep(1)
    setSelectedChildIds(new Set())
    setConflicts([])
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Copy Commissions to Child Groups" size="xl">
      {step === 1 && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Select which child groups should receive the commission structure from this parent group.
            Only products that already exist on the child group will receive commissions.
          </p>
          <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
            <input
              type="checkbox"
              checked={selectedChildIds.size === childGroups.length}
              onChange={toggleAll}
              className="h-4 w-4 rounded border-gray-300 text-primary-500"
            />
            <span className="text-sm font-medium text-gray-700">Select All ({childGroups.length})</span>
          </div>
          <div className="max-h-[300px] space-y-2 overflow-y-auto">
            {childGroups.map((child) => (
              <label
                key={child.id}
                className={cn(
                  'flex cursor-pointer items-center justify-between rounded-lg border px-4 py-3 transition-colors',
                  selectedChildIds.has(child.id) ? 'border-primary-300 bg-primary-50' : 'border-gray-200 hover:bg-gray-50',
                )}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedChildIds.has(child.id)}
                    onChange={() => toggleChild(child.id)}
                    className="h-4 w-4 rounded border-gray-300 text-primary-500"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{child.locationName || child.legalName}</p>
                    <p className="text-xs text-gray-500">{child.id}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">{child.products.length} products</span>
              </label>
            ))}
          </div>
          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
            <Button variant="secondary" onClick={handleClose}>Cancel</Button>
            <Button onClick={goToPreview} disabled={selectedChildIds.size === 0}>
              Preview Changes
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Review the commissions that will be copied. {productsWithCommission.length} product{productsWithCommission.length !== 1 ? 's' : ''} with commissions from the parent group.
          </p>

          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs font-medium uppercase text-gray-500">
                  <th className="px-3 py-2">Product</th>
                  <th className="px-3 py-2">Commission</th>
                  <th className="px-3 py-2">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {productsWithCommission.map((p) => (
                  <tr key={p.productId}>
                    <td className="px-3 py-2 font-medium text-gray-800">{p.name}</td>
                    <td className="px-3 py-2">{fmtComm(p.commissionType, p.commissionAmount)}</td>
                    <td className="px-3 py-2 text-gray-500">{p.commissionType === 'flat' ? 'Flat ($)' : 'Percentage (%)'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {conflicts.length > 0 && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-amber-700">
                  <AlertTriangle className="mr-1 inline h-4 w-4" />
                  {conflicts.length} Conflict{conflicts.length !== 1 ? 's' : ''} Found
                </h4>
                <div className="flex gap-2">
                  <button onClick={() => setAllResolutions('overwrite')} className="text-xs font-medium text-primary-600 hover:underline">Overwrite All</button>
                  <button onClick={() => setAllResolutions('skip')} className="text-xs font-medium text-gray-500 hover:underline">Skip All</button>
                </div>
              </div>
              <div className="max-h-[200px] space-y-1 overflow-y-auto rounded-lg border border-amber-200 bg-amber-50 p-2">
                {conflicts.map((c, i) => (
                  <div key={i} className="flex items-center justify-between rounded-md bg-white px-3 py-2 text-xs">
                    <div>
                      <span className="font-medium text-gray-800">{c.childGroupName}</span>
                      <span className="mx-1 text-gray-400">→</span>
                      <span className="text-gray-600">{c.productName}</span>
                      <span className="ml-2 text-gray-400">Current: {c.childComm}</span>
                      <span className="mx-1 text-gray-400">→</span>
                      <span className="text-gray-600">New: {c.parentComm}</span>
                    </div>
                    <button
                      onClick={() => toggleConflict(i)}
                      className={cn(
                        'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                        c.resolution === 'overwrite' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500',
                      )}
                    >
                      {c.resolution === 'overwrite' ? 'Overwrite' : 'Skip'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {missingProducts.length > 0 && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700">
              <p className="font-medium mb-1">Products not on child groups (commissions will not be copied):</p>
              <ul className="space-y-0.5">
                {missingProducts.map((m, i) => (
                  <li key={i}>• {m.productName} — not on {m.childName}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-between border-t border-gray-100 pt-4">
            <Button variant="secondary" onClick={() => setStep(1)}>Back</Button>
            <Button onClick={() => setStep(3)}>
              Review Summary
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h4 className="text-sm font-semibold text-gray-800 mb-3">Summary</h4>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs font-medium uppercase text-gray-400">Child Groups</dt>
                <dd className="font-medium text-gray-900">{selectedGroups.length}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase text-gray-400">Products Updated</dt>
                <dd className="font-medium text-gray-900">{totalUpdates}</dd>
              </div>
              {conflicts.length > 0 && (
                <>
                  <div>
                    <dt className="text-xs font-medium uppercase text-gray-400">Conflicts Overwritten</dt>
                    <dd className="font-medium text-amber-600">{overwriteCount}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase text-gray-400">Conflicts Skipped</dt>
                    <dd className="font-medium text-gray-500">{skipCount}</dd>
                  </div>
                </>
              )}
            </dl>
          </div>

          <div className="space-y-2">
            {selectedGroups.map((child) => {
              const updatedProducts = productsWithCommission.filter((pp) => {
                const childHas = child.products.find((cp) => cp.productId === pp.productId)
                if (!childHas) return false
                const conflict = conflicts.find((c) => c.childGroupId === child.id && c.productId === pp.productId)
                return !conflict || conflict.resolution === 'overwrite'
              })
              return (
                <div key={child.id} className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-success-500" />
                    <span className="text-sm font-medium text-gray-800">{child.locationName || child.legalName}</span>
                  </div>
                  <Badge variant="gray">{updatedProducts.length} product{updatedProducts.length !== 1 ? 's' : ''}</Badge>
                </div>
              )
            })}
          </div>

          <div className="flex justify-between border-t border-gray-100 pt-4">
            <Button variant="secondary" onClick={() => setStep(2)}>Back</Button>
            <Button onClick={handleExecute}>
              Confirm & Copy
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
