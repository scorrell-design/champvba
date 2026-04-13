import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, FileText } from 'lucide-react'
import { PageHeader } from '../../components/layout/PageHeader'
import { Button } from '../../components/ui/Button'
import { useToast } from '../../components/feedback/Toast'
import { useCreateGroup } from '../../hooks/useQueries'
import { useRFCStore } from '../../stores/rfc-store'
import { cn } from '../../utils/cn'
import { formatDate } from '../../utils/formatters'
import {
  StepAgent,
  StepInfo,
  StepTemplate,
  StepReview,
  type WizardAgent,
  type WizardFormData,
  type WizardTemplateProduct,
} from './components/WizardSteps'

const STEPS = ['Agent Lookup', 'Group Info', 'Product Template', 'Review & Create']

const WizardProgress = ({ current }: { current: number }) => (
  <div className="mb-8 flex items-center justify-between">
    {STEPS.map((label, i) => {
      const completed = i < current
      const active = i === current
      return (
        <div key={label} className="flex flex-1 items-center">
          <div className="flex flex-col items-center gap-1">
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium',
                completed && 'bg-success-500 text-white',
                active && 'bg-primary-500 text-white',
                !completed && !active && 'bg-gray-200 text-gray-500',
              )}
            >
              {completed ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span
              className={cn(
                'text-xs whitespace-nowrap',
                active ? 'font-medium text-primary-600' : 'text-gray-500',
              )}
            >
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={cn('mx-2 h-0.5 flex-1', completed ? 'bg-success-500' : 'bg-gray-200')} />
          )}
        </div>
      )
    })}
  </div>
)

const INITIAL_FORM: WizardFormData = {
  legalName: '',
  dba: '',
  fein: '',
  street: '',
  street2: '',
  city: '',
  state: '',
  zip: '',
  phone: '',
  contactName: '',
  contactEmail: '',
  eligibilityContactEmail: '',
  eligibilityContactPhone: '',
  billingContactName: '',
  billingContactEmail: '',
  billingContactPhone: '',
  ppoNetwork: 'First Health Network',
  pbm: 'CleverRx',
  invoiceTemplate: 'Champion Health, Inc.',
  section125PostTax: '',
}

