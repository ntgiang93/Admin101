import { TreeSelect } from '@/components/ui/tree/TreeSelect'
import { DepartmentHook } from '@/hooks/orgazination/department'
import type { DepartmentDto } from '@/types/sys/Department'
import type { SelectOptionType } from '@/types/base/SelectOption.ts'

interface DepartmentSelectProps {
  values: number[] | number
  onChange: (value: number[] | number) => void
  label?: string
  selectionMode?: 'single' | 'multiple'
  isRequired?: boolean
  anyLevel?: boolean
  isDisabled?: boolean
}

export default function DepartmentSelect({
  values,
  onChange,
  label = 'Parent Department',
  selectionMode = 'single',
  isRequired,
  anyLevel = true,
  isDisabled = false,
}: DepartmentSelectProps) {
  const { data } = DepartmentHook.useGetAll()

  const convertToTreeItem = (
    departments: DepartmentDto[],
  ): SelectOptionType[] => {
    return departments.map((dept) => {
      const item: SelectOptionType = {
        value: dept.id,
        label: dept.name,
        description: dept.description || '',
        children: convertToTreeItem(dept.children || []),
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
      placeholder="Chọn phòng ban"
      isRequired={isRequired}
      selectionMode={selectionMode}
      isDisabled={isDisabled}
      selectionStrategy={anyLevel ? 'all' : 'leaf'}
      onChange={(values) => {
        onChange(values as number | number[])
      }}
    />
  )
}
