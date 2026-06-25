import IconButton from '@/components/ui/button/IconButton.tsx'
import {SearchInput} from '@/components/ui/input/SearchInput'
import {useAuth} from '@/components/ui/layout/AuthProvider'
import {UserHook} from '@/hooks/sys/user'
import {EPermission} from '@/types/base/Permission'
import {ESysModule} from '@/types/constant/SysModule'
import {
    defaultUserDto,
    defaultUserTableRequest,
    type UserTableDto,
    type UserTableRequestDto,
} from '@/types/sys/User'
import {AlertDialog, Avatar, Button, Card, Chip, Tooltip} from '@heroui/react'
import {
    Add01Icon,
    Edit01Icon, Refresh,
    UserAccountIcon,
    UserCheck01Icon,
    UserRemove01Icon,
} from '@hugeicons/core-free-icons'
import {HugeiconsIcon} from '@hugeicons/react'
import {createFileRoute, useNavigate} from '@tanstack/react-router'
import {type ColumnDef} from '@tanstack/react-table'
import {useEffect, useState} from 'react'
import UserDetailModal from './components/UserDetailModal'
import ClientTable from "@/components/ui/data-table/DataTable.tsx";
import {useTranslation} from "react-i18next";
import {defaultMenuItem} from "@/types/sys/Menu.ts";
import EmptyState from "@/assets/empty-state.png";
import MenuForm from "@/routes/(app)/sys/menu/components/MenuForm.tsx";
import ConfirmDeleteDialog from "@/components/ui/dialog/ConfirmDeleteDialog.tsx";
import type {DateValue} from "@internationalized/date";
import i18n from 'i18next'
import dayjs from "dayjs";


export const Route = createFileRoute('/(app)/sys/user/')({
    component: Users,
})

