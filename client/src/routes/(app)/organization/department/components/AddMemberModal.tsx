import AsyncDataTable from '@/components/ui/data-table/AsyncDataTable'
import { SearchInput } from '@/components/ui/input/SearchInput'
import { DepartmentHook } from '@/hooks/orgazination/department'
import { StringHelper } from '@/libs/StringHelper'
import {
  type AddDepartmentMemberDto,
  defaultUserDepartmentCursorFilterDto,
  type DepartmentDto,
  type UserDepartmentCursorFilterDto,
} from '@/types/sys/Department'
import { type UserSelectDto } from '@/types/sys/User'
import { Avatar, Button, Modal, Spinner } from '@heroui/react'
import { type ColumnDef } from '@tanstack/react-table'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'

const PAGE_SIZE = 20

interface AddMemberModalProps {
  department?: DepartmentDto
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  refetch: () => void
}

export default function AddMemberModal(props: AddMemberModalProps) {
  const { department, isOpen, onOpenChange, refetch } = props
  const [filter, setFilter] = useState<UserDepartmentCursorFilterDto>({
    ...defaultUserDepartmentCursorFilterDto,
  })
  const [selectedKeys, setSelectedKeys] = useState<string[]>([])
  const [page, setPage] = useState(1)

  const { data, isFetching } = DepartmentHook.useGetUsersNotInDepartment(filter)
  const [users, setUsers] = useState<UserSelectDto[]>([])
  const [isRowLoading, setIsRowLoading] = useState<boolean>(false)
  const { mutateAsync: addMembers, isPending } = DepartmentHook.useAddMember()
  const parentRef = useRef<HTMLDivElement>(null)

  const columns = useMemo<ColumnDef<UserSelectDto>[]>(
    () => [
      {
        id: 'fullName',
        accessorKey: 'fullName',
        header: () => 'Họ tên',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Avatar size="sm">
              <Avatar.Image alt="avatar" src={row.original.avatar} />
              <Avatar.Fallback>
                {StringHelper.getFirstLetterUpper(row.original.fullName)}
              </Avatar.Fallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                {row.original.userName}
              </span>
              <span className="text-xs text-default-500">
                {row.original.fullName}
              </span>
            </div>
          </div>
        ),
      },
      {
        id: 'email',
        accessorKey: 'email',
        header: () => 'Email',
        cell: ({ row }) => (
          <span className="text-sm text-default-500">{row.original.email}</span>
        ),
      },
    ],
    [],
  )

  const rowVirtualizer = useVirtualizer({
    count: data?.hasMore ? users.length : users.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
  })

  const pagedUsers = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return users.slice(start, start + PAGE_SIZE)
  }, [users, page])

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(users.length / PAGE_SIZE)),
    [users.length],
  )

  const handleSubmit = async () => {
    if (!department) return
    const body: AddDepartmentMemberDto = {
      departmentId: department.id,
      userIds: selectedKeys,
    }
    const success = await addMembers(body)
    if (success) {
      onOpenChange(!isOpen)
      refetch()
    }
  }

  useEffect(() => {
    if (data) {
      if (!filter.cursor) {
        setUsers([...data.items])
      } else {
        setUsers((prev) => [...prev, ...data.items])
        setIsRowLoading(false)
      }
    }
  }, [data, filter.cursor])

  useEffect(() => {
    if (department && isOpen) {
      setFilter((prev) => ({
        ...prev,
        departmentId: department.id,
      }))
    } else if (!isOpen) {
      setUsers([])
      setPage(1)
      setFilter({ ...defaultUserDepartmentCursorFilterDto })
      setSelectedKeys([])
    }
  }, [department, isOpen])

  useEffect(() => {
    rowVirtualizer.isScrolling = false
    const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse()
    if (!lastItem) return
    if (lastItem.index >= users.length - 1 && data?.hasMore && !isFetching) {
      setFilter((prev) => ({
        ...prev,
        cursor: data?.nextCursor || null,
      }))
      setIsRowLoading(true)
    }
  }, [
    data?.hasMore,
    data?.nextCursor,
    users.length,
    isFetching,
    rowVirtualizer.getVirtualItems(),
  ])

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Backdrop>
        <Modal.Container size="lg" className="w-[65vw]">
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>
                Thêm thành viên {department ? `- ${department.name}` : ''}
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <div className="flex flex-col p-0.5 gap-3 overflow-hidden relative">
                <div className="flex items-center justify-between gap-2">
                  <SearchInput
                    value={filter.setSearchValue}
                    onValueChange={(value) => {
                      setPage(1)
                      setFilter((prev) => ({
                        ...prev,
                        cursor: null,
                        setSearchValue: value,
                      }))
                    }}
                  />
                  <span className="text-sm text-default-500 shrink-0">
                    Đã chọn: <strong>{selectedKeys.length}</strong> người dùng
                  </span>
                </div>

                <div className="h-96 relative" ref={parentRef}>
                  <AsyncDataTable
                    columns={columns}
                    data={pagedUsers}
                    isLoading={isFetching && !isRowLoading}
                    removeWrapper={true}
                    keyColumn="userName"
                    selection={{
                      selectedKeys,
                      onChangeSelection: (values) =>
                        setSelectedKeys(values as string[]),
                    }}
                    pagination={{
                      page,
                      pageSize: PAGE_SIZE,
                      totalCount: users.length,
                      totalPages,
                      onPageChange: (p) => setPage(p),
                      onPageSizeChange: () => {},
                    }}
                  />
                  {isRowLoading && (
                    <div className="flex justify-center items-center py-2 absolute bottom-8 w-full">
                      <Spinner size="sm" />
                    </div>
                  )}
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="tertiary" slot="close">
                Đóng
              </Button>
              <Button
                isDisabled={!department || selectedKeys.length === 0}
                isPending={isPending}
                onPress={handleSubmit}
              >
                {({ isPending }) => (
                  <>
                    {isPending && <Spinner />}
                    <span>Thêm ({selectedKeys.length})</span>
                  </>
                )}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  )
}
