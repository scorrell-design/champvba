import { useState, useMemo } from 'react'
import { Plus, Pencil, Trash2, DollarSign, Percent } from 'lucide-react'
import { Card } from '../../../components/ui/Card'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { ConfirmDialog } from '../../../components/feedback/ConfirmDialog'
import { useToast } from '../../../components/feedback/Toast'
import { useCommissionStore } from '../../../stores/commission-store'
import { logAuditEntry } from '../../../utils/audit'
import { formatDisplayDate } from '../../../utils/dates'
import { formatCurrency } from '../../../utils/formatters'
import { AddEditCommissionModal } from './AddEditCommissionModal'
import { CopyCommissionsModal } from './CopyCommissionsModal'
import type { Commission } from '../../../types/commission'
import type { Group } from '../../../types/group'

interface GroupCommissionsTabProps {
  group: Group
}

const AGENT_TYPE_VARIANTS: Record<string, 'gray' | 'info' | 'success' | 'warning'> = {
  agent: 'info',
  broker: 'success',
  enroller: 'warning',
  internal: 'gray',
}

function CommissionRow({
  commission,
  onEdit,
  onDelete,
}: {
  commission: Commission
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900">{commission.agentName}</span>
          <Badge variant={AGENT_TYPE_VARIANTS[commission.agentType] ?? 'gray'}>
            {commission.agentType}
          </Badge>
          <span className="text-xs text-gray-400">({commission.agentId})</span>
        </div>
        <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
          <span className="inline-flex items-center gap-1 font-medium text-gray-700">
            {commission.payoutType === 'flat' ? (
              <>
                <DollarSign className="h-3 w-3" />
                {formatCurrency(commission.amount)}/mo
              </>
            ) : (
              <>
                <Percent className="h-3 w-3" />
                {commission.amount}%
              </>
            )}
          </span>
          <span>·</span>
          <span>Effective {formatDisplayDate(commission.effectiveDate)}</span>
          {commission.endDate && (
            <>
              <span>–</span>
              <span>{formatDisplayDate(commission.endDate)}</span>
            </>
          )}
          {commission.filters?.benefitTier && (
            <>
              <span>·</span>
              <span>{commission.filters.benefitTier}</span>
            </>
          )}
          {commission.filters?.paymentPeriod && (
            <>
              <span>·</span>
              <span>{commission.filters.paymentPeriod}</span>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 ml-3">
        <button
          onClick={onEdit}
          className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          title="Edit commission"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={onDelete}
          className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
          title="Delete commission"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

export const GroupCommissionsTab = ({ group }: GroupCommissionsTabProps) => {
  const commissions = useCommissionStore((s) => s.getCommissionsForGroup(group.id))
  const deleteCommission = useCommissionStore((s) => s.deleteCommission)
  const { addToast } = useToast()

  const [addOpen, setAddOpen] = useState(false)
  const [addForProductId, setAddForProductId] = useState<string | undefined>()
  const [editingCommission, setEditingCommission] = useState<Commission | undefined>()
  const [copyOpen, setCopyOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Commission | null>(null)

  const commissionsByProduct = useMemo(() => {
    const map = new Map<string, Commission[]>()
    for (const product of group.products) {
      map.set(
        product.productId,
        commissions.filter((c) => c.productId === product.productId),
      )
    }
    return map
  }, [commissions, group.products])

  const totalCommissions = commissions.length

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteCommission(deleteTarget.id)
    const productName =
      group.products.find((p) => p.productId === deleteTarget.productId)?.name ?? deleteTarget.productId
    logAuditEntry({
      entityType: 'Group',
      entityId: group.id,
      entityName: group.legalName,
      fieldChanged: 'Commission',
      oldValue: `${deleteTarget.agentName}: ${deleteTarget.payoutType === 'flat' ? formatCurrency(deleteTarget.amount) : deleteTarget.amount + '%'}`,
      newValue: '',
      action: 'Commission Deleted',
      details: `Commission for ${deleteTarget.agentName} on ${productName} deleted.`,
    })
    addToast('success', `Commission for ${deleteTarget.agentName} deleted.`)
    setDeleteTarget(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">
            {totalCommissions === 0
              ? 'No commissions configured for this group.'
              : `${totalCommissions} commission${totalCommissions !== 1 ? 's' : ''} across ${group.products.length} product${group.products.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setCopyOpen(true)}
          >
            Copy From Another Group
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setAddForProductId(undefined)
              setAddOpen(true)
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Commission
          </Button>
        </div>
      </div>

      {group.products.map((product) => {
        const productCommissions = commissionsByProduct.get(product.productId) ?? []
        return (
          <Card key={product.productId}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-semibold text-gray-900">{product.name}</p>
                <p className="text-xs text-gray-500">
                  {product.productId} · {formatCurrency(product.monthlyFee)}/mo
                  {productCommissions.length > 0 && (
                    <span className="ml-2 text-gray-400">
                      · {productCommissions.length} commission{productCommissions.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setAddForProductId(product.productId)
                  setAddOpen(true)
                }}
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add
              </Button>
            </div>

            {productCommissions.length === 0 ? (
              <p className="text-sm text-gray-400 italic py-2">
                No commissions configured for this product.
              </p>
            ) : (
              <div className="space-y-2">
                {productCommissions.map((c) => (
                  <CommissionRow
                    key={c.id}
                    commission={c}
                    onEdit={() => setEditingCommission(c)}
                    onDelete={() => setDeleteTarget(c)}
                  />
                ))}
              </div>
            )}
          </Card>
        )
      })}

      {addOpen && (
        <AddEditCommissionModal
          group={group}
          presetProductId={addForProductId}
          onClose={() => {
            setAddOpen(false)
            setAddForProductId(undefined)
          }}
        />
      )}

      {editingCommission && (
        <AddEditCommissionModal
          group={group}
          existing={editingCommission}
          onClose={() => setEditingCommission(undefined)}
        />
      )}

      {copyOpen && (
        <CopyCommissionsModal
          targetGroup={group}
          onClose={() => setCopyOpen(false)}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Commission"
        message={
          deleteTarget
            ? `Delete commission for ${deleteTarget.agentName}? This cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        confirmVariant="danger"
      />
    </div>
  )
}
