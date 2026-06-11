import { Button, Card, Checkbox } from '@heroui/react'
import { ArrowRight01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  type ColumnDef,
  type ExpandedState,
  getCoreRowModel,
  getExpandedRowModel,
  type RowSelectionState,
  type Updater,
  useReactTable,
} from '@tanstack/react-table'
import clsx from 'clsx'
import { memo, useCallback, useMemo, useRef, useState } from 'react'
import { BaseTableContent } from './BaseTableContent'
import {
  getFirstColumn,
  getRowSelection,
  getSelectedItemsFromRowSelection,
} from './datatableHelper'
import { type AsyncDataTableProps } from './DataTableType'
import { TablePagination } from './TablePagination'

const AsyncDataTable = memo(function AsyncDataTable(
  props: AsyncDataTableProps,
) {
  const {
    data,
    columns,
    selection,
    childrenProperty,
    keyColumn,
    isLoading,
    rightContent,
    leftContent,
    pagination,
  } = props
  const [expanded, setExpanded] = useState<ExpandedState>({})
  const [isAnimating, setIsAnimating] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const cols = useMemo(() => {
    const cloneColumns = [...(columns as ColumnDef<any>[])]
    if (childrenProperty) {
      const firstCol = getFirstColumn(cloneColumns)
      firstCol.cell = ({ row, cell }) => {
        return (
          <div className="flex items-center gap-2">
            {row.getCanExpand() ? (
              <Button
                isIconOnly
                aria-label="expand-button"
                variant="ghost"
                size="sm"
                onPress={() => handleToggleExpanded(row)}
                style={row.depth > 0 ? { marginLeft: row.depth * 32 } : {}}
              >
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  size={16}
                  className={`transition-transform ${row.getIsExpanded() ? 'rotate-90' : ''}`}
                />
              </Button>
            ) : (
              <div style={{ width: row.depth * 32 + 32 }}></div>
            )}
            <span>{String(cell.getValue())}</span>
          </div>
        )
      }
    }
    if (selection) {
      cloneColumns.unshift({
        id: 'select',
        size: 50,
        meta: { align: 'center', pinned: 'left' },
        header: ({ table }) => (
          <div className="flex items-center justify-start gap-2 w-full">
            {selection && (
              <Checkbox
                isSelected={table.getIsAllRowsSelected()}
                isIndeterminate={table.getIsSomeRowsSelected()}
                onChange={table.getToggleAllRowsSelectedHandler()}
              >
                <Checkbox.Control>
                  <Checkbox.Indicator />
                </Checkbox.Control>
              </Checkbox>
            )}
          </div>
        ),
        cell: ({ row }) =>
          selection && (
            <Checkbox
              isSelected={row.getIsSelected()}
              isIndeterminate={row.getIsSomeSelected()}
              onChange={row.getToggleSelectedHandler()}
            >
              <Checkbox.Control>
                <Checkbox.Indicator />
              </Checkbox.Control>
            </Checkbox>
          ),
      })
    }

    return cloneColumns
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns, childrenProperty])

  const rowSelection = getRowSelection(selection?.selectedKeys || [])

  const handleSelectedKeysChange = useCallback(
    (updater: Updater<RowSelectionState>) => {
      const result =
        typeof updater === 'function' ? updater(rowSelection) : updater
      const selectedItems = getSelectedItemsFromRowSelection(result)
      selection?.onChangeSelection(selectedItems)
    },
    [rowSelection, selection],
  )

  const table = useReactTable({
    data,
    columns: cols,
    state: {
      rowSelection,
      expanded,
      columnPinning: {
        left: cols
          .filter((col) => col.meta?.pinned === 'left')
          .map((col) => col.id)
          .filter((id): id is string => id !== undefined),
        right: cols
          .filter((col) => col.meta?.pinned === 'right')
          .map((col) => col.id)
          .filter((id): id is string => id !== undefined),
      },
    },
    enableRowSelection: true,
    manualPagination: true,
    onRowSelectionChange: (value) => handleSelectedKeysChange(value),
    onExpandedChange: setExpanded,
    getSubRows: (row) => row[childrenProperty || 'children'],
    getRowId: (row) => row[keyColumn || 'id'],
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    debugTable: true,
  })

  const pageCount = Math.ceil(pagination.totalCount / pagination.pageSize)

  const handleToggleExpanded = useCallback((row: any) => {
    if (!row.getIsExpanded()) row.toggleExpanded()
    else {
      setIsAnimating(true)
      row.toggleExpanded()
      setTimeout(() => {
        setIsAnimating(false)
      }, 300)
    }
  }, [])

  return (
    <Card
      className="h-full w-full overflow-hidden flex flex-col"
      ref={cardRef}
      variant="transparent"
    >
      <Card.Content
        className={clsx(
          'flex-1 min-h-0 relative',
          isAnimating ? 'overflow-hidden' : 'overflow-auto',
        )}
      >
        <BaseTableContent table={table} isLoading={isLoading} />
      </Card.Content>
      <Card.Footer className="w-full">
        <TablePagination
          totalCount={pageCount}
          pageSize={pagination.pageSize}
          page={pagination.page}
          onPageChange={pagination.onPageChange}
          onPageSizeChange={pagination.onPageSizeChange}
        />
      </Card.Footer>
    </Card>
  )
})

export default AsyncDataTable
