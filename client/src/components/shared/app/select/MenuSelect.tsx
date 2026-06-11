import { TreeSelect } from '@/components/ui/tree/TreeSelect'
import { MenuHook } from '@/hooks/sys/menu'
import { type MenuItem } from '@/types/sys/Menu'
import type { SelectOptionType } from '@/types/base/SelectOption.ts'

interface IMenuSelectProps {
  values: number[] | number
  onChange: (value: number[] | number) => void
  label?: string
  selectionMode?: 'single' | 'multiple'
  isRequired?: boolean
}

export default function MenuSelect({
  values,
  onChange,
  label = 'Parent Menu',
  selectionMode = 'single',
  isRequired,
}: IMenuSelectProps) {
  const { data } = MenuHook.useGetMenuTree()
  // Flatten menu tree để hiển thị trong select

  const convertToTreeItem = (menus: MenuItem[]): SelectOptionType[] => {
    return menus.map((menu) => {
      const item: SelectOptionType = {
        value: menu.id,
        label: menu.name,
        description: menu.url,
        children: convertToTreeItem(menu.children || []) || [],
      }
      return item
    })
  }

  const options = convertToTreeItem(data || [])

  return (
    <TreeSelect
      data={options}
      label={label}
      values={values}
      placeholder={`Chọn menu`}
      isRequired={isRequired}
      selectionMode={selectionMode}
      selectionStrategy="all"
      onChange={(values) => {
        onChange(values as number | number[])
      }}
    />
  )
}
