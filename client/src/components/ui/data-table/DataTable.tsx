import { Card, Spinner } from '@heroui/react';
import {
  type ColumnDef,
  type ExpandedState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  type RowSelectionState,
  type Updater,
  useReactTable,
} from '@tanstack/react-table';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'motion/react';
import { memo, useState } from 'react';
import { buildColumns } from './ColumnsBuilder';
import {
  buildGridTemplate,
  getCommonPinningStyles,
  getRowSelection,
  getSelectedItemsFromRowSelection,
} from './datatableHelper';
import { type DataTableProps } from './DataTableType';
import { useCollapseOverflow } from './hook/collapse-overflow';
import { TablePagination } from './TablePagination';
// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
const ClientTable = memo(function ClientTable(props: DataTableProps) {
  const { data, columns, selection, childrenProperty, keyColumn, isLoading, pagination } = props;

  const [expanded, setExpanded] = useState<ExpandedState>({});
  const { isAnimating, handleToggleExpanded } = useCollapseOverflow();

  // React Compiler tự memo — không cần useMemo/useCallback thủ công
  const rowSelection = getRowSelection(selection?.selectedKeys || []);

  const cols = buildColumns(
    columns as ColumnDef<any>[],
    childrenProperty,
    !!selection,
    handleToggleExpanded,
  );

  const columnPinning = {
    left: cols
      .filter((col) => col.meta?.pinned === 'left')
      .map((col) => col.id)
      .filter((id): id is string => id !== undefined),
    right: cols
      .filter((col) => col.meta?.pinned === 'right')
      .map((col) => col.id)
      .filter((id): id is string => id !== undefined),
  };

  const handleSelectedKeysChange = (updater: Updater<RowSelectionState>) => {
    const result = typeof updater === 'function' ? updater(rowSelection) : updater;
    const selectedItems = getSelectedItemsFromRowSelection(result);
    selection?.onChangeSelection(selectedItems);
  };

  const table = useReactTable({
    data,
    columns: cols,
    state: {
      rowSelection,
      expanded,
      columnPinning,
    },
    enableRowSelection: true,
    onRowSelectionChange: handleSelectedKeysChange,
    onExpandedChange: setExpanded,
    getSubRows: (row) => row[childrenProperty || 'children'],
    getRowId: (row) => row[keyColumn || 'id'],
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  const visibleColumns = table.getVisibleLeafColumns();
  const gridTemplateColumns = buildGridTemplate(visibleColumns);
  const canSomeExpand = table.getCanSomeRowsExpand();

  return (
    <Card className="h-full w-full flex flex-col" variant="transparent">
      <Card.Content
        className={clsx(
          'flex-1 min-h-0 relative',
          isAnimating ? 'overflow-hidden' : 'overflow-auto',
        )}
      >
        <table className="w-full min-w-fit h-full">
          {/* ── Header ── */}
          <thead className="sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="w-full min-w-fit shadow-sm rounded-full grid"
                style={{ gridTemplateColumns }}
              >
                {headerGroup.headers.map((header, index) => {
                  const isFirst = index === 0;
                  const isLast = index === headerGroup.headers.length - 1;

                  return (
                    <th
                      key={header.id}
                      colSpan={header.colSpan}
                      className={clsx(
                        'relative z-0 bg-surface',
                        'text-muted text-sm font-medium py-1.5 px-4',
                        'after:content-[""] after:absolute after:inset-0 after:bg-surface-secondary after:-z-10',
                        isFirst && 'after:rounded-l-xl',
                        isLast && 'after:rounded-r-xl',
                      )}
                      style={{
                        ...getCommonPinningStyles(header.column),
                        minWidth: header.column.columnDef.meta?.minWidth,
                        width: header.column.columnDef.meta?.width,
                      }}
                    >
                      {!header.isPlaceholder && (
                        <div
                          className="flex items-center w-full"
                          style={{
                            justifyContent: header.column.columnDef.meta?.align,
                            paddingLeft: canSomeExpand && isFirst ? '32px' : '0',
                          }}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </div>
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          {/* ── Body ── */}
          <tbody className="w-full min-w-fit relative grid">
            {isLoading && (
              <tr className="absolute inset-0 bg-content2/50 flex items-center justify-center z-10">
                <td colSpan={visibleColumns.length}>
                  <Spinner />
                </td>
              </tr>
            )}

            <AnimatePresence>
              {table.getRowModel().rows.map((row) => {
                const isChildRow = row.depth > 0;

                return (
                  <motion.tr
                    key={row.id}
                    initial={isChildRow ? { opacity: 0, height: 0 } : undefined}
                    animate={isChildRow ? { opacity: 1, height: 'auto' } : undefined}
                    exit={isChildRow ? { opacity: 0, height: 0 } : undefined}
                    transition={
                      isChildRow ? { duration: 0.3, ease: [0.4, 0.0, 0.2, 1] } : undefined
                    }
                    className="w-full min-w-fit grid group"
                    style={{ gridTemplateColumns }}
                  >
                    {row.getVisibleCells().map((cell) => (
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
                          className="flex items-center h-full w-full"
                          style={{
                            justifyContent: cell.column.columnDef.meta?.align,
                          }}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </div>
                      </td>
                    ))}
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </Card.Content>
      {pagination && (
        <Card.Footer>
          <TablePagination
            totalCount={pagination.totalCount}
            pageSize={pagination.pageSize}
            page={pagination.page}
            onPageChange={(page) => pagination.onPageChange(page)}
            onPageSizeChange={(size) => pagination.onPageSizeChange(size)}
          />
        </Card.Footer>
      )}
    </Card>
  );
});

export default ClientTable;
