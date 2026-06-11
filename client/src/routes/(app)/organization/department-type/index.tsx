import IconButton from '@/components/ui/button/IconButton'
import ClientTable from '@/components/ui/data-table/DataTable'
import { SearchInput } from '@/components/ui/input/SearchInput'
import { useAuth } from '@/components/ui/layout/AuthProvider.tsx'
import { DepartmentTypeHook } from '@/hooks/orgazination/departmentType'
import { EPermission } from '@/types/base/Permission'
import { ESysModule } from '@/types/constant/SysModule'
import { type DepartmentTypeDto } from '@/types/sys/DepartmentType'
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
import DeleteDepartmentTypeAlert from './components/DeleteDepartmentTypeAlert'
import DetailModal from './components/DetailModal'

export const Route = createFileRoute('/(app)/organization/department-type/')({
  component: DepartmentTypePage,
})

function DepartmentTypePage() {
  const { data, refetch, isLoading } = DepartmentTypeHook.useGetAll()
  const [isOpen, setIsOpen] = useState(false)
  const [isOpenDel, setIsOpenDel] = useState(false)
  const [selected, setSelected] = useState<DepartmentTypeDto | undefined>(
    undefined,
  )
  const [searchValue, setSearchValue] = useState<string>('')
  const { hasPermission } = useAuth()
  const canCreate = hasPermission(ESysModule.DepartmentType, EPermission.Create)
  const canEdit = hasPermission(ESysModule.DepartmentType, EPermission.Edit)
  const canDelete = hasPermission(ESysModule.DepartmentType, EPermission.Delete)

  const columns = useMemo<ColumnDef<DepartmentTypeDto>[]>(
    () => [
      {
        accessorKey: 'name',
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
        meta: {
          align: 'start',
        },
      },
      {
        id: 'level',
        accessorKey: 'level',
        header: () => 'Cấp bậc',
        footer: (props) => props.column.id,
        meta: {
          align: 'end',
        },
      },
      {
        id: 'actions',
        accessorKey: 'actions',
        header: () => 'Thao tác',
        footer: (props) => props.column.id,
        cell: ({ row }) => {
          return (
            <div className="relative flex items-center gap-2">
              <IconButton
                disabled={!canEdit}
                icon={Edit01Icon}
                tooltip="Sửa"
                onPress={() => {
                  setSelected(row.original)
                  setIsOpen(true)
                }}
                color="accent"
              />
              <IconButton
                disabled={!canDelete}
                icon={Delete02Icon}
                tooltip="Xóa"
                onPress={() => {
                  setSelected(row.original)
                  setIsOpenDel(true)
                }}
                color="danger"
              />
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
  }, [searchValue, data])

  const onResetSelected = () => {
    setSelected(undefined)
  }

  return (
    <Card className="h-full flex flex-col">
      <Card.Header>
        <Card.Title>Quản lý loại phòng ban</Card.Title>
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
      <Card.Content className="flex-1 min-h-0">
        <ClientTable
          columns={columns}
          data={filteredData || []}
          isLoading={isLoading}
        />
      </Card.Content>
      <Card.Footer />
      <DetailModal
        isOpen={isOpen}
        onOpenChange={() => setIsOpen(!isOpen)}
        id={selected?.id || 0}
        onRefresh={refetch}
        onResetSelected={onResetSelected}
      />
      <DeleteDepartmentTypeAlert
        isOpen={isOpenDel}
        onOpenChange={(open) => {
          setIsOpenDel(open)
          if (!open) onResetSelected()
        }}
        selectedDepartmentType={selected}
        refetch={refetch}
      />
    </Card>
  )
}
