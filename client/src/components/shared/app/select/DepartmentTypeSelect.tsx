import { DepartmentTypeHook } from '@/hooks/orgazination/departmentType'
import {
  Autocomplete,
  EmptyState,
  FieldError,
  Label,
  ListBox,
  SearchField,
  useFilter,
} from '@heroui/react'
import { useMemo } from 'react'

interface DepartmentTypeSelectProps {
  value?: string | string[]
  onChange: (value: string | string[]) => void
  isRequired?: boolean
  label?: string
  validate?: (value: string | string[]) => string | null | undefined
  selectionMode?: 'single' | 'multiple'
  placeholder?: string
  className?: string
  parentDepartmentType?: string
}

export default function DepartmentTypeSelect({
  value,
  onChange,
  isRequired,
  label,
  validate,
  selectionMode = 'single',
  placeholder,
  className,
  parentDepartmentType,
}: DepartmentTypeSelectProps) {
  const { data, isLoading } = DepartmentTypeHook.useGetAll()
  const { contains } = useFilter({ sensitivity: 'base' })
  const items = useMemo(() => {
    if (!data) return []
    let filteredData = data
    const parentType = data.find((item) => item.code === parentDepartmentType)
    if (parentType !== undefined) {
      filteredData = data.filter(
        (item) =>
          item.level !== undefined && item.level > (parentType.level ?? 0),
      )
    }
    return filteredData.map((item) => ({
      value: item.code,
      label: item.name,
    }))
  }, [data, parentDepartmentType])

  return (
    <Autocomplete
      placeholder={placeholder || 'Chọn loại phòng ban'}
      selectionMode={selectionMode}
      value={value}
      validate={(val) => (validate ? validate(val as string | string[]) : null)}
      isDisabled={isLoading}
      onChange={(val) => onChange(val as string | string[])}
      variant="secondary"
      className={className}
      isRequired={isRequired}
      allowsEmptyCollection
    >
      <Label>{label || 'Loại phòng ban'}</Label>
      <Autocomplete.Trigger>
        <Autocomplete.Value />
        <Autocomplete.ClearButton />
        <Autocomplete.Indicator />
      </Autocomplete.Trigger>
      <Autocomplete.Popover>
        <Autocomplete.Filter filter={contains}>
          <SearchField autoFocus name="search" variant="secondary">
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input placeholder="Tìm kiếm..." />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>
          <ListBox
            renderEmptyState={() => (
              <EmptyState>Không tìm thấy dữ liệu</EmptyState>
            )}
          >
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
      <FieldError />
    </Autocomplete>
  )
}
