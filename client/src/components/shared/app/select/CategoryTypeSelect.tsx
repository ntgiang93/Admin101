import { SysCategoryHook } from '@/hooks/sys/sysCategories'
import { useMemo } from 'react'
import { Autocomplete, Label, ListBox, SearchField } from '@heroui/react'

interface CategoryTypeSelectProps {
  value?: string
  onChange: (value: string) => void
  isRequired?: boolean
  validate?: (value: string | string[]) => string | null | undefined
  className?: string
}

export default function CategoryTypeSelect({
  value,
  onChange,
  validate,
  ...rest
}: CategoryTypeSelectProps) {
  const { data } = SysCategoryHook.useGetByType('')

  const items = useMemo(() => {
    if (!data) return []

    return data.map((item) => ({
      value: item.code,
      label: item.name,
    }))
  }, [data])

  return (
    <Autocomplete
      placeholder="Chọn loại danh mục"
      selectionMode="single"
      value={value}
      validate={(value) => (validate ? validate(value as string) : null)}
      onChange={(value) => onChange(value as string)}
      variant={'secondary'}
      {...rest}
    >
      <Label>Loại danh mục</Label>
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
