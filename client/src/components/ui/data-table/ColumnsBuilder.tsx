import { Button, Checkbox } from '@heroui/react'
import { ArrowRight01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  type ColumnDef
} from '@tanstack/react-table'
import clsx from 'clsx'

// ─────────────────────────────────────────────
// Helper: build columns
// ─────────────────────────────────────────────
export function buildColumns<TData>(
  columns: ColumnDef<TData>[],
  childrenProperty: string | undefined,
  hasSelection: boolean,
  onToggleExpand: (row: any) => void,
): ColumnDef<TData>[] {
  const cloneColumns = [...columns]

  if (childrenProperty) {
    cloneColumns.unshift({
      id: 'expanded',
      size:50,
      meta: { align: 'start', pinned: 'left' },
            cell: ({ row }) => {
              if(row.getCanExpand()) {
              return (
<Button
            isIconOnly
            aria-label="expand-button"
            variant="ghost"
            size="sm"
            onPress={() => onToggleExpand(row)}
            style={row.depth > 0 ? { marginLeft: row.depth * 16 } : {}}
          >
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              size={16}
              className={clsx(
                'transition-transform',
                row.getIsExpanded() ? 'rotate-90' : '',
              )}
            />
          </Button>
              )}
              else {
                return (<div style={{ width: row.depth * 16 + 32 }} />)
              }
            },
        })
  }

  if (hasSelection) {
    cloneColumns.unshift({
      id: 'select',
      size: 50,
      meta: { align: 'center', pinned: 'left' },
      header: ({ table }) => (
        <div className="flex items-center justify-start gap-2 w-full">
          <Checkbox
            isSelected={table.getIsAllRowsSelected()}
            isIndeterminate={table.getIsSomeRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        </div>
      ),
      cell: ({ row }) => (
        <Checkbox
          isSelected={row.getIsSelected()}
          isIndeterminate={row.getIsSomeSelected()}
          onChange={row.getToggleSelectedHandler()}
        />
      ),
    } as ColumnDef<TData>)
  }

  return cloneColumns
}

