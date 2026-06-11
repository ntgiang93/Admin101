import IconButton from '@/components/ui/button/IconButton'
import ClientTable from '@/components/ui/data-table/DataTable'
import { SearchInput } from '@/components/ui/input/SearchInput'
import { useTranslation } from '@/components/ui/layout/LanguageProvider'
import { SysCategoryHook } from '@/hooks/sys/sysCategories'
import { StringHelper } from '@/libs/StringHelper.ts'
import { type CategoryDto, type CategoryTreeDto } from '@/types/sys/SysCategory'
import { Button, Card, Tooltip } from '@heroui/react'
import {
    Add01Icon,
    Delete02Icon,
    Edit01Icon,
    Plus,
    Refresh,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { createFileRoute } from '@tanstack/react-router'
import { type ColumnDef } from '@tanstack/react-table'
import { useCallback, useMemo, useState } from 'react'
import DeleteCategoryAlert from './components/DeleteCategoryAlert'
import DetailModal from './components/DetailModal'

export const Route = createFileRoute('/(app)/categories/')({
  component: CategoriesPage,
})

function CategoriesPage() {
  const { data, refetch, isFetching } = SysCategoryHook.useGetTree()
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [isOpenDel, setIsOpenDel] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<
    CategoryDto | undefined
  >(undefined)
  const [selectedParent, setSelectedParent] = useState<
    CategoryTreeDto | undefined
  >(undefined)
  const [searchValue, setSearchValue] = useState('')
  const canCreate = true
  const canEdit = true
  const canDelete = true

  const columns = useMemo<ColumnDef<CategoryTreeDto>[]>(
    () => [
      {
        accessorKey: 'name',
        id: 'name',
        header: () => t('common.name'),
      },
      {
        id: 'code',
        accessorKey: 'code',
        header: () => t('common.code'),
      },
      {
        id: 'type',
        accessorKey: 'type',
        header: () => t('common.type'),
      },
      {
        accessorKey: 'description',
        header: () => t('common.description'),
        size: 200,
        meta: { autoSize: true },
      },
      {
        id: 'actions',
        accessorKey: 'actions',
        header: () => t('common.actions'),
        cell: ({ row }) => {
          const isCategoryType = StringHelper.IsNullOrEmpty(row.original.type)
          return (
            <div className="relative flex items-center gap-2">
              <IconButton
                disabled={!canCreate || !isCategoryType}
                onPress={() => {
                  setSelectedParent(row.original)
                  setSelectedCategory(undefined)
                  setIsOpen(true)
                }}
                icon={Add01Icon}
                tooltip={t('common.add')}
                color={'accent'}
              />
              <IconButton
                disabled={!canEdit}
                onPress={() => {
                  setSelectedCategory(row.original)
                  setIsOpen(true)
                }}
                icon={Edit01Icon}
                tooltip={t('common.edit')}
                color={'accent'}
              />

              <IconButton
                disabled={
                  !canDelete ||
                  (!!row.original.children && row.original.children?.length > 0)
                }
                onPress={() => {
                  setSelectedCategory(row.original)
                  setIsOpenDel(true)
                }}
                icon={Delete02Icon}
                tooltip={t('common.delete')}
                color={'danger'}
              />
            </div>
          )
        },
        meta: {
          align: 'center',
          width: 120,
        },
      },
    ],
    [canCreate, canEdit, canDelete, t],
  )

  const filteredData = useMemo(() => {
    if (!data) {
      return [] as CategoryTreeDto[]
    }

    const keyword = searchValue.trim().toLowerCase()
    if (!keyword) {
      return data as CategoryTreeDto[]
    }

    const filterNodes = (nodes: CategoryTreeDto[]): CategoryTreeDto[] => {
      return nodes.reduce<CategoryTreeDto[]>((acc, node) => {
        const filteredChildren = (node as CategoryTreeDto).children
          ? filterNodes((node as CategoryTreeDto).children!)
          : []
        const nodeMatches = [
          node.name,
          node.code,
          node.type,
          node.description,
        ].some((field) =>
          field ? field.toLowerCase().includes(keyword) : false,
        )

        if (nodeMatches) {
          acc.push({
            ...node,
            ...(node.children
              ? {
                  children:
                    filteredChildren.length > 0
                      ? filteredChildren
                      : node.children,
                }
              : {}),
          })
          return acc
        }

        if (filteredChildren.length > 0) {
          acc.push({
            ...node,
            children: filteredChildren,
          })
        }

        return acc
      }, [])
    }

    return filterNodes(data as CategoryTreeDto[])
  }, [data, searchValue])

  const onResetSelected = useCallback(() => {
    setSelectedCategory(undefined)
    setSelectedParent(undefined)
  }, [])

  return (
    <Card className="h-full">
      <Card.Header>
        <Card.Title>{t('categories.title')}</Card.Title>
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
                  setSelectedParent(undefined)
                  setSelectedCategory(undefined)
                  setIsOpen(true)
                }}
              >
                <HugeiconsIcon icon={Plus}></HugeiconsIcon>
              </Button>
              <Tooltip.Content>
                <p>{t('common.addNew')}</p>
              </Tooltip.Content>
            </Tooltip>
            <Tooltip delay={0}>
              <Button isIconOnly variant="secondary" onPress={() => refetch()}>
                <HugeiconsIcon icon={Refresh}></HugeiconsIcon>
              </Button>
              <Tooltip.Content>
                <p>{t('common.reloadData')}</p>
              </Tooltip.Content>
            </Tooltip>
          </div>
        </div>
      </Card.Header>
      <Card.Content>
        <ClientTable
          columns={columns}
          data={filteredData}
          childrenProperty="children"
          isLoading={isFetching}
        />
      </Card.Content>
      <DetailModal
        isOpen={isOpen}
        onOpenChange={() => setIsOpen(false)}
        id={selectedCategory?.id || 0}
        onRefresh={refetch}
        parent={selectedParent}
        onResetSelected={onResetSelected}
      />
      <DeleteCategoryAlert
        isOpen={isOpenDel}
        onOpenChange={() => setIsOpenDel(false)}
        refetch={refetch}
        selectedCategory={selectedCategory}
        resetSelected={onResetSelected}
      />
    </Card>
  )
}
