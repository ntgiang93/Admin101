import { TreeSelect } from '@/components/ui/tree/TreeSelect'
import { MenuHook } from '@/hooks/sys/menu'
import { type MenuItem } from '@/types/sys/Menu'
import type { SelectOptionType } from '@/types/base/SelectOption.ts'
import {useTranslation} from "react-i18next";

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
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  // Flatten menu tree để hiển thị trong select

  const convertToTreeItem = (menus: MenuItem[]): SelectOptionType[] => {
    return menus.map((menu) => {
      const item: SelectOptionType = {
        value: menu.id,
        label: menu[`${lang}Name`],
        description: menu.path,
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
      placeholder={t('placeholder_select', { field: t('menu') })}
      isRequired={isRequired}
      selectionMode={selectionMode}
      selectionStrategy="all"
      onChange={(values) => {
        console.log('MenuSelect onChange values:', values)
        onChange(values as number | number[])
      }}
    />
  )
}
