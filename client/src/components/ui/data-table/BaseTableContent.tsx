import { Spinner } from '@heroui/react'
import { type Table as TanStackTable, flexRender } from '@tanstack/react-table'
import clsx from 'clsx'
import { AnimatePresence, motion } from 'motion/react'
import { getCommonPinningStyles } from './datatableHelper'

interface BaseTableContentProps {
  table: TanStackTable<any>
  isLoading?: boolean
  height?: number
}

export function BaseTableContent({ table, isLoading }: BaseTableContentProps) {
  const hasExpandRow = table.getCanSomeRowsExpand()

  // Tạo cấu trúc Grid động: Cột nào có define width thì dùng px tĩnh, ngược lại dùng 1fr để dãn
  const gridTemplateColumns = table
    .getVisibleLeafColumns()
    .map((column) => {
      const metaWidth = column.columnDef.meta?.width
      const metaMinWidth = column.columnDef.meta?.minWidth
      const sizeDef = column.columnDef.size

      if (metaWidth) {
        return typeof metaWidth === 'number' ? `${metaWidth}px` : metaWidth
      }

      // TanStack mặc định gán size = 150. Nếu user truyền size khác 150 (ví dụ size: 50 cho cột select), ta lấy size chặn luôn.
      if (sizeDef !== undefined && sizeDef !== 150) {
        return `${sizeDef}px`
      }

      // Nếu có minWidth trong meta thì lấy nó chặn dưới, ngược lại là 0px để tự dãn.
      const minW = metaMinWidth
        ? typeof metaMinWidth === 'number'
          ? `${metaMinWidth}px`
          : metaMinWidth
        : '0px'

      return `minmax(${minW}, 1fr)`
    })
    .join(' ')

  return (
    <table className="w-full min-w-fit h-full">
      <thead className="sticky top-0 z-10">
        {table.getHeaderGroups().map((headerGroup) => (
          <tr
            key={headerGroup.id}
            className={`w-full min-w-fit shadow-sm rounded-full grid`}
            style={{
              gridTemplateColumns,
            }}
          >
            {headerGroup.headers.map((header, index) => {
              return (
                <th
                  key={header.id}
                  colSpan={header.colSpan}
                  className={clsx(
                    'relative z-0 bg-surface',
                    'text-muted text-sm font-medium py-1.5 px-4',
                    'after:content-[""] after:absolute after:inset-0 after:bg-surface-secondary after:-z-10',
                    index === 0 ? 'after:rounded-l-full' : '',
                    index === headerGroup.headers.length - 1
                      ? 'after:rounded-r-full'
                      : '',
                  )}
                  style={{
                    ...getCommonPinningStyles(header.column),
                    minWidth: header.column.columnDef.meta?.minWidth,
                    width: header.column.columnDef.meta?.width,
                  }}
                >
                  {header.isPlaceholder ? null : (
                    <div
                      className={clsx('flex items-center w-full')}
                      style={{
                        justifyContent: header.column.columnDef.meta?.align,
                        paddingLeft: hasExpandRow && index === 0 ? '32px' : '0',
                      }}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </div>
                  )}
                </th>
              )
            })}
          </tr>
        ))}
      </thead>
      <tbody className={clsx('w-full min-w-fit relative grid')}>
        {isLoading && (
          <tr className="absolute top-0 left-0 h-full w-full bg-content2/50 flex items-center justify-center z-10">
            <td colSpan={table.getVisibleLeafColumns().length}>
              <Spinner />
            </td>
          </tr>
        )}
        <AnimatePresence>
          {table.getRowModel().rows.map((row) => {
            const isChildRow = row.depth > 0
            return (
              <motion.tr
                initial={isChildRow ? { opacity: 0, height: 0 } : undefined}
                animate={
                  isChildRow
                    ? {
                        opacity: 1,
                        height: 'auto',
                      }
                    : undefined
                }
                exit={
                  isChildRow
                    ? {
                        opacity: 0,
                        height: 0,
                      }
                    : undefined
                }
                transition={
                  isChildRow
                    ? {
                        duration: 0.3,
                        ease: [0.4, 0.0, 0.2, 1],
                        opacity: { duration: 0.3 },
                      }
                    : undefined
                }
                key={row.id}
                className={clsx(
                  'w-full min-w-fit grid group',
                  table.getRowModel().rows.length > 0
                    ? `grid-cols-${table.getVisibleLeafColumns().length}`
                    : '',
                )}
                style={{
                  gridTemplateColumns,
                }}
              >
                {row.getVisibleCells().map((cell) => {
                  return (
                    <td
                      key={cell.id}
                      className={clsx(
                        'whitespace-nowrap truncate border-b border-default/50 bg-surface',
                        'px-3 py-1 min-h-10 group-hover:bg-surface-secondary',
                      )}
                      style={{
                        ...getCommonPinningStyles(cell.column),
                        minWidth: cell.column.columnDef.meta?.minWidth,
                        width: cell.column.columnDef.meta?.width,
                      }}
                    >
                      <div
                        className={clsx('flex items-center h-full w-full')}
                        style={{
                          justifyContent: cell.column.columnDef.meta?.align,
                        }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </div>
                    </td>
                  )
                })}
              </motion.tr>
            )
          })}
        </AnimatePresence>
      </tbody>
    </table>
  )
}
