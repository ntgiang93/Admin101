import { Table } from '@heroui/react'
import { ChevronUp } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import clsx from 'clsx'
import { motion } from 'motion/react'

export default function SortableColumnHeader({
  children,
  sortDirection,
}: {
  children: React.ReactNode
  sortDirection?: 'ascending' | 'descending'
}) {
  return (
    <span className="flex items-center justify-between">
      {children}
      {!!sortDirection && (
        <HugeiconsIcon
          icon={ChevronUp}
          className={clsx(
            'size-3 transform transition-transform duration-100 ease-out',
            sortDirection === 'descending' ? 'rotate-180' : '',
          )}
        />
      )}
    </span>
  )
}

export const MotionTableRow = motion.create(Table.Row)
