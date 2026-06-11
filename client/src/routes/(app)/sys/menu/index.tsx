import IconButton from '@/components/ui/button/IconButton.tsx';
import ClientTable from '@/components/ui/data-table/DataTable';
import { HugeIconByName } from '@/components/ui/icon/HugeIconByName';
import { SearchInput } from '@/components/ui/input/SearchInput';
import { useAuth } from '@/components/ui/layout/AuthProvider.tsx';
import { MenuHook } from '@/hooks/sys/menu';
import DeleteMenuAlert from '@/routes/(app)/sys/menu/components/DeleteMenuAlert.tsx';
import MenuDetail from '@/routes/(app)/sys/menu/components/MenuDetailModal.tsx';
import { defaultPaginationFilter, type PaginationFilter } from '@/types/base/PaginationFilter';
import { EPermission } from '@/types/base/Permission';
import { ESysModule } from '@/types/constant/SysModule';
import {defaultMenuItem, type MenuItem} from '@/types/sys/Menu';
import {Button, Card, Spinner, Tooltip} from '@heroui/react';
import { Add01Icon, Delete02Icon, Edit01Icon, Refresh } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { createFileRoute } from '@tanstack/react-router';
import { type ColumnDef } from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import MenuForm from "@/routes/(app)/sys/menu/components/MenuForm.tsx";
import EmptyState from '@/assets/empty-state.png';

export const Route = createFileRoute('/(app)/sys/menu/')({
  component: Menu,
});

function Menu() {
  const { data, refetch, isFetching } = MenuHook.useGetMenuTree();
  const [selectedMenu, setSelectedMenu] = useState<MenuItem | undefined>(undefined);
  const [selectedParent, setSelectedParent] = useState<MenuItem | undefined>(undefined);
  const [filter, setFilter] = useState<PaginationFilter>({ ...defaultPaginationFilter });
  const [detailOpen, setDetailOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { hasPermission } = useAuth();
  const canCreate = hasPermission(ESysModule.Menu, EPermission.Create);
  const canEdit = hasPermission(ESysModule.Menu, EPermission.Edit);
  const canDelete = hasPermission(ESysModule.Menu, EPermission.Delete);
  const { t } = useTranslation();

  const columns: ColumnDef<MenuItem>[] = [
    {
      id: 'name',
      accessorKey: 'name',
      header: () => t('name'),
      cell: ({ row }) => {
        return (
          <div className="flex gap-2 items-center">
            <HugeIconByName name={row.original.icon || ''} size={20} />
            <span>{row.original.name}</span>
          </div>
        );
      },
    },
    {
      id: 'url',
      accessorKey: 'url',
      header: () => t('path'),
    },
    {
      accessorKey: 'displayOrder',
      header: () => t('display_order'),
      meta: {
        align: 'end',
      },
    },
    {
      id: 'actions',
      accessorKey: 'actions',
      header: () => t('action'),
      size: 150,
      cell: ({ row }) => {
        return (
          <div className="relative flex items-center gap-2">
            <IconButton
              disabled={!canCreate}
              onPress={() => {
                setSelectedParent(row.original);
                setSelectedMenu({...defaultMenuItem})
              }}
              icon={Add01Icon}
              tooltip={t('create')}
            />
            <IconButton
              disabled={!canEdit}
              onPress={() => {
                setSelectedMenu(row.original);
                setDetailOpen(true);
              }}
              icon={Edit01Icon}
              tooltip={t('edit')}
              color="accent"
            />
            <IconButton
              disabled={
                !((!row.original.children || row.original.children?.length === 0) && canDelete)
              }
              onPress={() => {
                setSelectedMenu(row.original);
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

  const filterNodes = (nodes: MenuItem[], keyword: string): MenuItem[] => {
    return nodes.reduce<MenuItem[]>((acc, node) => {
      const filteredChildren = node.children ? filterNodes(node.children, keyword) : [];
      const nodeMatches = [node.name, node.url, node.sysmodule].some((field) =>
        field ? field.toLowerCase().includes(keyword) : false,
      );

      if (nodeMatches) {
        acc.push({
          ...node,
          ...(node.children
            ? {
                children: filteredChildren.length > 0 ? filteredChildren : node.children,
              }
            : {}),
        });
        return acc;
      }

      if (filteredChildren.length > 0) {
        acc.push({
          ...node,
          children: filteredChildren,
        });
      }

      return acc;
    }, []);
  };

  const handleFilterData = () => {
    if (!data) return [] as MenuItem[];
    else {
      const keyword = filter.searchValue?.trim().toLowerCase() ?? '';
      const filteredData = filterNodes(data, keyword);
      console.log('data filter', filteredData);
      const start = (filter.page - 1) * filter.pageSize;
      const end = filter.page * filter.pageSize;
      const result = filteredData.slice(start, end);
      return result;
    }
  };

  const filteredData = handleFilterData();

  const onResetSelected = () => {
    setSelectedMenu(undefined);
    setSelectedParent(undefined);
  };

  useEffect(() => {
    if (!detailOpen && !confirmOpen) {
      onResetSelected();
    }
  }, [detailOpen, confirmOpen]);

  return (
    <Card variant="transparent" className="h-full">
      <Card.Header className="flex-row justify-between w-full">
        <Card.Title className="text-2xl text-accent w-fit">{t('menu_page_title')}</Card.Title>
        <div className="flex">
          <Button hidden={!canCreate} onPress={() => setSelectedMenu({...defaultMenuItem})}>
            <HugeiconsIcon icon={Add01Icon} stroke={'3'} />
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
                  setFilter((prev) => ({ ...prev, searchValue: value, page: 1 }))
                }
              />
              <div className="flex gap-2">
                <Tooltip delay={0}>
                  <Button isIconOnly variant="secondary" onPress={() => refetch()}>
                    <HugeiconsIcon icon={Refresh} />
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
                  setFilter((prev) => ({ ...prev, page: val }));
                },
                onPageSizeChange: (val: number) => {
                  setFilter((prev) => ({ ...prev, page: 1, pageSize: val }));
                },
              }}
            />
          </Card.Content>
          <Card.Footer />

{/*          <MenuDetail
            isOpen={detailOpen}
            onOpenChange={setDetailOpen}
            id={selectedMenu?.id || 0}
            onRefresh={refetch}
            parent={selectedParent}
            onResetSelected={onResetSelected}
          />*/}
          <DeleteMenuAlert
            isOpen={confirmOpen}
            onOpenChange={setConfirmOpen}
            refetch={refetch}
            selectedMenu={selectedMenu}
            resetSelected={onResetSelected}
          />
        </Card>
        {!selectedMenu && (
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
        {selectedMenu && (
            <MenuForm parent={selectedParent} id={selectedMenu?.id || 0} onRefresh={refetch} onResetSelected={onResetSelected}/>
        )}
      </Card.Content>
    </Card>
  );
}
