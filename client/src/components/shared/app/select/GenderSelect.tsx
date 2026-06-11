import { Label, ListBox, Select } from '@heroui/react'

interface GenderSelectProps {
  value?: string
  onChange: (value: string) => void
  isRequired?: boolean
  validate?: (value: string | string[]) => string | null | undefined
  className?: string
}

export default function GenderSelect({
  value,
  onChange,
  validate,
  className,
}: GenderSelectProps) {
  const items = [
    { value: '0', label: 'Nam' },
    { value: '1', label: 'Nữ' },
    { value: '2', label: 'Khác' },
  ]

  return (
    <Select
      placeholder="Chọn giới tính"
      value={value}
      onChange={(e) => onChange(e as string)}
      validate={(value) => (validate ? validate(value as string) : null)}
      variant={'secondary'}
      className={className}
    >
      <Label>Giới tính</Label>
      <Select.Trigger>
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
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
      </Select.Popover>
    </Select>
  )
}
