import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import { PageHeader } from '../../components/layout/PageHeader'
import { Button } from '../../components/ui/Button'
import { useToast } from '../../components/feedback/Toast'
import { useCreateGroup } from '../../hooks/useQueries'
import { cn } from '../../utils/cn'
import {
  StepAgent,
  StepInfo,
  StepTemplate,
  StepPayment,
  StepReview,
  type WizardAgent,
  type WizardFormData,
  type WizardTemplateProduct,
} from './components/WizardSteps'

const STEPS = ['Agent Lookup', 'Group Info', 'Product Template', 'Payment & Config', 'Review & Create']

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
  wltGroupNumber: '',
  ppoNetwork: 'First Health Network',
  pbm: 'CleverRx',
  invoiceTemplate: 'Champion Health, Inc.',
}

export const GroupWizard = () => {
  const [step, setStep] = useState(0)
  const [agent, setAgent] = useState<WizardAgent | null>(null)
  const [form, setForm] = useState<WizardFormData>(INITIAL_FORM)
  const [templateKey, setTemplateKey] = useState('standard')
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
        wltGroupNumber: form.wltGroupNumber,
        ppoNetwork: form.ppoNetwork,
        pbm: form.pbm,
        invoiceTemplate: form.invoiceTemplate,
        templateType: templateKey as 'standard' | 'hsa' | 'firstStop' | 'firstStopHsa',
      },
      {
        onSuccess: () => {
          addToast('success', 'Group created successfully')
          navigate('/groups')
        },
        onError: () => addToast('error', 'Failed to create group'),
      },
    )
  }

  return (
    <div>
      <PageHeader title="New Group" backLink="/groups" />
      <WizardProgress current={step} />

      {step === 0 && <StepAgent agent={agent} onSelect={setAgent} />}
      {step === 1 && <StepInfo form={form} onChange={setForm} />}
      {step === 2 && (
        <StepTemplate
          templateKey={templateKey}
          onTemplateChange={setTemplateKey}
          products={products}
          onProductsChange={setProducts}
        />
      )}
      {step === 3 && <StepPayment />}
      {step === 4 && (
        <StepReview agent={agent} form={form} templateKey={templateKey} products={products} />
      )}

      <div className="mt-8 flex justify-between">
        <Button variant="secondary" onClick={() => setStep(step - 1)} disabled={step === 0}>
          Back
        </Button>
        {step < 4 ? (
          <Button onClick={() => setStep(step + 1)} disabled={!canNext()}>
            Next
          </Button>
        ) : (
          <Button onClick={handleCreate} isLoading={createGroup.isPending}>
            Create Group
          </Button>
        )}
      </div>
    </div>
  )
}
