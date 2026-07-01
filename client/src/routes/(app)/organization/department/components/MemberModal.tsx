import AsyncDataTable from '@/components/ui/data-table/AsyncDataTable'
import { SearchInput } from '@/components/ui/input/SearchInput'
import { useAuth } from '@/components/ui/layout/AuthProvider'
import TreeList from '@/components/ui/tree/TreeList'
import TreeItem from '@/components/ui/tree/TreeItem'
import { EPermission } from '@/types/base/Permission'
import { SysModule } from '@/types/constant/SysModule.ts'
import {
  defaultOrganizationUnitMemberFilter,
  type OrganizationUnitDto,
  type OrganizationUnitMemberDto,
  type OrganizationUnitMemberFilter,
} from '@/types/sys/OrganizationUnit'
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
import { StringHelper } from '@/libs/StringHelper'
import {OrganizationUnitHook} from "@/hooks/orgazination/organization-unit.ts";

interface MemberModalProps {
  OrganizationUnit?: OrganizationUnitDto
  isOpen: boolean
  onOpenChange: () => void
  onRefresh: () => void
}

export default function MemberModal(props: MemberModalProps) {
  const { OrganizationUnit, isOpen, onOpenChange } = props
  const OrganizationUnitId = OrganizationUnit?.id || 0
  const [selectedRow, setSelectedRow] = useState<number[]>([])
  const [selectedOrganizationUnit, setSelectedOrganizationUnit] = useState<number[]>([])
  const [filter, setFilter] = useState<OrganizationUnitMemberFilter>({
    ...defaultOrganizationUnitMemberFilter,
  })
  const [isOpenDel, setIsOpenDel] = useState(false)
  const [isOpenAddMember, setIsOpenAddMember] = useState(false)

  const { data, isFetching, refetch } = OrganizationUnitHook.useGetMembers(filter)
  const { mutateAsync: remove, isPending } = OrganizationUnitHook.useRemoveMember()
  const { navigate, hasPermission } = useAuth()
  const canEdit = hasPermission(SysModule.OrganizationUnit, EPermission.Edit)
  const columns = useMemo<ColumnDef<OrganizationUnitMemberDto>[]>(
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
    depts: OrganizationUnitDto[],
  ): OrganizationUnitDto | undefined => {
    for (const dept of depts) {
      if (dept.id === id) return dept
      const found = findDept(id, dept.children || [])
      if (found) return found
    }
  }

  const currentOrganizationUnit = useMemo(() => {
    if (!OrganizationUnit?.children || OrganizationUnit.children.length === 0) {
      return OrganizationUnit
    } else {
      return findDept(selectedOrganizationUnit[0], OrganizationUnit.children) || OrganizationUnit
    }
  }, [selectedOrganizationUnit, OrganizationUnit])

  const handleDelete = async () => {
    if (selectedRow.length === 0) return
    const success = await remove(selectedRow)
    setIsOpenDel(false)
    if (success) {
      setSelectedRow([])
      await refetch()
    }
  }

  const renderOrganizationUnitTree = (dept: OrganizationUnitDto): JSX.Element => {
    const hasChildren = dept.children && dept.children.length > 0
    return (
      <TreeItem key={dept.id} id={dept.id} content={<Label>{dept.name}</Label>}>
        {hasChildren &&
          dept.children?.map((child) => renderOrganizationUnitTree(child))}
      </TreeItem>
    )
  }

  const hasChildren = useMemo(() => {
    if (!OrganizationUnit) return false
    return OrganizationUnit.children && OrganizationUnit.children.length > 0
  }, [OrganizationUnit])

  useEffect(() => {
    if (isOpen && OrganizationUnit) {
      setFilter((prev) => ({ ...prev, OrganizationUnitId: OrganizationUnit.id, page: 1 }))
    }
  }, [isOpen, OrganizationUnit])

  useEffect(() => {
    if (!isOpen) {
      setSelectedRow([])
      setSelectedOrganizationUnit([])
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
                {`Quản lý thành viên ${OrganizationUnit?.name ?? ''}`}
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
                        values={selectedOrganizationUnit}
                        onChange={(value) => {
                          const selected = Array.isArray(value)
                            ? value
                            : [value]
                          setSelectedOrganizationUnit(selected as number[])
                          setFilter((prev) => ({
                            ...prev,
                            OrganizationUnitId:
                              selected.length > 0
                                ? (selected[0] as number)
                                : OrganizationUnit?.id || 0,
                            page: 1,
                          }))
                        }}
                      >
                        {OrganizationUnit && renderOrganizationUnitTree(OrganizationUnit)}
                      </TreeList>
                    </Card.Content>
                  </Card>
                )}
                <Card className="w-full col-span-2" variant="transparent">
                  <Card.Header className="font-semibold">
                    <Card.Title>{currentOrganizationUnit?.name}</Card.Title>
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
{/*      <AddMemberModal
        refetch={refetch}
        OrganizationUnit={currentOrganizationUnit}
        isOpen={isOpenAddMember}
        onOpenChange={(open) => setIsOpenAddMember(open)}
      />*/}
    </Modal>
  )
}
