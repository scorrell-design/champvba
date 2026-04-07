import type { AuditEntry, AuditActionType } from '../types/audit'
import type { SystemBadge } from '../utils/constants'

const CHANGERS = ['Stephanie C.', 'Tori M.', 'Kacy L.', 'Lillie R.', 'System Import']

const SYS: Record<string, SystemBadge[]> = {
  ck: ['CBS', 'Kintone'],
  ca: ['CBS', 'Admin123'],
  cv: ['CBS', 'VBA'],
  cvk: ['CBS', 'VBA', 'Kintone'],
  k: ['Kintone'],
  al: ['Admin123', 'Local'],
  c: ['CBS'],
  l: ['Local'],
  cka: ['CBS', 'Kintone', 'Admin123'],
}

interface RawEntry {
  day: number
  hour: number
  min: number
  eType: 'Member' | 'Group'
  eId: string
  eName: string
  field: string
  old: string
  nw: string
  by: number
  sys: string
  batch?: string
}

function buildLog(entries: RawEntry[]): AuditEntry[] {
  return entries.map((e, i) => {
    const ts = new Date(2026, 3, 6)
    ts.setDate(ts.getDate() - e.day)
    ts.setHours(e.hour, e.min, 0, 0)

    const actionType: AuditActionType = e.field === 'Status'
      ? 'Status Changed'
      : e.field === 'Hold Reason'
        ? 'Status Changed'
        : e.field === 'Plan'
          ? (e.nw ? 'Product Added' : 'Product Removed')
          : 'Field Updated'

    return {
      id: `audit-${String(i + 1).padStart(3, '0')}`,
      timestamp: ts.toISOString(),
      entityType: e.eType,
      entityId: e.eId,
      entityName: e.eName,
      fieldChanged: e.field,
      oldValue: e.old,
      newValue: e.nw,
      changedBy: CHANGERS[e.by],
      actionType,
      systemsAffected: SYS[e.sys],
      ...(e.batch ? { batchId: e.batch } : {}),
    }
  })
}

