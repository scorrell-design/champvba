import { useState, useCallback } from 'react'
import { PageHeader } from '../../components/layout/PageHeader'
import { StepProgress } from './StepProgress'
import { StepUpload } from './StepUpload'
import { StepValidation } from './StepValidation'
import { StepDuplicateCheck } from './StepDuplicateCheck'
import { StepMapping } from './StepMapping'
import { StepResults } from './StepResults'

export function ImportFiles() {
  const [step, setStep] = useState(1)
  const [file, setFile] = useState<File | null>(null)

  const reset = useCallback(() => {
    setStep(1)
    setFile(null)
  }, [])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Import Eligibility File"
        description="Upload and process member eligibility data"
      />

      <StepProgress current={step} />

      {step === 1 && (
        <StepUpload
          file={file}
          onFileChange={setFile}
          onContinue={() => setStep(2)}
        />
      )}
      {step === 2 && (
        <StepValidation
          onContinue={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}
      {step === 3 && (
        <StepDuplicateCheck
          onContinue={() => setStep(4)}
          onBack={() => setStep(2)}
        />
      )}
      {step === 4 && (
        <StepMapping
          onContinue={() => setStep(5)}
          onBack={() => setStep(3)}
        />
      )}
      {step === 5 && <StepResults onReset={reset} />}
    </div>
  )
}
