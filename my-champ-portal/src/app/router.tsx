import { Routes, Route } from 'react-router-dom'
import { DashboardLayout } from '../layouts/DashboardLayout'
import { DashboardPage } from '../pages/dashboard/DashboardPage'
import { GroupList } from '../pages/groups/GroupList'
import { GroupDetail } from '../pages/groups/GroupDetail'
import { GroupWizard } from '../pages/groups/GroupWizard'
import { MemberList } from '../pages/members/MemberList'
import { MemberDetail } from '../pages/members/MemberDetail'
import { AddNewHire } from '../pages/members/AddNewHire'
import { BatchUpdate } from '../pages/members/BatchUpdate'
import { ImportFiles } from '../pages/imports/ImportFiles'
import { RFCQueue } from '../pages/groups/RFCQueue'
import { AuditLogPage } from '../pages/audit-log/AuditLogPage'
import { CommissionsPage } from '../pages/commissions/CommissionsPage'
import { SettingsPage } from '../pages/settings/SettingsPage'

export function AppRouter() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="groups" element={<GroupList />} />
        <Route path="groups/new" element={<GroupWizard />} />
        <Route path="groups/rfc-queue" element={<RFCQueue />} />
        <Route path="groups/:id" element={<GroupDetail />} />
        <Route path="members" element={<MemberList />} />
        <Route path="members/new" element={<AddNewHire />} />
        <Route path="members/batch" element={<BatchUpdate />} />
        <Route path="members/:id" element={<MemberDetail />} />
        <Route path="imports" element={<ImportFiles />} />
        <Route path="audit-log" element={<AuditLogPage />} />
        <Route path="commissions" element={<CommissionsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}