const RAW: RawEntry[] = [
  // Day 0 — April 6
  { day: 0, hour: 9, min: 14, eType: 'Member', eId: 'm-1', eName: 'James Wilson', field: 'Email', old: 'jwilson@apexmfg.com', nw: 'james.wilson@apexmfg.com', by: 0, sys: 'ck' },
  { day: 0, hour: 10, min: 32, eType: 'Member', eId: 'm-4', eName: 'Emily Chen', field: 'Phone', old: '(313) 555-1004', nw: '(313) 555-8842', by: 1, sys: 'ca' },
  { day: 0, hour: 11, min: 5, eType: 'Group', eId: 'g-1', eName: 'Apex Manufacturing LLC', field: 'DBA', old: 'Apex Mfg', nw: 'Apex Manufacturing', by: 2, sys: 'al' },
  { day: 0, hour: 14, min: 48, eType: 'Member', eId: 'm-15', eName: 'Brian Foster', field: 'Hold Reason', old: '', nw: 'Negatively Impacted', by: 2, sys: 'cvk' },

  // Day 1
  { day: 1, hour: 8, min: 30, eType: 'Member', eId: 'm-22', eName: 'Rachel Adams', field: 'Hold Reason', old: '', nw: 'Negatively Impacted', by: 3, sys: 'cvk' },
  { day: 1, hour: 9, min: 10, eType: 'Member', eId: 'm-33', eName: 'Priya Sharma', field: 'Hold Reason', old: '', nw: 'Negatively Impacted', by: 2, sys: 'cvk' },
  { day: 1, hour: 9, min: 15, eType: 'Member', eId: 'm-47', eName: 'Jasmine Watts', field: 'Hold Reason', old: '', nw: 'Negatively Impacted', by: 2, sys: 'cvk' },
  { day: 1, hour: 11, min: 20, eType: 'Member', eId: 'm-9', eName: 'Andre Thompson', field: 'Address', old: '2950 E Jefferson Ave, Detroit, MI 48207', nw: '1515 Trumbull Ave, Detroit, MI 48216', by: 1, sys: 'ck' },

  // Day 2
  { day: 2, hour: 8, min: 45, eType: 'Member', eId: 'm-6', eName: 'Aaliyah Brown', field: 'Email', old: 'abrown@apexmfg.com', nw: 'aaliyah.brown@apexmfg.com', by: 4, sys: 'ck', batch: 'BATCH-2026-0404-A' },
  { day: 2, hour: 8, min: 45, eType: 'Member', eId: 'm-8', eName: 'Patricia Moore', field: 'Email', old: 'pmoore@apexmfg.com', nw: 'patricia.moore@apexmfg.com', by: 4, sys: 'ck', batch: 'BATCH-2026-0404-A' },
  { day: 2, hour: 8, min: 45, eType: 'Member', eId: 'm-12', eName: 'Lisa Patel', field: 'Email', old: 'lpatel@apexmfg.com', nw: 'lisa.patel@apexmfg.com', by: 4, sys: 'ck', batch: 'BATCH-2026-0404-A' },
  { day: 2, hour: 13, min: 20, eType: 'Group', eId: 'g-2', eName: 'Redwood Financial Services', field: 'Address', old: '2800 Sequoia Blvd Ste 300, San Francisco, CA 94104', nw: '2800 Sequoia Blvd Ste 400, San Francisco, CA 94104', by: 0, sys: 'cka' },

  // Day 3
  { day: 3, hour: 9, min: 0, eType: 'Member', eId: 'm-25', eName: 'Sarah Nakamura', field: 'Phone', old: '(415) 555-2002', nw: '(415) 555-9173', by: 1, sys: 'ca' },
  { day: 3, hour: 10, min: 30, eType: 'Member', eId: 'm-30', eName: 'Carlos Reyes', field: 'Address', old: '1040 El Camino Real, Redwood City, CA 94063', nw: '2210 Bridgepointe Pkwy, San Mateo, CA 94404', by: 0, sys: 'ck' },
  { day: 3, hour: 14, min: 15, eType: 'Member', eId: 'm-38', eName: 'William Porter', field: 'SSN', old: '***-**-1926', nw: '***-**-1927', by: 0, sys: 'cvk' },
  { day: 3, hour: 16, min: 5, eType: 'Group', eId: 'g-3', eName: 'Coastal Logistics Group', field: 'Phone', old: '(843) 555-0755', nw: '(843) 555-0760', by: 2, sys: 'al' },

  // Day 4
  { day: 4, hour: 8, min: 15, eType: 'Member', eId: 'm-2', eName: 'Maria Gonzalez', field: 'Coverage Effective Date', old: '2024-04-01', nw: '2024-03-15', by: 3, sys: 'cv' },
  { day: 4, hour: 9, min: 45, eType: 'Member', eId: 'm-40', eName: 'Darnell Hayes', field: 'Phone', old: '(843) 555-3003', nw: '(843) 555-7291', by: 1, sys: 'ca' },
  { day: 4, hour: 11, min: 30, eType: 'Member', eId: 'm-31', eName: 'Tiffany Nguyen', field: 'Email', old: 'tnguyen@redwoodfinancial.com', nw: 'tiffany.nguyen@redwoodfinancial.com', by: 0, sys: 'ck' },
  { day: 4, hour: 15, min: 0, eType: 'Group', eId: 'g-4', eName: 'Summit Healthcare Partners', field: 'FEIN', old: '47-8305161', nw: '47-8305162', by: 0, sys: 'cka' },

  // Day 5
  { day: 5, hour: 9, min: 20, eType: 'Member', eId: 'm-7', eName: 'David Kim', field: 'Address', old: '13400 W 10 Mile Rd, Southfield, MI 48075', nw: '24600 Lahser Rd, Southfield, MI 48033', by: 1, sys: 'ck' },
  { day: 5, hour: 10, min: 0, eType: 'Member', eId: 'm-36', eName: 'Jason Tran', field: 'Status', old: 'Active', nw: 'Terminated', by: 0, sys: 'cvk' },
  { day: 5, hour: 10, min: 10, eType: 'Member', eId: 'm-36', eName: 'Jason Tran', field: 'Plan', old: 'HSA Product', nw: '', by: 0, sys: 'cv' },
  { day: 5, hour: 13, min: 40, eType: 'Member', eId: 'm-48', eName: 'Benjamin Torres', field: 'Phone', old: '(720) 555-4001', nw: '(720) 555-8834', by: 2, sys: 'ca' },

  // Day 6
  { day: 6, hour: 8, min: 50, eType: 'Group', eId: 'g-1', eName: 'Apex Manufacturing LLC', field: 'Legal Name', old: 'Apex Manufacturing Inc.', nw: 'Apex Manufacturing LLC', by: 0, sys: 'cka' },
  { day: 6, hour: 10, min: 15, eType: 'Member', eId: 'm-43', eName: 'Tamika Owens', field: 'Email', old: 'towens@coastallogistics.com', nw: 'tamika.owens@coastallogistics.com', by: 1, sys: 'ck' },
  { day: 6, hour: 11, min: 45, eType: 'Member', eId: 'm-11', eName: 'Michael Okonkwo', field: 'DOB', old: '1976-05-29', nw: '1976-05-28', by: 3, sys: 'cvk' },
  { day: 6, hour: 14, min: 30, eType: 'Member', eId: 'm-5', eName: 'Robert Williams', field: 'Phone', old: '(313) 555-1005', nw: '(313) 555-6128', by: 1, sys: 'ca' },

  // Day 7
  { day: 7, hour: 9, min: 0, eType: 'Member', eId: 'm-14', eName: 'Samantha Lee', field: 'Address', old: '1920 Forest Ave, Detroit, MI 48207', nw: '2300 Park Ave Apt 4B, Detroit, MI 48201', by: 1, sys: 'ck' },
  { day: 7, hour: 10, min: 20, eType: 'Member', eId: 'm-21', eName: 'Steven Campbell', field: 'Status', old: 'Active', nw: 'Inactive', by: 0, sys: 'cvk' },
  { day: 7, hour: 11, min: 35, eType: 'Group', eId: 'g-5', eName: 'Prairie Wind Energy Co.', field: 'Status', old: 'New', nw: 'Pending Setup', by: 1, sys: 'c' },
  { day: 7, hour: 15, min: 10, eType: 'Member', eId: 'm-44', eName: 'Ryan Fitzgerald', field: 'Email', old: 'rfitzgerald@coastallogistics.com', nw: 'ryan.fitzgerald@coastallogistics.com', by: 4, sys: 'ck' },

  // Day 8
  { day: 8, hour: 8, min: 30, eType: 'Member', eId: 'm-29', eName: 'Megan Sullivan', field: 'Status', old: 'Active', nw: 'Inactive', by: 0, sys: 'cvk' },
  { day: 8, hour: 9, min: 55, eType: 'Member', eId: 'm-29', eName: 'Megan Sullivan', field: 'Plan', old: 'HSA Product', nw: '', by: 0, sys: 'cv' },
  { day: 8, hour: 10, min: 40, eType: 'Group', eId: 'g-2', eName: 'Redwood Financial Services', field: 'DBA', old: 'Redwood Financial Svcs', nw: 'Redwood Financial', by: 2, sys: 'al' },
  { day: 8, hour: 14, min: 15, eType: 'Member', eId: 'm-3', eName: 'Tyrone Jackson', field: 'Address', old: '309 Cass Ave, Detroit, MI 48201', nw: '4170 John R St, Detroit, MI 48201', by: 1, sys: 'ck' },

  // Day 9
  { day: 9, hour: 9, min: 10, eType: 'Member', eId: 'm-46', eName: 'Charles Dixon', field: 'Phone', old: '(843) 555-3009', nw: '(843) 555-4517', by: 2, sys: 'ca' },
  { day: 9, hour: 10, min: 25, eType: 'Member', eId: 'm-50', eName: 'Anthony Greene', field: 'Status', old: 'Active', nw: 'Inactive', by: 0, sys: 'cvk' },
  { day: 9, hour: 11, min: 50, eType: 'Member', eId: 'm-49', eName: 'Heather Collins', field: 'Coverage Effective Date', old: '2024-10-15', nw: '2024-10-01', by: 3, sys: 'cv' },
  { day: 9, hour: 15, min: 30, eType: 'Group', eId: 'g-3', eName: 'Coastal Logistics Group', field: 'First Stop Health', old: 'No', nw: 'Yes', by: 0, sys: 'cvk' },

  // Day 10
  { day: 10, hour: 8, min: 45, eType: 'Member', eId: 'm-24', eName: 'Jonathan Liu', field: 'Email', old: 'jliu@redwoodfinancial.com', nw: 'jonathan.liu@redwoodfinancial.com', by: 4, sys: 'ck', batch: 'BATCH-2026-0327-B' },
  { day: 10, hour: 8, min: 45, eType: 'Member', eId: 'm-26', eName: 'Derek Osei', field: 'Email', old: 'dosei@redwoodfinancial.com', nw: 'derek.osei@redwoodfinancial.com', by: 4, sys: 'ck', batch: 'BATCH-2026-0327-B' },
  { day: 10, hour: 8, min: 45, eType: 'Member', eId: 'm-27', eName: 'Amanda Burke', field: 'Email', old: 'aburke@redwoodfinancial.com', nw: 'amanda.burke@redwoodfinancial.com', by: 4, sys: 'ck', batch: 'BATCH-2026-0327-B' },
  { day: 10, hour: 14, min: 0, eType: 'Member', eId: 'm-17', eName: 'Marcus Rivera', field: 'SSN', old: '***-**-9146', nw: '***-**-9147', by: 0, sys: 'cvk' },

  // Day 11
  { day: 11, hour: 9, min: 30, eType: 'Member', eId: 'm-39', eName: 'Angela Mitchell', field: 'Phone', old: '(843) 555-3002', nw: '(843) 555-6483', by: 2, sys: 'ca' },
  { day: 11, hour: 10, min: 45, eType: 'Group', eId: 'g-4', eName: 'Summit Healthcare Partners', field: 'Legal Name', old: 'Summit Healthcare Group', nw: 'Summit Healthcare Partners', by: 0, sys: 'cka' },
  { day: 11, hour: 13, min: 20, eType: 'Member', eId: 'm-10', eName: 'Jennifer Davis', field: 'Address', old: '780 S Main St, Ann Arbor, MI 48104', nw: '1200 Packard St, Ann Arbor, MI 48104', by: 1, sys: 'ck' },
  { day: 11, hour: 16, min: 0, eType: 'Member', eId: 'm-42', eName: 'Kevin Duarte', field: 'Status', old: 'Active', nw: 'Inactive', by: 0, sys: 'cvk' },

  // Day 12
  { day: 12, hour: 8, min: 20, eType: 'Member', eId: 'm-20', eName: 'Keisha Robinson', field: 'Status', old: 'Active', nw: 'Inactive', by: 3, sys: 'cvk' },
  { day: 12, hour: 9, min: 40, eType: 'Member', eId: 'm-20', eName: 'Keisha Robinson', field: 'Plan', old: 'Champ 125 Plan', nw: '', by: 3, sys: 'cv' },
  { day: 12, hour: 11, min: 10, eType: 'Group', eId: 'g-1', eName: 'Apex Manufacturing LLC', field: 'FEIN', old: '84-2917364', nw: '84-2917365', by: 0, sys: 'cka' },
  { day: 12, hour: 14, min: 50, eType: 'Member', eId: 'm-32', eName: 'Gregory Walsh', field: 'Phone', old: '(415) 555-2009', nw: '(415) 555-3847', by: 1, sys: 'ca' },

  // Day 13
  { day: 13, hour: 9, min: 5, eType: 'Member', eId: 'm-41', eName: 'Stephanie Brooks', field: 'Email', old: 'sbrooks@coastallogistics.com', nw: 'stephanie.brooks@coastallogistics.com', by: 1, sys: 'ck' },
  { day: 13, hour: 10, min: 50, eType: 'Member', eId: 'm-52', eName: 'Matthew Singh', field: 'Status', old: 'Active', nw: 'Terminated', by: 0, sys: 'cvk' },
  { day: 13, hour: 13, min: 30, eType: 'Group', eId: 'g-5', eName: 'Prairie Wind Energy Co.', field: 'DBA', old: 'Prairie Wind', nw: 'Prairie Wind Energy', by: 1, sys: 'al' },
  { day: 13, hour: 15, min: 45, eType: 'Member', eId: 'm-51', eName: 'Victoria Chang', field: 'Address', old: '1550 Larimer St, Denver, CO 80202', nw: '2100 Curtis St Apt 710, Denver, CO 80205', by: 2, sys: 'ck' },

  // Day 14
  { day: 14, hour: 8, min: 40, eType: 'Member', eId: 'm-35', eName: 'Diane Fletcher', field: 'Status', old: 'Active', nw: 'Terminated', by: 0, sys: 'cvk' },
  { day: 14, hour: 9, min: 55, eType: 'Member', eId: 'm-35', eName: 'Diane Fletcher', field: 'Plan', old: 'Champ 125 Plan', nw: '', by: 0, sys: 'cv' },
  { day: 14, hour: 9, min: 55, eType: 'Member', eId: 'm-35', eName: 'Diane Fletcher', field: 'Plan', old: 'HSA Product', nw: '', by: 0, sys: 'cv' },
  { day: 14, hour: 11, min: 15, eType: 'Member', eId: 'm-19', eName: 'Daniel Park', field: 'Phone', old: '(248) 555-1019', nw: '(248) 555-7392', by: 2, sys: 'ca' },

  // Day 15
  { day: 15, hour: 9, min: 20, eType: 'Member', eId: 'm-28', eName: 'Raj Kapoor', field: 'DOB', old: '1974-06-23', nw: '1974-06-22', by: 3, sys: 'cvk' },
  { day: 15, hour: 10, min: 35, eType: 'Group', eId: 'g-6', eName: 'Ironbridge Construction Inc.', field: 'Status', old: 'Active', nw: 'Inactive', by: 0, sys: 'cvk' },
  { day: 15, hour: 11, min: 50, eType: 'Member', eId: 'm-53', eName: 'Frank DeLuca', field: 'Status', old: 'Active', nw: 'Terminated', by: 0, sys: 'cvk', batch: 'BATCH-2026-0322-C' },
  { day: 15, hour: 11, min: 50, eType: 'Member', eId: 'm-54', eName: 'Howard Steele', field: 'Status', old: 'Active', nw: 'Terminated', by: 0, sys: 'cvk', batch: 'BATCH-2026-0322-C' },

  // Day 16
  { day: 16, hour: 8, min: 30, eType: 'Member', eId: 'm-37', eName: 'Laura Schmidt', field: 'Address', old: '1660 Bush St, San Francisco, CA 94109', nw: '3200 California St, San Francisco, CA 94118', by: 1, sys: 'ck' },
  { day: 16, hour: 10, min: 10, eType: 'Group', eId: 'g-2', eName: 'Redwood Financial Services', field: 'Email', old: 'admin@redwoodfinancial.com', nw: 'hr@redwoodfinancial.com', by: 2, sys: 'al' },
  { day: 16, hour: 13, min: 45, eType: 'Member', eId: 'm-23', eName: 'Omar Hassan', field: 'Phone', old: '(313) 555-1023', nw: '(313) 555-9201', by: 1, sys: 'ca' },
  { day: 16, hour: 15, min: 20, eType: 'Member', eId: 'm-45', eName: 'Monica Vasquez', field: 'Status', old: 'Active', nw: 'Terminated', by: 0, sys: 'cvk' },

  // Day 17
  { day: 17, hour: 9, min: 15, eType: 'Group', eId: 'g-3', eName: 'Coastal Logistics Group', field: 'Legal Name', old: 'Coastal Logistics LLC', nw: 'Coastal Logistics Group', by: 0, sys: 'cka' },
  { day: 17, hour: 10, min: 30, eType: 'Member', eId: 'm-13', eName: 'Christopher Martinez', field: 'Status', old: 'Active', nw: 'Inactive', by: 3, sys: 'cvk' },
  { day: 17, hour: 11, min: 45, eType: 'Member', eId: 'm-13', eName: 'Christopher Martinez', field: 'Plan', old: 'Champ 125 Plan', nw: '', by: 3, sys: 'cv' },
  { day: 17, hour: 14, min: 20, eType: 'Member', eId: 'm-49', eName: 'Heather Collins', field: 'Email', old: 'hcollins@summithcp.com', nw: 'heather.collins@summithcp.com', by: 1, sys: 'ck' },

  // Day 18
  { day: 18, hour: 8, min: 50, eType: 'Member', eId: 'm-7', eName: 'David Kim', field: 'SSN', old: '***-**-5381', nw: '***-**-5382', by: 0, sys: 'cvk' },
  { day: 18, hour: 10, min: 5, eType: 'Group', eId: 'g-4', eName: 'Summit Healthcare Partners', field: 'First Stop Health', old: 'No', nw: 'Yes', by: 0, sys: 'cvk' },
  { day: 18, hour: 11, min: 40, eType: 'Member', eId: 'm-44', eName: 'Ryan Fitzgerald', field: 'Coverage Effective Date', old: '2024-03-01', nw: '2024-02-01', by: 3, sys: 'cv' },
  { day: 18, hour: 15, min: 15, eType: 'Group', eId: 'g-5', eName: 'Prairie Wind Energy Co.', field: 'Address', old: '601 Turbine Ln, Wichita, KS 67201', nw: '601 Turbine Ln, Wichita, KS 67202', by: 1, sys: 'al' },

  // Day 19
  { day: 19, hour: 9, min: 30, eType: 'Member', eId: 'm-2', eName: 'Maria Gonzalez', field: 'Phone', old: '(313) 555-1002', nw: '(313) 555-4718', by: 2, sys: 'ca' },
  { day: 19, hour: 10, min: 45, eType: 'Member', eId: 'm-27', eName: 'Amanda Burke', field: 'Address', old: '1901 Harrison St, Oakland, CA 94612', nw: '4100 Redwood Rd, Oakland, CA 94619', by: 1, sys: 'ck' },
  { day: 19, hour: 13, min: 10, eType: 'Group', eId: 'g-1', eName: 'Apex Manufacturing LLC', field: 'Email', old: 'admin@apexmfg.com', nw: 'benefits@apexmfg.com', by: 2, sys: 'al' },
  { day: 19, hour: 15, min: 50, eType: 'Member', eId: 'm-40', eName: 'Darnell Hayes', field: 'DOB', old: '1989-01-31', nw: '1989-01-30', by: 3, sys: 'cvk' },

  // Day 20
  { day: 20, hour: 8, min: 20, eType: 'Member', eId: 'm-34', eName: 'Nathan Cross', field: 'Phone', old: '(415) 555-2011', nw: '(415) 555-8294', by: 1, sys: 'ca' },
  { day: 20, hour: 9, min: 40, eType: 'Group', eId: 'g-6', eName: 'Ironbridge Construction Inc.', field: 'DBA', old: 'Ironbridge Const', nw: 'Ironbridge Construction', by: 2, sys: 'al' },
  { day: 20, hour: 11, min: 0, eType: 'Member', eId: 'm-48', eName: 'Benjamin Torres', field: 'Coverage Effective Date', old: '2024-10-15', nw: '2024-10-01', by: 3, sys: 'cv' },
  { day: 20, hour: 14, min: 35, eType: 'Member', eId: 'm-8', eName: 'Patricia Moore', field: 'Address', old: '6100 Grand River Ave, Detroit, MI 48208', nw: '15300 W McNichols Rd, Detroit, MI 48235', by: 1, sys: 'ck' },

  // Day 21
  { day: 21, hour: 9, min: 10, eType: 'Member', eId: 'm-43', eName: 'Tamika Owens', field: 'Coverage Effective Date', old: '2024-03-01', nw: '2024-02-01', by: 3, sys: 'cv' },
  { day: 21, hour: 10, min: 25, eType: 'Group', eId: 'g-2', eName: 'Redwood Financial Services', field: 'FEIN', old: '91-5028373', nw: '91-5028374', by: 0, sys: 'cka' },
  { day: 21, hour: 11, min: 55, eType: 'Member', eId: 'm-16', eName: 'Nicole Taylor', field: 'Phone', old: '(313) 555-1016', nw: '(313) 555-5841', by: 2, sys: 'ca' },
  { day: 21, hour: 14, min: 40, eType: 'Member', eId: 'm-26', eName: 'Derek Osei', field: 'Address', old: '3401 California St, San Francisco, CA 94118', nw: '1490 Polk St, San Francisco, CA 94109', by: 1, sys: 'ck' },

  // Day 22
  { day: 22, hour: 8, min: 35, eType: 'Member', eId: 'm-15', eName: 'Brian Foster', field: 'Hold Reason', old: 'Negatively Impacted', nw: '', by: 2, sys: 'cvk' },
  { day: 22, hour: 8, min: 36, eType: 'Member', eId: 'm-15', eName: 'Brian Foster', field: 'Status', old: 'On Hold', nw: 'Active', by: 2, sys: 'cvk' },
  { day: 22, hour: 10, min: 50, eType: 'Group', eId: 'g-4', eName: 'Summit Healthcare Partners', field: 'Address', old: '3100 Peak View Rd, Denver, CO 80201', nw: '3100 Peak View Rd, Denver, CO 80202', by: 1, sys: 'al' },
  { day: 22, hour: 15, min: 5, eType: 'Member', eId: 'm-12', eName: 'Lisa Patel', field: 'DOB', old: '1989-10-16', nw: '1989-10-15', by: 3, sys: 'cvk' },

  // Day 23
  { day: 23, hour: 9, min: 25, eType: 'Member', eId: 'm-39', eName: 'Angela Mitchell', field: 'Address', old: '1450 Meeting St, Charleston, SC 29405', nw: '220 Calhoun St, Charleston, SC 29401', by: 1, sys: 'ck' },
  { day: 23, hour: 10, min: 40, eType: 'Member', eId: 'm-52', eName: 'Matthew Singh', field: 'Plan', old: 'First Stop Post-tax Premium', nw: '', by: 0, sys: 'cv' },
  { day: 23, hour: 12, min: 15, eType: 'Group', eId: 'g-3', eName: 'Coastal Logistics Group', field: 'DBA', old: 'Coastal Logistics', nw: 'Coastal Logistics Group', by: 2, sys: 'al' },
  { day: 23, hour: 14, min: 50, eType: 'Member', eId: 'm-31', eName: 'Tiffany Nguyen', field: 'Phone', old: '(415) 555-2008', nw: '(415) 555-7125', by: 2, sys: 'ca' },

  // Day 24
  { day: 24, hour: 8, min: 45, eType: 'Member', eId: 'm-4', eName: 'Emily Chen', field: 'Email', old: 'echen@apexmfg.com', nw: 'emily.chen@apexmfg.com', by: 4, sys: 'ck', batch: 'BATCH-2026-0313-D' },
  { day: 24, hour: 8, min: 45, eType: 'Member', eId: 'm-9', eName: 'Andre Thompson', field: 'Email', old: 'athompson@apexmfg.com', nw: 'andre.thompson@apexmfg.com', by: 4, sys: 'ck', batch: 'BATCH-2026-0313-D' },
  { day: 24, hour: 8, min: 45, eType: 'Member', eId: 'm-19', eName: 'Daniel Park', field: 'Email', old: 'dpark@apexmfg.com', nw: 'daniel.park@apexmfg.com', by: 4, sys: 'ck', batch: 'BATCH-2026-0313-D' },
  { day: 24, hour: 11, min: 30, eType: 'Group', eId: 'g-6', eName: 'Ironbridge Construction Inc.', field: 'FEIN', old: '73-4162057', nw: '73-4162058', by: 0, sys: 'cka' },

  // Day 25
  { day: 25, hour: 9, min: 0, eType: 'Member', eId: 'm-46', eName: 'Charles Dixon', field: 'Email', old: 'cdixon@coastallogistics.com', nw: 'charles.dixon@coastallogistics.com', by: 1, sys: 'ck' },
  { day: 25, hour: 10, min: 20, eType: 'Member', eId: 'm-11', eName: 'Michael Okonkwo', field: 'Address', old: '1175 W Warren Ave, Detroit, MI 48201', nw: '5800 Second Ave, Detroit, MI 48202', by: 1, sys: 'ck' },
  { day: 25, hour: 13, min: 45, eType: 'Group', eId: 'g-5', eName: 'Prairie Wind Energy Co.', field: 'FEIN', old: '55-2048790', nw: '55-2048791', by: 0, sys: 'cka' },
  { day: 25, hour: 15, min: 30, eType: 'Member', eId: 'm-50', eName: 'Anthony Greene', field: 'Plan', old: 'CHAMP Claims Funding + Post-tax Premium', nw: '', by: 0, sys: 'cv' },

  // Day 26
  { day: 26, hour: 8, min: 15, eType: 'Member', eId: 'm-3', eName: 'Tyrone Jackson', field: 'Phone', old: '(313) 555-1003', nw: '(313) 555-2847', by: 2, sys: 'ca' },
  { day: 26, hour: 9, min: 50, eType: 'Member', eId: 'm-30', eName: 'Carlos Reyes', field: 'Coverage Effective Date', old: '2024-07-15', nw: '2024-07-01', by: 3, sys: 'cv' },
  { day: 26, hour: 11, min: 25, eType: 'Group', eId: 'g-1', eName: 'Apex Manufacturing LLC', field: 'DBA', old: 'Apex Industries', nw: 'Apex Manufacturing', by: 2, sys: 'al' },
  { day: 26, hour: 14, min: 0, eType: 'Member', eId: 'm-47', eName: 'Jasmine Watts', field: 'Email', old: 'jwatts@coastallogistics.com', nw: 'jasmine.watts@coastallogistics.com', by: 1, sys: 'ck' },

  // Day 27
  { day: 27, hour: 9, min: 35, eType: 'Member', eId: 'm-25', eName: 'Sarah Nakamura', field: 'Address', old: '1200 Van Ness Ave, San Francisco, CA 94109', nw: '850 North Point St, San Francisco, CA 94109', by: 1, sys: 'ck' },
  { day: 27, hour: 10, min: 45, eType: 'Member', eId: 'm-54', eName: 'Howard Steele', field: 'Phone', old: '(412) 555-5002', nw: '(412) 555-8173', by: 2, sys: 'ca' },
  { day: 27, hour: 12, min: 20, eType: 'Group', eId: 'g-3', eName: 'Coastal Logistics Group', field: 'Email', old: 'info@coastallogistics.com', nw: 'admin@coastallogistics.com', by: 2, sys: 'al' },
  { day: 27, hour: 14, min: 55, eType: 'Member', eId: 'm-17', eName: 'Marcus Rivera', field: 'SSN', old: '***-**-9145', nw: '***-**-9146', by: 0, sys: 'cvk' },

  // Day 28
  { day: 28, hour: 8, min: 40, eType: 'Member', eId: 'm-53', eName: 'Frank DeLuca', field: 'Plan', old: 'Champ 125 Plan', nw: '', by: 0, sys: 'cv' },
  { day: 28, hour: 9, min: 15, eType: 'Group', eId: 'g-4', eName: 'Summit Healthcare Partners', field: 'DBA', old: 'Summit HCP', nw: 'Summit Healthcare', by: 2, sys: 'al' },
  { day: 28, hour: 10, min: 50, eType: 'Member', eId: 'm-14', eName: 'Samantha Lee', field: 'Phone', old: '(313) 555-1014', nw: '(313) 555-6192', by: 1, sys: 'ca' },
  { day: 28, hour: 13, min: 25, eType: 'Member', eId: 'm-41', eName: 'Stephanie Brooks', field: 'Address', old: '820 Savannah Hwy, Charleston, SC 29407', nw: '1540 Ben Sawyer Blvd, Mt Pleasant, SC 29464', by: 1, sys: 'ck' },
  // Day 29
  { day: 29, hour: 9, min: 0, eType: 'Member', eId: 'm-32', eName: 'Gregory Walsh', field: 'Email', old: 'gwalsh@redwoodfinancial.com', nw: 'gregory.walsh@redwoodfinancial.com', by: 4, sys: 'ck' },
  { day: 29, hour: 9, min: 45, eType: 'Member', eId: 'm-10', eName: 'Jennifer Davis', field: 'Coverage Effective Date', old: '2024-05-01', nw: '2024-04-01', by: 3, sys: 'cv' },
  { day: 29, hour: 10, min: 30, eType: 'Group', eId: 'g-2', eName: 'Redwood Financial Services', field: 'Phone', old: '(415) 555-2799', nw: '(415) 555-2800', by: 2, sys: 'al' },
  { day: 29, hour: 11, min: 55, eType: 'Member', eId: 'm-1', eName: 'James Wilson', field: 'Address', old: '742 Maple St, Detroit, MI 48204', nw: '8920 Grand River Ave, Detroit, MI 48204', by: 1, sys: 'ck' },
]

export const AUDIT_LOG: AuditEntry[] = buildLog(RAW)