export const GroupWizard = () => {
  const getRfcForWizard = useRFCStore((s) => s.getRfcForWizard)
  const clearWizardRfc = useRFCStore((s) => s.clearWizardRfc)
  const markCompleted = useRFCStore((s) => s.markCompleted)
  const rfcData = getRfcForWizard()
  const isRFCMode = !!rfcData

  const buildInitialForm = (): WizardFormData => {
    if (!rfcData) return INITIAL_FORM
    return {
      legalName: rfcData.legalName,
      dba: rfcData.dba ?? '',
      fein: rfcData.fein,
      street: rfcData.address.street,
      street2: rfcData.address.street2 ?? '',
      city: rfcData.address.city,
      state: rfcData.address.state,
      zip: rfcData.address.zip,
      phone: rfcData.phone,
      contactName: rfcData.primaryContact.name,
      contactEmail: rfcData.primaryContact.email,
      eligibilityContactEmail: rfcData.eligibilityContact?.email ?? '',
      eligibilityContactPhone: rfcData.eligibilityContact?.phone ?? '',
      billingContactName: rfcData.billingContact?.name ?? '',
      billingContactEmail: rfcData.billingContact?.email ?? '',
      billingContactPhone: rfcData.billingContact?.phone ?? '',
      ppoNetwork: rfcData.ppoNetwork || 'First Health',
      pbm: rfcData.pbm || 'CleverRx',
      invoiceTemplate: 'Champion Health, Inc.',
      section125PostTax: rfcData.section125PostTax ?? '',
    }
  }

  const buildInitialAgent = (): WizardAgent | null => {
    if (!rfcData) return null
    return {
      id: `rfc-agent-${rfcData.agent.agentNumber}`,
      name: `${rfcData.agent.firstName} ${rfcData.agent.lastName}`,
      number: rfcData.agent.agentNumber,
      company: rfcData.agent.company,
      phone: rfcData.agent.phone,
      email: rfcData.agent.email,
      tinNpiCode: rfcData.agent.tinNpiCode,
    }
  }

  const buildInitialTemplate = (): string => {
    if (!rfcData) return 'standard'
    const hsa = rfcData.hsaFlag === 'yes'
    const fs = rfcData.firstStopHealthFlag
    if (hsa && fs) return 'firstStopHsa'
    if (hsa) return 'hsa'
    if (fs) return 'firstStop'
    return 'standard'
  }

  const [step, setStep] = useState(0)
  const [agent, setAgent] = useState<WizardAgent | null>(buildInitialAgent)
  const [form, setForm] = useState<WizardFormData>(buildInitialForm)
  const [templateKey, setTemplateKey] = useState(buildInitialTemplate)
  const [products, setProducts] = useState<WizardTemplateProduct[]>([])
  const navigate = useNavigate()
  const { addToast } = useToast()
  const createGroup = useCreateGroup()

  const canNext = () => {
    if (step === 0) return !!agent
    if (step === 1) return !!form.legalName && !!form.fein
    return true
  }

  const handleCreate = () => {
    const tKey = templateKey as 'standard' | 'hsa' | 'firstStop' | 'firstStopHsa'
    const isHsa = tKey === 'hsa' || tKey === 'firstStopHsa'
    const isFsh = tKey === 'firstStop' || tKey === 'firstStopHsa'

    const groupProducts = products.map((wp) => ({
      id: `prod-new-${wp.productId}`,
      productId: wp.productId,
      name: wp.name,
      adminLabel: wp.name,
      category: 'Champ Product',
      monthlyFee: wp.monthlyFee,
      status: 'Active' as const,
      commissionable: wp.commissionable,
      websiteDisplay: true,
      websiteOrder: 0,
    }))

    createGroup.mutate(
      {
        legalName: form.legalName,
        dba: form.dba,
        fein: form.fein,
        address: { street: form.street, street2: form.street2, city: form.city, state: form.state, zip: form.zip },
        contact: { phone1: form.phone, email1: form.contactEmail },
        primaryContactName: form.contactName,
        primaryContactEmail: form.contactEmail,
        agentName: agent?.name ?? '',
        agentNumber: agent?.number ?? '',
        agentCompany: agent?.company ?? '',
        agentPhone: agent?.phone ?? '',
        agentEmail: agent?.email ?? '',
        ppoNetwork: form.ppoNetwork,
        pbm: form.pbm,
        invoiceTemplate: form.invoiceTemplate,
        templateType: tKey,
        isVBA: false,
        hasHSA: isHsa,
        hsaOffered: isHsa,
        hasFirstStopHealth: isFsh,
        firstStopHealth: isFsh,
        products: groupProducts,
      },
      {
        onSuccess: (newGroup) => {
          if (isRFCMode && rfcData) {
            markCompleted(rfcData.id)
            clearWizardRfc()
          }
          addToast('success', `Group "${form.legalName}" created successfully. Group ID: ${newGroup.id}.`)
          navigate(`/groups/${newGroup.id}`)
        },
        onError: () => addToast('error', 'Failed to create group'),
      },
    )
  }

  return (
    <div>
      <PageHeader title="New Group" backLink="/groups" />
      <WizardProgress current={step} />

      {isRFCMode && rfcData && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-primary-200 bg-primary-50 px-4 py-3">
          <FileText className="h-5 w-5 shrink-0 text-primary-500" />
          <div className="flex-1">
            <p className="text-sm font-medium text-primary-700">
              Pre-populated from RFC: {rfcData.legalName}
            </p>
            <p className="text-xs text-primary-600">
              Submitted {formatDate(rfcData.dateSubmitted)} — All fields are editable
            </p>
          </div>
        </div>
      )}

      {step === 0 && <StepAgent agent={agent} onSelect={setAgent} isRFCMode={isRFCMode} rfcData={rfcData} />}
      {step === 1 && <StepInfo form={form} onChange={setForm} isRFCMode={isRFCMode} rfcData={rfcData} />}
      {step === 2 && (
        <StepTemplate
          templateKey={templateKey}
          onTemplateChange={setTemplateKey}
          products={products}
          onProductsChange={setProducts}
          isRFCMode={isRFCMode}
          rfcData={rfcData}
        />
      )}
      {step === 3 && (
        <StepReview agent={agent} form={form} templateKey={templateKey} products={products} isRFCMode={isRFCMode} rfcData={rfcData} />
      )}

      <div className="mt-8 flex justify-between">
        <Button variant="secondary" onClick={() => setStep(step - 1)} disabled={step === 0}>
          Back
        </Button>
        {step < 3 ? (
          <Button onClick={() => setStep(step + 1)} disabled={!canNext()}>
            Next
          </Button>
        ) : (
          <Button onClick={handleCreate} isLoading={createGroup.isPending}>
            {isRFCMode ? 'Create Group from RFC' : 'Create Group'}
          </Button>
        )}
      </div>
    </div>
  )
}
