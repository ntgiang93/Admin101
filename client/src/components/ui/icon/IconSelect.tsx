import {
  Button,
  Input,
  Label,
  Popover,
  ScrollShadow,
  TextField,
} from '@heroui/react'
import { useVirtualizer } from '@tanstack/react-virtual'
import clsx from 'clsx'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { SearchInput } from '@/components/ui/input/SearchInput.tsx'
import { ArrowDown01Icon } from '@hugeicons/core-free-icons'
import * as icons from '@hugeicons/core-free-icons'
import { HugeIconByName } from '@/components/ui/icon/HugeIconByName.tsx'
import {useTranslation} from "react-i18next";

interface IconSelectProps {
  value?: string
  onChange?: (iconName: string) => void
  label?: string
  placeholder?: string
  variant?: 'primary' | 'secondary'
}

export const IconSelect = (props: IconSelectProps) => {
  const { label, value, onChange, placeholder, variant = 'secondary' } = props

  const [isOpen, setIsOpen] = useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [searchValue, setSearchValue] = useState('')
  const {t} = useTranslation()
  // Container ref for virtualization
  const containerRef = useRef<HTMLDivElement>(null)

  // Extract all icons from the hugeicons-react library
  const iconList = useMemo(() => {
    return Object.keys(icons)
      .filter((name) => name.endsWith('Icon'))
      .map((name) => name)
  }, [])

  // Filtered icons based on search term
  const filteredIcons = useMemo(() => {
    if (!searchValue || searchValue === '') return iconList
    return iconList.filter((name) =>
      name.toLowerCase().includes(searchValue.toLowerCase()),
    )
  }, [iconList, searchValue])

  // Grid configuration
  const COLS = 6
  const ITEM_SIZE = 40

  const rowCount = Math.ceil(filteredIcons.length / COLS)

  // Virtual row renderer
  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => containerRef.current,
    estimateSize: () => ITEM_SIZE,
    overscan: 10,
  })

  const handleSelectIcon = (iconName: string) => {
    onChange?.(iconName)
    setIsOpen(false)
  }

  const inputWidth = inputRef.current?.getBoundingClientRect().width || 0

  // Reset search when closing popover
  useEffect(() => {
    if (!isOpen) {
      setSearchValue('')
    }
  }, [isOpen])

  return (
    <Popover isOpen={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger>
        <TextField
          className={'group cursor-pointer relative'}
          name="select search"
          type="text"
          variant={variant}
        >
          <Label>{label}</Label>
          <Input
            className="w-full cursor-pointer truncate"
            placeholder={placeholder || t('placeholder_select', { field: 'icon' })}
            readOnly
            value={value}
            ref={inputRef}
          />
          <HugeiconsIcon
            className={clsx(
              'absolute right-2  bottom-0 transition-all duration-300 ease-in-out',
              isOpen ? 'rotate-180' : 'rotate-0',
              label ? '-translate-y-1/3' : '-translate-y-1/2',
            )}
            icon={ArrowDown01Icon}
            size={20}
          />
        </TextField>
      </Popover.Trigger>
      <Popover.Content style={{ minWidth: inputWidth }}>
        <Popover.Dialog>
          <Popover.Heading className={'mb-4'}>
            <SearchInput
              onValueChange={(value) => setSearchValue(value)}
              value={searchValue}
              placeholder={'Tìm kiếm...'}
              className={'w-full'}
            />
          </Popover.Heading>
          <ScrollShadow ref={containerRef} className="w-full px-2 h-72">
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const rowStartIndex = virtualRow.index * COLS

                // Get icons for this row
                return (
                  <div
                    key={virtualRow.index}
                    className="grid grid-cols-6 gap-2"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: `${ITEM_SIZE}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    {Array.from({ length: COLS }).map((_, colIndex) => {
                      const iconIndex = rowStartIndex + colIndex
                      if (iconIndex >= filteredIcons.length) return null

                      const iconName = filteredIcons[iconIndex]
                      if (!iconName) return null

                      return (
                        <Button
                          key={colIndex}
                          variant={'ghost'}
                          isIconOnly
                          className="flex items-center rounded-lg justify-center"
                          onPress={() => handleSelectIcon(iconName)}
                          size={'lg'}
                        >
                          <HugeIconByName name={iconName} size={20} />
                        </Button>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </ScrollShadow>

          {filteredIcons.length === 0 && (
            <div className="py-4 text-center text-gray-500">No icons found</div>
          )}
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  )
}
