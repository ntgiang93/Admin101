import { Input, Label, Popover, TextField } from '@heroui/react'
import React, { type JSX } from 'react'
import TreeList from '@/components/ui/tree/TreeList.tsx'
import type {
  SelectionMode,
  SelectionStrategy,
} from '@/components/ui/tree/TreeListContext.ts'
import type { SelectOptionType } from '@/types/base/SelectOption.ts'
import TreeItem from '@/components/ui/tree/TreeItem.tsx'
import { SearchInput } from '@/components/ui/input/SearchInput.tsx'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowDown01Icon } from '@hugeicons/core-free-icons'
import clsx from 'clsx'

interface ITreeSelectProps {
  data: SelectOptionType[]
  className?: string
  values: (string | number)[] | string | number
  onChange: (value: string | number | (string | number)[]) => void
  selectionMode?: SelectionMode
  selectionStrategy?: SelectionStrategy
  label?: string
  placeholder?: string
  isRequired?: boolean
  isDisabled?: boolean
}

export const TreeSelect = (props: ITreeSelectProps) => {
  const {
    data,
    values,
    onChange,
    selectionMode,
    selectionStrategy,
    label,
    placeholder,
    isDisabled,
  } = props
  const [isOpen, setIsOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState<string>('')
  const inputRef = React.useRef<HTMLInputElement>(null)

  const renderItem = (item: SelectOptionType): JSX.Element => {
    if (item.render) {
      return renderItem(item)
    }

    const hasChildren = item.children && item.children.length > 0
    return (
      <TreeItem
        id={item.value}
        key={item.value}
        content={<Label>{item.label}</Label>}
      >
        {hasChildren && item.children?.map((child) => renderItem(child))}
      </TreeItem>
    )
  }

  const filterData = (
    data: SelectOptionType[],
    query: string,
  ): SelectOptionType[] => {
    if (!query || query.trim() === '') {
      return data
    }

    return data
      .map((item) => {
        const hasMatchingChildren =
          item.children && filterData(item.children, query).length > 0
        if (
          item.label.toLowerCase().includes(query.toLowerCase()) ||
          hasMatchingChildren
        ) {
          return {
            ...item,
            children: item.children ? filterData(item.children, query) : [],
          }
        }
        return null
      })
      .filter((item) => item !== null) as SelectOptionType[]
  }

  const getInputValues = (
    values: (string | number)[] | string | number,
    data: SelectOptionType[],
  ): string[] => {
    let listLabels: string[] = []
    data.forEach((item) => {
      if (Array.isArray(values)) {
        if (values.includes(item.value)) {
          listLabels.push(item.label)
        }
      } else {
        if (values === item.value) {
          listLabels.push(item.label)
        }
      }
      if (item.children && item.children.length > 0) {
        const childLabel = getInputValues(values, item.children)
        if (childLabel) {
          listLabels = listLabels.concat(childLabel)
        }
      }
    })
    return listLabels
  }

  const dataFiltered = filterData(data, searchValue)
  const inputValues = getInputValues(values, data).join(', ')
  const intputWidth = inputRef.current?.getBoundingClientRect().width || 0

  return (
    <Popover isOpen={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger>
        <TextField
          className={'group cursor-pointer relative'}
          name="select search"
          type="text"
          variant="secondary"
        >
          <Label>{label}</Label>
          <Input
            className="w-full cursor-pointer truncate"
            placeholder={placeholder}
            readOnly
            value={inputValues}
            ref={inputRef}
            disabled={isDisabled}
          />
          <HugeiconsIcon
            className={clsx(
              'absolute right-4 bottom-0 transition-all duration-300 ease-in-out',
              isOpen ? 'rotate-180' : 'rotate-0',
              label ? '-translate-y-1/3' : '-translate-y-1/2',
            )}
            icon={ArrowDown01Icon}
            size={20}
          />
        </TextField>
      </Popover.Trigger>
      <Popover.Content className={'max-h-80'} style={{ minWidth: intputWidth }}>
        <Popover.Dialog>
          <Popover.Heading className={'mb-4'}>
            <SearchInput
              onValueChange={(value) => setSearchValue(value)}
              value={searchValue}
              placeholder={'Tìm kiếm...'}
              className={'w-full'}
              variant={'secondary'}
            />
          </Popover.Heading>
          <TreeList
            values={values}
            onChange={onChange}
            selectionMode={selectionMode}
            selectionStrategy={selectionStrategy}
            className={'max-h-80'}
          >
            {dataFiltered.map((item: SelectOptionType) => {
              return renderItem(item)
            })}
          </TreeList>
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  )
}
