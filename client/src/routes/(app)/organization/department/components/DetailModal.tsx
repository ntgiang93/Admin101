import DepartmentSelect from '@/components/shared/app/select/DepartmentSelect'
import DepartmentTypeSelect from '@/components/shared/app/select/DepartmentTypeSelect'
import { DepartmentHook } from '@/hooks/orgazination/department'
import {
  defaultDetailDepartmentDto,
  type DepartmentDto,
  type DetailDepartmentDto,
} from '@/types/sys/Department'
import {
  Button,
  FieldError,
  Form,
  Input,
  Label,
  Modal,
  Spinner,
  TextField,
} from '@heroui/react'
import { useEffect, useMemo, useState } from 'react'

interface DetailProps {
  isOpen: boolean
  onOpenChange: () => void
  id: number
  onRefresh: () => void
  onResetSelected: () => void
  parent?: DepartmentDto
}

export default function DetailModal(props: DetailProps) {
  const { isOpen, onOpenChange, id, onRefresh, onResetSelected, parent } = props
  const [form, setForm] = useState<DetailDepartmentDto>({
    ...defaultDetailDepartmentDto,
  })
  const { data, isFetching } = DepartmentHook.useGet(isOpen ? id : 0)
  const { mutateAsync: save, isPending } = DepartmentHook.useSave()
  const { data: allDepartments } = DepartmentHook.useGetAll()

  const parentDepartmentType = useMemo(() => {
    if (!allDepartments || !form.parentId) return undefined

    const findInTree = (
      items: DepartmentDto[],
      id: number,
    ): DepartmentDto | undefined => {
      for (const item of items) {
        if (item.id === id) return item
        if (item.children && item.children.length > 0) {
          const found = findInTree(item.children, id)
          if (found) return found
        }
      }
      return undefined
    }
    return findInTree(allDepartments, form.parentId)?.departmentTypeCode
  }, [allDepartments, form.parentId])

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const response = await save(form)
    if (response && response.success) {
      onOpenChange()
      onRefresh()
    }
  }

  useEffect(() => {
    if (data) {
      setForm({
        ...data,
      })
    }
  }, [data])

  useEffect(() => {
    if (!isOpen) {
      setForm((prev) => ({ ...prev, ...defaultDetailDepartmentDto }))
      onResetSelected()
    }
  }, [isOpen])

  useEffect(() => {
    if (id > 0) return
    if (parent && parent.id) {
      setForm((prev) => ({ ...prev, parentId: parent.id }))
    }
  }, [parent, id])

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>{id > 0 ? 'Sửa' : 'Thêm'} phòng ban</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              {isFetching && <Spinner />}
              {!isFetching && (
                <Form
                  id="detailForm"
                  onSubmit={onSubmit}
                  className={'flex flex-col gap-3 p-0.5'}
                >
                  <TextField
                    isRequired
                    name="name"
                    variant={'secondary'}
                    value={form.name}
                    onChange={(value) => setForm({ ...form, name: value })}
                    validate={(value) => {
                      return value === '' || !value
                        ? 'Trường này là bắt buộc'
                        : null
                    }}
                  >
                    <Label>Tên</Label>
                    <Input autoFocus placeholder="Nhập tên phòng ban" />
                    <FieldError />
                  </TextField>

                  <TextField
                    isRequired
                    name="code"
                    variant={'secondary'}
                    value={form.code}
                    onChange={(value) =>
                      setForm((prev) => ({ ...prev, code: value }))
                    }
                    validate={(value) => {
                      return value === '' || !value
                        ? 'Trường này là bắt buộc'
                        : null
                    }}
                  >
                    <Label>Mã</Label>
                    <Input placeholder="Nhập mã phòng ban" />
                    <FieldError />
                  </TextField>

                  <TextField
                    name="description"
                    value={form.description}
                    variant={'secondary'}
                    onChange={(value) =>
                      setForm((prev) => ({ ...prev, description: value }))
                    }
                  >
                    <Label>Mô tả</Label>
                    <Input placeholder="Nhập mô tả" />
                    <FieldError />
                  </TextField>

                  <DepartmentSelect
                    values={form.parentId ? [form.parentId] : []}
                    onChange={(values) => {
                      setForm((prev) => ({
                        ...prev,
                        parentId: values as number,
                      }))
                    }}
                    label="Phòng ban cha"
                    anyLevel
                  />

                  <DepartmentTypeSelect
                    value={form.departmentTypeCode || undefined}
                    onChange={(value) => {
                      setForm((prev) => ({
                        ...prev,
                        departmentTypeCode: value as string,
                      }))
                    }}
                    validate={(value) => {
                      return value === '' || !value
                        ? 'Trường này là bắt buộc'
                        : null
                    }}
                    isRequired
                    label="Loại phòng ban"
                    parentDepartmentType={parentDepartmentType}
                  />

                  <TextField
                    name="address"
                    value={form.address}
                    variant={'secondary'}
                    onChange={(value) =>
                      setForm((prev) => ({ ...prev, address: value }))
                    }
                  >
                    <Label>Địa chỉ</Label>
                    <Input placeholder="Nhập địa chỉ" />
                    <FieldError />
                  </TextField>

                  {form.treePath && (
                    <TextField
                      name="treePath"
                      value={form.treePath}
                      isDisabled
                      variant={'secondary'}
                    >
                      <Label>Đường dẫn</Label>
                      <Input />
                      <FieldError />
                    </TextField>
                  )}
                </Form>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button slot="close" variant="tertiary">
                Đóng
              </Button>
              <Button type="submit" form="detailForm" isPending={isPending}>
                {({ isPending }) => (
                  <>
                    {isPending ? <Spinner color="current" size="sm" /> : null}
                    Lưu
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
