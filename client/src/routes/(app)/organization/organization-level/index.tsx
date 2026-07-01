import {createFileRoute} from '@tanstack/react-router'
import {useEffect, useState} from "react";
import {useAuth} from "@/components/ui/layout/AuthProvider.tsx";
import {SysModule} from "@/types/constant/SysModule.ts";
import {EPermission} from "@/types/base/Permission.ts";
import type {ColumnDef} from "@tanstack/react-table";
import IconButton from "@/components/ui/button/IconButton.tsx";
import {Add01Icon, Delete02Icon, Edit01Icon, Refresh} from "@hugeicons/core-free-icons";
import {Button, Card, Tooltip} from "@heroui/react";
import {SearchInput} from "@/components/ui/input/SearchInput.tsx";
import {HugeiconsIcon} from "@hugeicons/react";
import ClientTable from "@/components/ui/data-table/DataTable.tsx";
import {type MenuItem} from "@/types/sys/Menu.ts";
import {defaultPaginationFilter, type PaginationFilter} from "@/types/base/PaginationFilter.ts";
import {useTranslation} from "react-i18next";
import EmptyState from "@/assets/empty-state.png";
import ConfirmDeleteDialog from "@/components/ui/dialog/ConfirmDeleteDialog.tsx";
import {OrganizationLevelHook} from "@/hooks/orgazination/organization-level.ts";
import {defaultOrganizationLevelDto, type OrganizationLevelDto} from "@/types/sys/OrganizationLevel.ts";
import OrganizationLevelForm from "@/routes/(app)/organization/organization-level/components/OrganizationLevelForm.tsx";

export const Route = createFileRoute('/(app)/organization/organization-level/')(
  {
    component: OrganizationLevel,
  },
)

function OrganizationLevel() {
    const {data, refetch, isFetching} = OrganizationLevelHook.useGetAll();
    const [selectedItem, setSelectedItem] = useState<OrganizationLevelDto | undefined>(undefined);
    const [filter, setFilter] = useState<PaginationFilter>({...defaultPaginationFilter});
    const [detailOpen, setDetailOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const {hasPermission} = useAuth();
    const canCreate = hasPermission(SysModule.OrganizationLevel, EPermission.Create);
    const canEdit = hasPermission(SysModule.OrganizationLevel, EPermission.Edit);
    const canDelete = hasPermission(SysModule.OrganizationLevel, EPermission.Delete);
    const {t} = useTranslation();
    const {mutateAsync: del, isPending} = OrganizationLevelHook.useDelete()

    const columns: ColumnDef<OrganizationLevelDto>[] = [
        {
            id: 'code',
            accessorKey: 'code',
            header: () => t('code'),
        },
        {
            id: 'name',
            accessorKey: 'name',
            header: () => t('name'),
        },
        {
            id: 'description',
            accessorKey: 'description',
            header: () => t('description'),
        },
        {
            accessorKey: 'rank',
            header: () => t('rank'),
            meta: {
                align: 'end',
            },
        },
        {
            id: 'actions',
            accessorKey: 'actions',
            header: () => t('action'),
            size: 150,
            cell: ({row}) => {
                return (
                    <div className="relative flex items-center gap-2">
                        <IconButton
                            disabled={!canEdit}
                            onPress={() => {
                                setSelectedItem(row.original);
                                setDetailOpen(true);
                            }}
                            icon={Edit01Icon}
                            tooltip={t('edit')}
                            color="accent"
                        />
                        <IconButton
                            disabled={!canDelete}
                            onPress={() => {
                                setSelectedItem(row.original);
                                setConfirmOpen(true);
                            }}
                            icon={Delete02Icon}
                            tooltip={t('delete')}
                            color={'danger'}
                        />
                    </div>
                );
            },
            meta: {
                align: 'center',
                width: 150,
            },
        },
    ];

    const handleFilterData = () => {
        if (!data) return [] as MenuItem[];
        else {
            const keyword = filter.searchValue?.trim().toLowerCase() ?? '';
            const filteredData = data.filter(x => x.name.toLowerCase().includes(keyword) || x.code.toLowerCase().includes(keyword) || x.description?.toLowerCase().includes(keyword));
            const start = (filter.page - 1) * filter.pageSize;
            const end = filter.page * filter.pageSize;
            return filteredData.slice(start, end);
        }
    };

    const filteredData = handleFilterData();

    const onResetSelected = () => {
        setSelectedItem(undefined);
    };

    const handleDelete = async () => {
        const success = await del(selectedItem?.id || 0)
        if (success) {
            refetch()
        }
        onResetSelected()
        setConfirmOpen(false)
    }

    useEffect(() => {
        if (!detailOpen && !confirmOpen) {
            onResetSelected();
        }
    }, [detailOpen, confirmOpen]);

    return (
        <Card variant="transparent" className="h-full">
            <Card.Header className="flex-row justify-between w-full">
                <Card.Title className="text-2xl text-accent w-fit">{t('organization_level_page_title')}</Card.Title>
                <div className="flex">
                    <Button hidden={!canCreate} onPress={() => setSelectedItem({...defaultOrganizationLevelDto})} variant="primary">
                        <HugeiconsIcon icon={Add01Icon} stroke={'3'}/>
                        {t('create')}
                    </Button>
                </div>
            </Card.Header>
            <Card.Content className="grid grid-cols-3 gap-4 h-full">
                <Card className="col-span-2 h-full flex flex-col">
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
                    <Card.Footer/>
                </Card>
                {(!selectedItem || confirmOpen) && (
                    <Card className="col-span-1">
                        <Card.Content>
                            <div className="flex items-center justify-center h-full w-full">
                                <div className="flex flex-col items-center gap-4 text-center p-8">
                                    <img src={EmptyState} alt={'empty'}/>
                                    <h2 className='text-xl font-semibold'>{t('empty_card_title')}</h2>
                                    <p>{t('empty_card_desc')}</p>
                                </div>
                            </div>
                        </Card.Content>
                    </Card>
                )}
                {selectedItem && !confirmOpen && (
                    <OrganizationLevelForm  id={selectedItem?.id || 0} onRefresh={refetch} onResetSelected={onResetSelected}/>
                )}
            </Card.Content>
            <ConfirmDeleteDialog isOpen={confirmOpen} onOpenChange={setConfirmOpen} isPending={isPending}
                                 onDelete={handleDelete} itemName={selectedItem?.name}/>
        </Card>
    );
}
