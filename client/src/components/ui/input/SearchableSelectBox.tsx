import { FieldError, Label, ListBox, Select } from '@heroui/react'
import { SearchInput } from '@/components/ui/input/SearchInput.tsx'
import type { SelectOptionType } from '@/types/base/SelectOption.ts'

interface SearchableSelectBoxProps {
  items: SelectOptionType[]
  searchValue: string
  onSearchValueChange: (value: string) => void
  value: string | string[] | null
  onChange: (value: string | string[] | null) => void
  isLoading?: boolean
  selectionMode: 'single' | 'multiple'
  label?: string
  placeholder?: string
  required?: boolean
  className?: string
  validate?: (value: string | string[]) => string | null | undefined
  disabled?: boolean
}

export const SearchableSelectBox = (props: SearchableSelectBoxProps) => {
  const {
    items,
    searchValue,
    onSearchValueChange,
    value,
    onChange,
    selectionMode = 'single',
    label,
    validate,
    isLoading,
    ...rest
  } = props

  return (
    <Select
      selectionMode={selectionMode}
      value={value}
      onChange={(value) => onChange(value as string | string[] | null)}
      validate={(value) => validate?.(value as string | string[])}
      {...rest}
    >
      <Label>{label}</Label>
      <Select.Trigger>
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
        <SearchInput
          className={'m-3'}
          onValueChange={onSearchValueChange}
          value={searchValue}
        />
        <ListBox>
          {items.map((item) => {
            if (item.render) {
              return item.render(item)
            } else {
              return (
                <ListBox.Item
                  id={item.value}
                  textValue={item.label}
                  key={item.value}
                >
                  {item.label}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              )
            }
          })}
        </ListBox>
      </Select.Popover>
      <FieldError />
    </Select>
  )
}
