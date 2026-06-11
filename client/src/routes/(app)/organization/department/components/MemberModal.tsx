import AsyncDataTable from '@/components/ui/data-table/AsyncDataTable'
import { SearchInput } from '@/components/ui/input/SearchInput'
import { useAuth } from '@/components/ui/layout/AuthProvider'
import TreeList from '@/components/ui/tree/TreeList'
import TreeItem from '@/components/ui/tree/TreeItem'
import { DepartmentHook } from '@/hooks/orgazination/department'
import { EPermission } from '@/types/base/Permission'
import { ESysModule } from '@/types/constant/SysModule'
import {
  defaultDepartmentMemberFilter,
  type DepartmentDto,
  type DepartmentMemberDto,
  type DepartmentMemberFilter,
} from '@/types/sys/Department'
import {
  AlertDialog,
  Avatar,
  Button,
  Card,
  Label,
  Modal,
  Spinner,
  Tooltip,
} from '@heroui/react'
import type { ColumnDef } from '@tanstack/react-table'
import clsx from 'clsx'
import {
  AddTeamIcon,
  Delete02Icon,
  Plus,
  Refresh,
  UserAccountIcon,
  ViewIcon,
  ViewOffIcon,
} from '@hugeicons/core-free-icons'
import { type JSX, useEffect, useMemo, useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import AddMemberModal from '@/routes/(app)/organization/department/components/AddMemberModal.tsx'
import { StringHelper } from '@/libs/StringHelper'

interface MemberModalProps {
  department?: DepartmentDto
  isOpen: boolean
  onOpenChange: () => void
  onRefresh: () => void
}

export default function MemberModal(props: MemberModalProps) {
  const { department, isOpen, onOpenChange } = props
  const departmentId = department?.id || 0
  const [selectedRow, setSelectedRow] = useState<number[]>([])
  const [selectedDepartment, setSelectedDepartment] = useState<number[]>([])
  const [filter, setFilter] = useState<DepartmentMemberFilter>({
    ...defaultDepartmentMemberFilter,
  })
  const [isOpenDel, setIsOpenDel] = useState(false)
  const [isOpenAddMember, setIsOpenAddMember] = useState(false)

  const { data, isFetching, refetch } = DepartmentHook.useGetMembers(filter)
  const { mutateAsync: remove, isPending } = DepartmentHook.useRemoveMember()
  const { navigate, hasPermission } = useAuth()
  const canEdit = hasPermission(ESysModule.Department, EPermission.Edit)
  const columns = useMemo<ColumnDef<DepartmentMemberDto>[]>(
    () => [
      {
        id: 'fullName',
        accessorKey: 'fullName',
        header: () => 'Họ tên',
        footer: (props) => props.column.id,
        cell: ({ row }) => {
          return (
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
          )
        },
        size: 150,
        meta: {
          autoSize: true,
        },
      },
      {
        accessorKey: 'actions',
        header: 'Thao tác',
        footer: (props) => props.column.id,
        size: 100,
        cell: ({ row }) => {
          return (
            <div className="relative flex items-center gap-2">
              <Tooltip>
                <Tooltip.Trigger>
                  <Button
                    isIconOnly
                    aria-label="user-details-button"
                    variant="ghost"
                    size="sm"
                    onPress={() => {
                      navigate(`/sys/user/${row.original.userId}`, '_blank')
                    }}
                  >
                    <HugeiconsIcon icon={UserAccountIcon} size={16} />
                  </Button>
                </Tooltip.Trigger>
                <Tooltip.Content>
                  <span>Chi tiết người dùng</span>
                </Tooltip.Content>
              </Tooltip>
              {canEdit && (
                <Tooltip>
                  <Tooltip.Trigger>
                    <Button
                      isIconOnly
                      aria-label="remove-button"
                      variant="danger-soft"
                      size="sm"
                      onPress={() => {
                        setSelectedRow([row.original.id])
                        setIsOpenDel(true)
                      }}
                    >
                      <HugeiconsIcon icon={Delete02Icon} size={16} />
                    </Button>
                  </Tooltip.Trigger>
                  <Tooltip.Content>
                    <span>Xóa</span>
                  </Tooltip.Content>
                </Tooltip>
              )}
            </div>
          )
        },
        meta: {
          align: 'center',
        },
      },
    ],
    [canEdit, navigate],
  )

  const pages = useMemo(() => {
    if (!data) return 1
    else return Math.ceil(data.totalCount / filter.pageSize) || 1
  }, [data?.totalCount, filter.pageSize])

  const selectedUserName = useMemo(() => {
    if (!data) return []
    return data.items
      .filter((item) => selectedRow.includes(item.id))
      .map((item) => item.fullName || item.userName)
  }, [selectedRow, data])

  const findDept = (
    id: number,
    depts: DepartmentDto[],
  ): DepartmentDto | undefined => {
    for (const dept of depts) {
      if (dept.id === id) return dept
      const found = findDept(id, dept.children || [])
      if (found) return found
    }
  }

  const currentDepartment = useMemo(() => {
    if (!department?.children || department.children.length === 0) {
      return department
    } else {
      return findDept(selectedDepartment[0], department.children) || department
    }
  }, [selectedDepartment, department])

  const handleDelete = async () => {
    if (selectedRow.length === 0) return
    const success = await remove(selectedRow)
    setIsOpenDel(false)
    if (success) {
      setSelectedRow([])
      await refetch()
    }
  }

  const renderDepartmentTree = (dept: DepartmentDto): JSX.Element => {
    const hasChildren = dept.children && dept.children.length > 0
    return (
      <TreeItem key={dept.id} id={dept.id} content={<Label>{dept.name}</Label>}>
        {hasChildren &&
          dept.children?.map((child) => renderDepartmentTree(child))}
      </TreeItem>
    )
  }

  const hasChildren = useMemo(() => {
    if (!department) return false
    return department.children && department.children.length > 0
  }, [department])

  useEffect(() => {
    if (isOpen && department) {
      setFilter((prev) => ({ ...prev, departmentId: department.id, page: 1 }))
    }
  }, [isOpen, department])

  useEffect(() => {
    if (!isOpen) {
      setSelectedRow([])
      setSelectedDepartment([])
    }
  }, [isOpen])

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Backdrop>
        <Modal.Container size={hasChildren ? 'cover' : 'lg'}>
          <Modal.Dialog className={'min-w-160'}>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>
                {`Quản lý thành viên ${department?.name ?? ''}`}
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <div
                className={clsx(
                  'w-full h-full gap-2',
                  hasChildren ? 'grid grid-cols-3' : '',
                )}
              >
                {hasChildren && (
                  <Card variant="transparent">
                    <Card.Header className="font-semibold">
                      Sơ đồ tổ chức
                    </Card.Header>
                    <Card.Content>
                      <TreeList
                        selectionStrategy="all"
                        selectionMode="single"
                        values={selectedDepartment}
                        onChange={(value) => {
                          const selected = Array.isArray(value)
                            ? value
                            : [value]
                          setSelectedDepartment(selected as number[])
                          setFilter((prev) => ({
                            ...prev,
                            departmentId:
                              selected.length > 0
                                ? (selected[0] as number)
                                : department?.id || 0,
                            page: 1,
                          }))
                        }}
                      >
                        {department && renderDepartmentTree(department)}
                      </TreeList>
                    </Card.Content>
                  </Card>
                )}
                <Card className="w-full col-span-2" variant="transparent">
                  <Card.Header className="font-semibold">
                    <Card.Title>{currentDepartment?.name}</Card.Title>
                    <div className="flex justify-between items-center">
                      <SearchInput
                        value={filter.searchValue}
                        onValueChange={(value) =>
                          setFilter((prev) => ({ ...prev, searchValue: value }))
                        }
                      />
                      <div className="flex gap-2">
                        <Tooltip delay={0}>
                          <Button
                            hidden={!canEdit}
                            isIconOnly
                            onPress={() => {
                              setIsOpenAddMember(true)
                            }}
                          >
                            <HugeiconsIcon icon={Plus}></HugeiconsIcon>
                          </Button>
                          <Tooltip.Content>
                            <p>Thêm mới</p>
                          </Tooltip.Content>
                        </Tooltip>
                        <Tooltip delay={0}>
                          <Button
                            isIconOnly
                            variant="secondary"
                            onPress={() => refetch()}
                          >
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
                    <AsyncDataTable
                      columns={columns}
                      data={data?.items || []}
                      isLoading={isFetching}
                      removeWrapper={true}
                      pagination={{
                        page: filter.page,
                        pageSize: filter.pageSize,
                        totalCount: data?.totalCount || 0,
                        totalPages: pages,
                        onPageChange: (page) => {
                          setFilter((prev) => ({ ...prev, page }))
                        },
                        onPageSizeChange: (pageSize) => {
                          setFilter((prev) => ({ ...prev, pageSize }))
                        },
                      }}
                      selection={{
                        selectedKeys: selectedRow,
                        onChangeSelection(value) {
                          setSelectedRow(value)
                        },
                      }}
                    />
                  </Card.Content>
                </Card>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="danger-soft" onPress={() => onOpenChange()}>
                Đóng
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
      <AlertDialog
        isOpen={isOpenDel}
        onOpenChange={(open) => setIsOpenDel(open)}
      >
        <AlertDialog.Backdrop>
          <AlertDialog.Container>
            <AlertDialog.Dialog>
              <AlertDialog.Header>
                <AlertDialog.Heading>Xóa</AlertDialog.Heading>
              </AlertDialog.Header>
              <AlertDialog.Body>
                <p>Bạn có chắc chắn muốn xóa các mục đã chọn?</p>
                {selectedUserName.length > 0 && (
                  <div className="mt-2">
                    <strong>Mục đã chọn:</strong>
                    <ul className="list-disc list-inside">
                      {selectedUserName.map((name, index) => (
                        <li key={index}>{name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </AlertDialog.Body>
              <AlertDialog.Footer>
                <Button variant="outline" onPress={() => setIsOpenDel(false)}>
                  Hủy
                </Button>
                <Button
                  variant="danger"
                  onPress={handleDelete}
                  isDisabled={isPending}
                >
                  {isPending ? <Spinner size="sm" /> : 'Xóa'}
                </Button>
              </AlertDialog.Footer>
            </AlertDialog.Dialog>
          </AlertDialog.Container>
        </AlertDialog.Backdrop>
      </AlertDialog>
      <AddMemberModal
        refetch={refetch}
        department={currentDepartment}
        isOpen={isOpenAddMember}
        onOpenChange={(open) => setIsOpenAddMember(open)}
      />
    </Modal>
  )
}
