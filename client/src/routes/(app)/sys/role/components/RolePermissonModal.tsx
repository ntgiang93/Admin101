import ClientTable from '@/components/ui/data-table/DataTable'
import { RoleHook } from '@/hooks/sys/role'
import { SysCategoryHook } from '@/hooks/sys/sysCategories'
import { EPermission } from '@/types/base/Permission'
import { type RoleDto, type RolePermissionDto } from '@/types/sys/Role'
import { Button, Checkbox, Modal, Spinner } from '@heroui/react'
import { type ColumnDef } from '@tanstack/react-table'
import { useEffect, useState } from 'react'

interface IRoleUserProps {
  role: RoleDto
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

interface PermissionTable {
  id: string
  moduleName: string
}

export default function RolePermissonModal(props: IRoleUserProps) {
  const { role, isOpen, onOpenChange } = props
  const [searchValue, setSearchValue] = useState<string>('')
  const [tableData, setTableData] = useState<PermissionTable[]>([])
  const [form, setForm] = useState<RolePermissionDto[]>([])
  const { data: rolePermissions, isLoading } = RoleHook.useGetPermission(
    isOpen ? role.id : 0,
  )
  const { data: sysmodules, isLoading: loadingModule } =
    SysCategoryHook.useGetSysModule()
  const { mutateAsync: save, isPending } = RoleHook.useAssignPermission(role.id)
  const { data: permissons, isLoading: loadingPermssion } =
    SysCategoryHook.useGetPermission()

  const checkedPermisson = (sysmodule: string, permission: EPermission) => {
    return form.some(
      (rp) =>
        rp.sysModule === sysmodule &&
        (rp.permission & permission) === permission,
    )
  }

  const handleCheckedChange = (
    sysmodule: string,
    permission: EPermission,
    checked: boolean,
  ) => {
    if (!role) return
    if (!checked) {
      const newForm = form.filter(
        (rp) =>
          rp.sysModule !== sysmodule ||
          (rp.permission & permission) !== permission,
      )
      setForm([...newForm])
    } else {
      if (permission === EPermission.All) {
        const newForm = form.filter((rp) => rp.sysModule !== sysmodule)
        setForm([
          ...newForm,
          { sysModule: sysmodule, permission: permission, roleId: role.id },
        ])
      } else {
        const newForm = [
          ...form,
          { sysModule: sysmodule, permission: permission, roleId: role.id },
        ]
        setForm([...newForm])
      }
    }
  }

  const onSubmit = async () => {
    const success = await save(form)
    if (success) {
      onOpenChange(false)
    }
  }

  const handlePermissionCol = (): ColumnDef<PermissionTable>[] => {
    let cols: ColumnDef<PermissionTable>[] = [
      {
        id: 'moduleName',
        accessorKey: 'moduleName',
        header: () => 'Module',
        footer: (props: any) => props.column.id,
        meta: {
          pinned: 'left',
        },
      },
    ]

    if (permissons) {
      permissons.forEach((p) => {
        const permissonsCol: ColumnDef<PermissionTable> = {
          id: p.value.toString(),
          accessorKey: p.label,
          header: () => p.label,
          footer: (props) => props.column.id,
          size: 100,
          cell: ({ row }) => {
            return (
              <Checkbox
                aria-label={`${row.original.id}-${p.value}`}
                id={`${row.id}-${p.value}`}
                defaultSelected={checkedPermisson(
                  row.original.id,
                  p.value as EPermission,
                )}
                onChange={(value) =>
                  handleCheckedChange(
                    row.original.id,
                    p.value as EPermission,
                    value,
                  )
                }
                variant="secondary"
              >
                <Checkbox.Control>
                  <Checkbox.Indicator />
                </Checkbox.Control>
              </Checkbox>
            )
          },
          meta: {
            align: 'center',
          },
        }
        cols.push(permissonsCol)
      })
    }
    return cols
  }

  const columns = handlePermissionCol()

  useEffect(() => {
    let rawData: any[] = []
    if (!searchValue || searchValue.trim() === '') {
      rawData = [...(sysmodules || [])]
    } else
      rawData = (sysmodules || []).filter((m) =>
        m.label.toLowerCase().includes(searchValue.toLowerCase()),
      )
    setTableData(
      rawData.map((m) => {
        return { id: m.value, moduleName: m.label }
      }),
    )
  }, [sysmodules, searchValue])

  useEffect(() => {
    if (!isOpen) {
      setSearchValue('')
      setForm([])
    } else if (isOpen && rolePermissions) {
      setForm([...rolePermissions])
    }
  }, [isOpen, rolePermissions])

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Backdrop>
        <Modal.Container size={'cover'}>
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>Phân quyền - {role.name}</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <ClientTable
                columns={columns}
                data={tableData}
                isLoading={loadingModule || loadingPermssion || isLoading}
              />
            </Modal.Body>
            <Modal.Footer>
              <Button variant="tertiary" slot="close">
                Đóng
              </Button>
              <Button onPress={onSubmit} isPending={isPending}>
                {({ isPending }) => (
                  <>
                    {isPending && <Spinner />}
                    <span>Lưu</span>
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
