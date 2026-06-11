import { JobTitleHook } from '@/hooks/orgazination/jobTitle'
import { useMemo } from 'react'
import { Autocomplete, Label, ListBox, SearchField } from '@heroui/react'

interface JobTitleSelectProps {
  value?: number | number[]
  onChange: (value: number | number[]) => void
  isRequired?: boolean
  label?: string
  validate?: (value: number | number[]) => string | null | undefined
  selectionMode?: 'single' | 'multiple'
  placeholder?: string
  className?: string
}

export default function JobTitleSelect({
  value,
  onChange,
  isRequired,
  label,
  validate,
  selectionMode = 'single',
  placeholder,
  className,
}: JobTitleSelectProps) {
  const { data, isLoading } = JobTitleHook.useGetAll()

  const items = useMemo(() => {
    if (!data) return []
    return data.map((item) => ({
      value: item.id,
      label: item.name,
    }))
  }, [data])

  return (
    <Autocomplete
      placeholder={placeholder || 'Chọn chức danh'}
      selectionMode={selectionMode}
      value={value}
      validate={(val) => (validate ? validate(val as number | number[]) : null)}
      isDisabled={isLoading}
      onChange={(val) => onChange(val as number | number[])}
      variant="secondary"
      className={className}
      isRequired={isRequired}
    >
      <Label>{label || 'Chức danh'}</Label>
      <Autocomplete.Trigger>
        <Autocomplete.Value />
        <Autocomplete.ClearButton />
        <Autocomplete.Indicator />
      </Autocomplete.Trigger>
      <Autocomplete.Popover>
        <Autocomplete.Filter>
          <SearchField autoFocus name="search">
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input placeholder="Tìm kiếm..." />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>
          <ListBox>
            {items.map((item) => (
              <ListBox.Item
                id={item.value}
                key={item.value}
                textValue={item.label}
              >
                {item.label}
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
          </ListBox>
        </Autocomplete.Filter>
      </Autocomplete.Popover>
    </Autocomplete>
  )
}
