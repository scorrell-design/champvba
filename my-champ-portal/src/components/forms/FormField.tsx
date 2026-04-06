import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form'
import { Input } from '../ui/Input'
import { Select, type SelectOption } from '../ui/Select'
import { Textarea } from '../ui/Textarea'

export interface FormFieldProps<T extends FieldValues> {
  name: Path<T>
  control: Control<T>
  label?: string
  required?: boolean
  type?: 'text' | 'email' | 'tel' | 'number' | 'password' | 'select' | 'textarea'
  placeholder?: string
  error?: string
  options?: SelectOption[]
  disabled?: boolean
}

export function FormField<T extends FieldValues>({
  name,
  control,
  label,
  required,
  type = 'text',
  placeholder,
  error,
  options = [],
  disabled,
}: FormFieldProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        if (type === 'select') {
          return (
            <Select
              {...field}
              label={label}
              required={required}
              error={error}
              options={options}
              placeholder={placeholder}
              disabled={disabled}
            />
          )
        }

        if (type === 'textarea') {
          return (
            <Textarea
              {...field}
              label={label}
              required={required}
              error={error}
              placeholder={placeholder}
              disabled={disabled}
            />
          )
        }

        return (
          <Input
            {...field}
            type={type}
            label={label}
            required={required}
            error={error}
            placeholder={placeholder}
            disabled={disabled}
          />
        )
      }}
    />
  )
}
