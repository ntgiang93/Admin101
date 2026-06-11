import { RoleHook } from '@/hooks/sys/role'
import { useMemo } from 'react'
import { Autocomplete, Label, ListBox, SearchField } from '@heroui/react'

interface IRoleSelectProps {
  value?: number | number[]
  onChange: (values: number[] | number) => void
  isRequired?: boolean
  label?: string
  validate?: (value: number[] | number) => string | null | undefined
  className?: string
  selectionMode?: 'single' | 'multiple'
}

export default function RoleSelect({
  value,
  onChange,
  label,
  validate,
  className,
  selectionMode,
}: IRoleSelectProps) {
  const { data } = RoleHook.useGetAll()

  const items = useMemo(() => {
    if (!data) return []

    return data.map((item) => ({
      value: item.id,
      label: item.name,
    }))
  }, [data])

  return (
    <Autocomplete
      placeholder="Chọn vai trò"
      selectionMode={selectionMode}
      value={value}
      validate={(value) =>
        validate ? validate(value as number[] | number) : null
      }
      onChange={(value) => onChange(value as number[] | number)}
      variant={'secondary'}
      className={className}
    >
      <Label>{label || 'Vai trò'}</Label>
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
