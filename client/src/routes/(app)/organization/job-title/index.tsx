import IconButton from '@/components/ui/button/IconButton'
import ClientTable from '@/components/ui/data-table/DataTable'
import { SearchInput } from '@/components/ui/input/SearchInput'
import { useAuth } from '@/components/ui/layout/AuthProvider.tsx'
import { JobTitleHook } from '@/hooks/orgazination/jobTitle'
import { EPermission } from '@/types/base/Permission'
import { SysModule } from '@/types/constant/SysModule.ts'
import { type JobTitleDto } from '@/types/sys/JobTitle'
import { Button, Card, Tooltip } from '@heroui/react'
import {
    Delete02Icon,
    Edit01Icon,
    Plus,
    Refresh,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { createFileRoute } from '@tanstack/react-router'
import { type ColumnDef } from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import DeleteJobTitleAlert from './components/DeleteJobTitleAlert'
import DetailModal from './components/DetailModal'

export const Route = createFileRoute('/(app)/organization/job-title/')({
  component: JobTitlePage,
})

function JobTitlePage() {
  const { data, refetch, isLoading } = JobTitleHook.useGetAll()
  const [isOpen, setIsOpen] = useState(false)
  const [isOpenDel, setIsOpenDel] = useState(false)
  const [selected, setSelected] = useState<JobTitleDto | undefined>(undefined)
  const [searchValue, setSearchValue] = useState<string>('')
  const { hasPermission } = useAuth()
  const canCreate = hasPermission(SysModule.JobTitle, EPermission.Create)
  const canEdit = hasPermission(SysModule.JobTitle, EPermission.Edit)
  const canDelete = hasPermission(SysModule.JobTitle, EPermission.Delete)

  const columns = useMemo<ColumnDef<JobTitleDto>[]>(
    () => [
      {
        accessorFn: (row) => row.name,
        id: 'name',
        header: () => 'Tên',
        footer: (props) => props.column.id,
      },
      {
        id: 'code',
        accessorKey: 'code',
        header: () => 'Mã',
        footer: (props) => props.column.id,
      },
      {
        accessorKey: 'description',
        header: () => 'Mô tả',
        footer: (props) => props.column.id,
      },
      {
        id: 'actions',
        accessorKey: 'actions',
        header: 'Thao tác',
        footer: (props) => props.column.id,
        cell: ({ row }) => {
          return (
            <div className="relative flex items-center gap-2">
              {canEdit && (
                <IconButton
                  icon={Edit01Icon}
                  tooltip="Sửa"
                  onPress={() => {
                    setSelected(row.original)
                    setIsOpen(true)
                  }}
                />
              )}
              {canDelete && (
                <IconButton
                  icon={Delete02Icon}
                  color="danger"
                  tooltip="Xóa"
                  onPress={() => {
                    setSelected(row.original)
                    setIsOpenDel(true)
                  }}
                />
              )}
            </div>
          )
        },
        meta: {
          align: 'center',
          width: 100,
        },
      },
    ],
    [canEdit, canDelete],
  )

  const filteredData = useMemo(() => {
    if (!data) return []

    if (searchValue && searchValue.length > 0) {
      const searchValueLower = searchValue.toLowerCase()
      return data.filter(
        (r) =>
          r.name.toLowerCase().includes(searchValueLower) ||
          r.code?.toLowerCase().includes(searchValueLower) ||
          r.description?.toLowerCase().includes(searchValueLower),
      )
    }

    return data
  }, [setSearchValue, data])

  const onResetSelected = () => {
    setSelected(undefined)
  }

  return (
    <Card className="h-full">
      <Card.Header>
        <Card.Title>Quản lý vai trò</Card.Title>
        <div className="flex justify-between items-center my-1">
          <SearchInput
            value={searchValue}
            onValueChange={(value) => setSearchValue(value)}
          />
          <div className="flex gap-2">
            <Tooltip delay={0}>
              <Button
                hidden={!canCreate}
                isIconOnly
                onPress={() => {
                  setSelected(undefined)
                  setIsOpen(true)
                }}
              >
                <HugeiconsIcon icon={Plus}></HugeiconsIcon>
              </Button>
              <Tooltip.Content>
                <p>Thêm mới</p>
              </Tooltip.Content>
            </Tooltip>
            <Tooltip delay={0}>
              <Button isIconOnly variant="secondary" onPress={() => refetch()}>
                <HugeiconsIcon icon={Refresh}></HugeiconsIcon>
              </Button>
              <Tooltip.Content>
                <p>Tải lại dữ liệu</p>
              </Tooltip.Content>
            </Tooltip>
          </div>
        </div>
      </Card.Header>

      <Card.Content>
        <ClientTable
          columns={columns}
          data={filteredData || []}
          isLoading={isLoading}
        />
        <DetailModal
          isOpen={isOpen}
          onOpenChange={() => setIsOpen(!isOpen)}
          id={selected?.id || 0}
          onRefresh={refetch}
          onResetSelected={onResetSelected}
        />
        <DeleteJobTitleAlert
          isOpen={isOpenDel}
          onOpenChange={(open) => {
            setIsOpenDel(open)
            if (!open) onResetSelected()
          }}
          selectedJobTitle={selected}
          refetch={refetch}
        />
      </Card.Content>
    </Card>
  )
}
