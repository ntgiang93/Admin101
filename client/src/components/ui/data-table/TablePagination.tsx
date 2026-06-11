import { Label, ListBox, Pagination, Select } from '@heroui/react'

interface PaginationControlledProps {
  totalCount: number
  pageSize: number
  page: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

export const ITEM_PER_PAGE = [
  { key: 10, label: '10' },
  { key: 20, label: '20' },
  { key: 50, label: '50' },
  { key: 100, label: '100' },
]

export function TablePagination(props: PaginationControlledProps) {
  const { totalCount, pageSize, page, onPageChange, onPageSizeChange } = props
  const pageCount = Math.ceil(totalCount/ pageSize)
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = []

    if (pageCount <= 7) {
      for (let i = 1; i <= pageCount; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)

      if (page > 3) {
        pages.push('ellipsis')
      }

      const start = Math.max(2, page - 1)
      const end = Math.min(pageCount - 1, page + 1)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (page < pageCount - 2) {
        pages.push('ellipsis')
      }

      pages.push(pageCount)
    }

    return pages
  }

  const startItem = (page - 1) * pageSize + 1
  const endItem = Math.min(page * pageSize, pageCount)

  return (
    <Pagination>
      <Pagination.Summary>
        {startItem}-{endItem} / {pageCount}
      </Pagination.Summary>
      <Pagination.Content>
        <Select
          value={pageSize}
          onChange={(value) => onPageSizeChange(Number(value))}
          variant="secondary"
        >
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {ITEM_PER_PAGE.map((item) => {
                return (
                  <ListBox.Item
                    key={item.key}
                    id={item.key}
                    textValue={item.label}
                    aria-label={`show ${item.label} items per page`}
                  >
                    <Label>{item.label}</Label>
                  </ListBox.Item>
                )
              })}
            </ListBox>
          </Select.Popover>
        </Select>
        <Pagination.Item>
          <Pagination.Previous
            isDisabled={page === 1}
            onPress={() => {
              const newPage = page - 1
              onPageChange(newPage)
            }}
          >
            <Pagination.PreviousIcon />
          </Pagination.Previous>
        </Pagination.Item>
        {getPageNumbers().map((p, i) =>
          p === 'ellipsis' ? (
            <Pagination.Item key={`ellipsis-${i}`}>
              <Pagination.Ellipsis />
            </Pagination.Item>
          ) : (
            <Pagination.Item key={p}>
              <Pagination.Link
                isActive={p === page}
                onPress={() => {
                  onPageChange(p)
                }}
              >
                {p}
              </Pagination.Link>
            </Pagination.Item>
          ),
        )}
        <Pagination.Item>
          <Pagination.Next
            isDisabled={page === pageCount}
            onPress={() => {
              const newPage = page + 1
              onPageChange(newPage)
            }}
          >
            <Pagination.NextIcon />
          </Pagination.Next>
        </Pagination.Item>
      </Pagination.Content>
    </Pagination>
  )
}