function Users() {
    const [filter, setFilter] = useState<UserTableRequestDto>({
        ...defaultUserTableRequest,
        pageSize: 20,
    })
    const {data, refetch, isFetching} = UserHook.useGetPagination(filter)
    const [selectedUser, setSelectedUser] = useState<UserTableDto | undefined>(
        undefined,
    )
    const [isDetailOpen, setDetailOpen] = useState(false)
    const [isConfirmOpen, setConfirmOpen] = useState(false)
    const {mutateAsync: changeActive} = UserHook.useChangeActive(
        selectedUser?.id || '',
    )
    const {hasPermission} = useAuth()
    const canCreate = hasPermission(ESysModule.Users, EPermission.Create)
    const canEdit = hasPermission(ESysModule.Users, EPermission.Edit)
    const canView = hasPermission(ESysModule.Users, EPermission.View)
    const navigate = useNavigate()
    const {t} = useTranslation()

    const columns: ColumnDef<UserTableDto>[] = [
        {
            id: 'fullName',
            accessorKey: 'fullName',
            header: () => t('full_name'),
            footer: (props) => props.column.id,
            cell: ({row}) => {
                return (
                    <div className="flex items-center gap-2">
                        <Avatar>
                            <Avatar.Image
                                alt={row.original.fullName}
                                src={
                                    row.original.avatar ||
                                    `https://ui-avatars.com/api/?name=${row.original.fullName}`
                                }
                            />
                            <Avatar.Fallback>
                                {row.original.fullName.charAt(0)}
                            </Avatar.Fallback>
                        </Avatar>
                        <div className="felx flex-col">
                            <p>{row.original.fullName}</p>
                            <p className="text-sm text-muted">{row.original.email}</p>
                        </div>
                    </div>
                )
            },
            size: 320,
            meta: {
                pinned: 'left',
            },
        },
        {
            id: 'userName',
            accessorKey: 'userName',
            header: () => t('account'),
            footer: (props) => props.column.id,
            size: 160,
            meta: {
                pinned: 'left',
            },
        },
        {
            id: 'roles',
            accessorKey: 'roles',
            header: () => t('role'),
            footer: (props) => props.column.id,
            cell: ({row}) => {
                return <span>{row.original.roles.join(' - ')}</span>
            },
            meta: {
                align: 'start',
            },
        },
        {
            id: 'department',
            accessorKey: 'department',
            header: () => t('department'),
            footer: (props) => props.column.id,
            meta: {
                align: 'start',
            },
        },
        {
            id: 'lastAccess',
            accessorKey: 'lastAccess',
            header: () => t('last_access'),
            footer: (props) => props.column.id,
            cell: ({row}) => (
                !row.original.lastAccess ? <span></span> :
                    <span>{dayjs(row.original.lastAccess).format('DD/MM/YYYY HH:mm:ss')}</span>
            ),
            size: 120,
            meta: {
                align: 'start',
            },
        },
        {
            id: 'isActive',
            accessorKey: 'isActive',
            header: t('status'),
            footer: (props) => props.column.id,
            cell: ({row}) => {
                return row.original.isLocked ? (
                    <Chip color="danger" variant={'soft'}>
                        {t('block')}
                    </Chip>
                ) : row.original.isActive ? (
                    <Chip color="success" variant={'soft'}>
                        {t('active')}
                    </Chip>
                ) : (
                    <Chip color="danger" variant={'soft'}>
                        {t('inactive')}
                    </Chip>
                )
            },
            size: 160,
            meta: {
                align: 'center',
            },
        },
        {
            id: 'actions',
            accessorKey: 'actions',
            header: t('action'),
            footer: (props) => props.column.id,
            cell: ({row}) => {
                return (
                    <div className="relative flex items-center gap-2">
                        <IconButton
                            hidden={!canView}
                            icon={UserAccountIcon}
                            onPress={() => {
                                navigate({
                                    to: '/sys/user/$id',
                                    params: {id: row.original.id},
                                })
                            }}
                            tooltip={'Xem chi tiết'}
                        />
                        <IconButton
                            hidden={!canEdit}
                            onPress={() => {
                                setSelectedUser(row.original)
                                setDetailOpen(true)
                            }}
                            icon={Edit01Icon}
                            tooltip={t('edit')}
                        />
                        <IconButton
                            hidden={!canEdit || !row.original.isActive}
                            onPress={() => {
                                setSelectedUser(row.original)
                                setConfirmOpen(true)
                            }}
                            icon={UserRemove01Icon}
                            tooltip={t('deactivate_user')}
                            color={'danger'}
                        />
                        <IconButton
                            hidden={!canEdit || row.original.isActive}
                            onPress={() => {
                                setSelectedUser(row.original)
                                setConfirmOpen(true)
                            }}
                            icon={UserCheck01Icon}
                            tooltip={t('activate_user')}
                            color={'success'}
                        />
                    </div>
                )
            },
            size: 120,
            meta: {
                align: 'center',
            },
        },
    ]

    const handleChangeActive = async () => {
        await changeActive(undefined)
        refetch()
        setConfirmOpen(false)
        setSelectedUser(undefined)
    }
    
    const handleAddUser = () => {
        setSelectedUser(undefined);
        setDetailOpen(true);
    }

    useEffect(() => {
        if (!isDetailOpen && !isConfirmOpen) {
            setSelectedUser(undefined)
        }
    }, [isDetailOpen, isConfirmOpen])

    return (
        <Card variant="transparent" className="h-full">
            <Card.Header className="flex-row justify-between w-full">
                <Card.Title className="text-2xl text-accent w-fit">{t('user_page_title')}</Card.Title>
                <div className="flex">
                    <Button hidden={!canCreate} onPress={() => handleAddUser()}>
                        <HugeiconsIcon icon={Add01Icon} stroke={'3'}/>
                        {t('create')}
                    </Button>
                </div>
            </Card.Header>
            <Card.Content className="w-full gap-4 h-full">
                <Card className="w-full h-full flex flex-col">
                    <Card.Header>
                        <div className="flex justify-between items-center my-1">
                            <SearchInput
                                value={filter.searchValue}
                                onValueChange={(value) =>
                                    setFilter((prev) => ({...prev, searchValue: value, page: 1}))
                                }
                            />
                            <div className="flex gap-2">
                                <Tooltip delay={0}>
                                    <Button isIconOnly variant="secondary" onPress={() => refetch()}>
                                        <HugeiconsIcon icon={Refresh}/>
                                    </Button>
                                    <Tooltip.Content>
                                        <p>{t('refetch')}</p>
                                    </Tooltip.Content>
                                </Tooltip>
                            </div>
                        </div>
                    </Card.Header>
                    <Card.Content className="flex-1 min-h-0">
                        <ClientTable
                            columns={columns}
                            data={data?.items || []}
                            isLoading={isFetching}
                            pagination={{
                                page: filter.page,
                                pageSize: filter.pageSize,
                                totalCount: data?.totalCount || 0,
                                onPageChange: (val: number) => {
                                    setFilter((prev) => ({...prev, page: val}));
                                },
                                onPageSizeChange: (val: number) => {
                                    setFilter((prev) => ({...prev, page: 1, pageSize: val}));
                                },
                            }}
                        />
                    </Card.Content>
                    <Card.Footer>
                        <UserDetailModal isOpen={isDetailOpen} onOpenChange={setDetailOpen} onRefresh={refetch} id={selectedUser?.id || ''}/>
                    </Card.Footer>
                </Card>
            </Card.Content>
        </Card>
    )
}
