import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { Card } from '../../../components/ui/Card'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { formatPhone, formatSSN, formatDate } from '../../../utils/formatters'
import type { Member } from '../../../types/member'

interface MemberInfoCardProps {
  member: Member
}

export const MemberInfoCard = ({ member }: MemberInfoCardProps) => {
  const [showSSN, setShowSSN] = useState(false)
  const fullAddress = [
    member.address.street,
    member.address.street2,
    `${member.address.city}, ${member.address.state} ${member.address.zip}`,
  ]
    .filter(Boolean)
    .join(', ')

  return (
    <Card>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Left — Member Info */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            Member Info
          </h3>
          <InfoRow label="Created Date" value={formatDate(member.createdDate)} />
          <InfoRow label="Member ID" value={member.memberId} />
          <InfoRow label="Name" value={`${member.firstName} ${member.lastName}`} />
          <InfoRow label="Address" value={fullAddress} />
          <InfoRow label="Phone" value={formatPhone(member.phone)} />
          <InfoRow label="Email" value={member.email} />
          <div>
            <dt className="text-xs text-gray-500">Opt-In Status</dt>
            <dd className="mt-0.5">
              <Badge variant={member.optIn ? 'success' : 'gray'} dot>
                {member.optIn ? 'Opted In' : 'Opted Out'}
              </Badge>
            </dd>
          </div>
        </div>

        {/* Center — Agent Info */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            Agent Info
          </h3>
          <div>
            <dt className="text-xs text-gray-500">Group / Broker</dt>
            <dd className="mt-0.5">
              <Link
                to={`/groups/${member.groupId}`}
                className="text-sm font-medium text-primary-600 hover:underline"
              >
                {member.groupName}
              </Link>
            </dd>
          </div>
          <InfoRow label="Agent ID" value={member.agentId} />
          <InfoRow label="Employee ID" value={member.employeeId} />
        </div>

        {/* Right — Attributes */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            Attributes
          </h3>
          <InfoRow label="Gender" value={member.gender} />
          <InfoRow label="Date of Birth" value={formatDate(member.dob)} />
          <InfoRow label="Age" value={String(member.age)} />
          <div>
            <dt className="text-xs text-gray-500">SSN</dt>
            <dd className="mt-0.5 flex items-center gap-2">
              <span className="text-sm text-gray-900">
                {formatSSN(member.ssn, !showSSN)}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSSN(!showSSN)}
                className="h-6 px-2"
              >
                {showSSN ? (
                  <EyeOff className="h-3.5 w-3.5" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
                {showSSN ? 'Hide' : 'Show'}
              </Button>
            </dd>
          </div>
          <InfoRow label="Username" value={member.username ?? '—'} />
        </div>
      </div>
    </Card>
  )
}

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div>
    <dt className="text-xs text-gray-500">{label}</dt>
    <dd className="mt-0.5 text-sm text-gray-900">{value}</dd>
  </div>
)
