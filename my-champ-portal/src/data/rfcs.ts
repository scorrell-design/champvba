export interface RFC {
  id: string
  groupName: string
  dba: string
  fein: string
  agentName: string
  agentNumber: string
  agentCompany: string
  agentPhone: string
  agentEmail: string
  address: { street: string; city: string; state: string; zip: string }
  phone: string
  primaryContactName: string
  primaryContactEmail: string
  eligibilityContactEmail: string
  ppoNetwork: string
  pbm: string
  hsaFlag: boolean
  firstStopFlag: boolean
  submittedDate: string
  status: 'New' | 'In Review' | 'Ready to Build'
}

export const RFCS: RFC[] = [
  {
    id: 'rfc-001',
    groupName: 'Meridian Tech Solutions',
    dba: 'Meridian Tech',
    fein: '412789653',
    agentName: 'David Harrington',
    agentNumber: 'AGT-20418',
    agentCompany: 'Pinnacle Benefits Group',
    agentPhone: '6145559032',
    agentEmail: 'dharrington@pinnaclebenefits.com',
    address: { street: '2480 Scioto Trail Blvd', city: 'Columbus', state: 'OH', zip: '43215' },
    phone: '6145550174',
    primaryContactName: 'Jennifer Weston',
    primaryContactEmail: 'jweston@meridiantech.com',
    eligibilityContactEmail: 'eligibility@meridiantech.com',
    ppoNetwork: 'Aetna Signature Administrators',
    pbm: 'Express Scripts',
    hsaFlag: false,
    firstStopFlag: false,
    submittedDate: '2026-04-02',
    status: 'New',
  },
  {
    id: 'rfc-002',
    groupName: 'Lakewood Senior Living',
    dba: 'Lakewood SL',
    fein: '271654893',
    agentName: 'Maria Gonzalez',
    agentNumber: 'AGT-11247',
    agentCompany: 'Summit Insurance Advisors',
    agentPhone: '3125558461',
    agentEmail: 'mgonzalez@summitadvisors.com',
    address: { street: '900 N Michigan Ave, Ste 1200', city: 'Chicago', state: 'IL', zip: '60611' },
    phone: '3125550298',
    primaryContactName: 'Thomas Keller',
    primaryContactEmail: 'tkeller@lakewoodsl.org',
    eligibilityContactEmail: 'benefits@lakewoodsl.org',
    ppoNetwork: 'First Health Network',
    pbm: 'Optum Rx',
    hsaFlag: true,
    firstStopFlag: false,
    submittedDate: '2026-03-28',
    status: 'In Review',
  },
  {
    id: 'rfc-003',
    groupName: 'Cascade Timber Co.',
    dba: 'Cascade Timber',
    fein: '936281470',
    agentName: "Brian O'Malley",
    agentNumber: 'AGT-30582',
    agentCompany: 'Northwest Benefit Solutions',
    agentPhone: '5035557124',
    agentEmail: 'bomalley@nwbenefit.com',
    address: { street: '1515 SW Fifth Ave', city: 'Portland', state: 'OR', zip: '97201' },
    phone: '5035550843',
    primaryContactName: 'Rachel Fong',
    primaryContactEmail: 'rfong@cascadetimber.com',
    eligibilityContactEmail: 'hr@cascadetimber.com',
    ppoNetwork: 'PHCS / Multiplan',
    pbm: 'CVS Caremark',
    hsaFlag: false,
    firstStopFlag: true,
    submittedDate: '2026-03-20',
    status: 'Ready to Build',
  },
  {
    id: 'rfc-004',
    groupName: 'Brightpath Education Group',
    dba: 'Brightpath Ed',
    fein: '581093276',
    agentName: 'Karen Liu',
    agentNumber: 'AGT-44190',
    agentCompany: 'Horizon Benefits Consulting',
    agentPhone: '4045553617',
    agentEmail: 'kliu@horizonbc.com',
    address: { street: '3300 Peachtree Rd NE, Ste 400', city: 'Atlanta', state: 'GA', zip: '30326' },
    phone: '4045550512',
    primaryContactName: 'Marcus Whitfield',
    primaryContactEmail: 'mwhitfield@brightpathgroup.edu',
    eligibilityContactEmail: 'enrollment@brightpathgroup.edu',
    ppoNetwork: 'Cigna PPO',
    pbm: 'Express Scripts',
    hsaFlag: true,
    firstStopFlag: true,
    submittedDate: '2026-04-05',
    status: 'New',
  },
]
