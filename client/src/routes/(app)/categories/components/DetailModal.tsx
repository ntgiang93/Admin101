import CategoryTypeSelect from '@/components/shared/app/select/CategoryTypeSelect'
import { SysCategoryHook } from '@/hooks/sys/sysCategories'
import { type CategoryDto, defaultCategory } from '@/types/sys/SysCategory'
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
import { useEffect, useState } from 'react'
import { MSG_LIST } from '@/types/constant/MessageList.ts'

interface DetailModalProps {
  isOpen: boolean
  parent: CategoryDto | undefined
  onOpenChange: () => void
  id: number
  onRefresh: () => void
  onResetSelected: () => void
}

export default function DetailModal(props: DetailModalProps) {
  const { isOpen, onOpenChange, id, onRefresh, parent, onResetSelected } = props
  const [form, setForm] = useState<CategoryDto>({ ...defaultCategory })
  const { data, isFetching } = SysCategoryHook.useGet(id, isOpen)
  const { mutateAsync: save, isPending } = SysCategoryHook.useSave()

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await save(form)
    onOpenChange()
    onRefresh()
  }

  useEffect(() => {
    if (!data) {
      setForm({ ...defaultCategory, type: parent?.code || '' })
    }
  }, [parent?.code, data])

  useEffect(() => {
    if (data) {
      setForm({ ...data })
    }
  }, [data])

  useEffect(() => {
    if (!isOpen) {
      setForm({ ...defaultCategory })
      onResetSelected()
    }
  }, [isOpen])

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>{id > 0 ? 'Sửa' : 'Thêm'} danh mục</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              {isFetching && <Spinner />}
              {!isFetching && (
                <Form
                  id="categoryForm"
                  onSubmit={onSubmit}
                  className={'flex flex-col gap-3 p-0.5'}
                >
                  <TextField
                    isRequired
                    name="name"
                    value={form.name}
                    variant={'secondary'}
                    onChange={(value) =>
                      setForm((prev) => ({ ...prev, name: value }))
                    }
                    validate={(value) => {
                      return value === '' || !value
                        ? MSG_LIST.REQUIRED_FIELD
                        : null
                    }}
                  >
                    <Label>Tên</Label>
                    <Input autoFocus placeholder="Nhập tên" />
                    <FieldError />
                  </TextField>

                  <TextField
                    isRequired
                    name="code"
                    value={form.code}
                    variant={'secondary'}
                    onChange={(value) =>
                      setForm((prev) => ({ ...prev, code: value }))
                    }
                    validate={(value) => {
                      return value === '' || !value
                        ? MSG_LIST.REQUIRED_FIELD
                        : null
                    }}
                  >
                    <Label>Mã</Label>
                    <Input placeholder="Nhập mã" />
                    <FieldError />
                  </TextField>

                  <CategoryTypeSelect
                    value={form.type}
                    onChange={(value) => {
                      setForm((prev) => ({ ...prev, type: value }))
                    }}
                  />

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
                </Form>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="tertiary" slot="close">
                Đóng
              </Button>
              <Button type="submit" form="categoryForm" isPending={isPending}>
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
