import {createFileRoute} from '@tanstack/react-router'
import {useMemo, useState} from "react";
import {useAuth} from "@/components/ui/layout/AuthProvider.tsx";
import {SysModule} from "@/types/constant/SysModule.ts";
import {EPermission} from "@/types/base/Permission.ts";
import type {ColumnDef} from "@tanstack/react-table";
import IconButton from "@/components/ui/button/IconButton.tsx";
import {Add01Icon, Delete02Icon, Edit01Icon, Refresh, UserGroupIcon} from "@hugeicons/core-free-icons";
import {Button, Card, Tooltip} from "@heroui/react";
import {SearchInput} from "@/components/ui/input/SearchInput.tsx";
import {HugeiconsIcon} from "@hugeicons/react";
import type {OrganizationUnitDto} from "@/types/sys/OrganizationUnit.ts";
import {OrganizationUnitHook} from "@/hooks/orgazination/department.ts";
import {useTranslation} from "react-i18next";
import {defaultPaginationFilter, type PaginationFilter} from "@/types/base/PaginationFilter.ts";
import DataGrid from "@/components/ui/data-table/DataGrid.tsx";
import DetailModal from "@/routes/(app)/organization/organization-unit/components/DetailModal.tsx";  

export const Route = createFileRoute('/(app)/organization/organization-unit/')({
    component: OrganizationUnitComponent,
})

function OrganizationUnitComponent() {
    const [filter, setFilter] = useState<PaginationFilter>({...defaultPaginationFilter});
    const [isDetailOpen, setIsDetailOpen] = useState(false)
    const [isOpenDel, setIsOpenDel] = useState(false)
    const [isOpenAssign, setIsOpenAssign] = useState(false)
    const [selected, setSelected] = useState<OrganizationUnitDto | undefined>(undefined)
    const [selectedParent, setSelectedParent] = useState<
        OrganizationUnitDto | undefined
    >(undefined)
    const {data, refetch, isFetching} = OrganizationUnitHook.useGetAll()
    const {hasPermission} = useAuth()
    const canCreate = hasPermission(SysModule.OrganizationUnit, EPermission.Create)
    const canEdit = hasPermission(SysModule.OrganizationUnit, EPermission.Edit)
    const canDelete = hasPermission(SysModule.OrganizationUnit, EPermission.Delete)
    const {t} = useTranslation()

    const columns = useMemo<ColumnDef<OrganizationUnitDto>[]>(
        () => [
            {
                accessorFn: (row) => row.name,
                id: 'name',
                header: () => 'Tên',
                size: 240,
                meta: {
                    pinned: 'left',
                },
            },
            {
                id: 'code',
                accessorKey: 'code',
                size: 120,
                header: () => t('code'),
                meta: {
                    pinned: 'left',
                },
            },
            {
                id: 'levelName',
                accessorKey: 'levelName',
                header: () => t('rank'),
                size: 160
            },
            {
                id: 'headName',
                accessorKey: 'headName',
                header: () => t('unit_head'),
                size: 160
            },
            {
                accessorKey: 'description',
                header: () => t('description'),
                meta: {
                    align: 'start',
                },
            },
            {
                id: 'address',
                accessorKey: 'address',
                header: () => 'Địa chỉ',
            },
            {
                id: 'actions',
                accessorKey: 'actions',
                header: () => 'Thao tác',
                size: 160,
                cell: ({row}) => {
                    return (
                        <div className="relative flex items-center gap-2">
                            <IconButton
                                disabled={!canCreate}
                                icon={Add01Icon}
                                tooltip="Thêm"
                                onPress={() => {
                                    setSelected(undefined)
                                    setSelectedParent(row.original)
                                    setIsDetailOpen(true)
                                }}
                            />
                            <IconButton
                                disabled={!canEdit}
                                icon={Edit01Icon}
                                tooltip="Sửa"
                                onPress={() => {
                                    setSelected(row.original)
                                    setSelectedParent(undefined)
                                    setIsDetailOpen(true)
                                }}
                                color="accent"
                            />
                            <IconButton
                                disabled={!canEdit}
                                icon={UserGroupIcon}
                                tooltip="Quản lý thành viên"
                                onPress={() => {
                                    setSelected(row.original)
                                    setIsOpenAssign(true)
                                }}
                            />
                            <IconButton
                                disabled={
                                    !canDelete ||
                                    (!!row.original.children && row.original.children.length > 0)
                                }
                                icon={Delete02Icon}
                                tooltip="Xóa"
                                onPress={() => {
                                    setSelected(row.original)
                                    setSelectedParent(undefined)
                                    setIsOpenDel(true)
                                }}
                                color="danger"
                            />
                        </div>
                    )
                },
                meta: {
                    align: 'center',
                    pinned: 'right',
                },
            },
        ],
        [canCreate, canEdit, canDelete],
    )
    const filterNodes = (nodes: OrganizationUnitDto[], keyword: string): OrganizationUnitDto[] => {
        return nodes.reduce<OrganizationUnitDto[]>((acc, node) => {
            const nodeMatches = [
                node.name,
                node.code,
                node.description,
                node.organizationLevelName,
                node.address,
            ].some((field) =>
                field ? field.toLowerCase().includes(keyword) : false,
            )

            if (nodeMatches) {
                acc.push({...node})
                return acc
            }

            const filteredChildren = node.children ? filterNodes(node.children, keyword) : []
            if (filteredChildren.length > 0) {
                acc.push({
                    ...node,
                    children: filteredChildren,
                })
            }

            return acc
        }, [])
    }
    const handleFilterData = () => {
        if (!data) return [] as OrganizationUnitDto[];
        else {
            const keyword = filter.searchValue?.trim().toLowerCase() ?? '';
            const filteredData = filterNodes(data, keyword);
            const start = (filter.page - 1) * filter.pageSize;
            const end = filter.page * filter.pageSize;
            return filteredData.slice(start, end);
        }
    };
    const filteredData = handleFilterData();

    const onResetSelected = () => {
        setSelected(undefined)
        setSelectedParent(undefined)
    }
    

    return (
        <Card variant="transparent" className="h-full">
            <Card.Header className="flex-row justify-between w-full">
                <Card.Title className="text-2xl text-accent w-fit">{t('organization_unit_page_title')}</Card.Title>
                <div className="flex">
                    <Button hidden={!canCreate} onPress={() => setIsDetailOpen(true)}>
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
                        <DataGrid
                            columns={columns}
                            data={filteredData}
                            childrenProperty="children"
                            isLoading={isFetching}
                            pagination={{
                                page: filter.page,
                                pageSize: filter.pageSize,
                                totalCount: filteredData.length,
                                onPageChange: (val: number) => {
                                    setFilter((prev) => ({...prev, page: val}));
                                },
                                onPageSizeChange: (val: number) => {
                                    setFilter((prev) => ({...prev, page: 1, pageSize: val}));
                                },
                            }}
                            />
                    </Card.Content>
                </Card>
                <DetailModal isOpen={isDetailOpen} onOpenChange={setIsDetailOpen} id={selected?.id || 0} onRefresh={refetch} onResetSelected={onResetSelected}/>
            </Card.Content>
        </Card>
    )
}
