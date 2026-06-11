import { MenuHook } from '@/hooks/sys/menu'
import {
  defaultSaveMenuDto,
  type MenuItem,
  type SaveMenuDto,
} from '@/types/sys/Menu'
import {
  Button,
  FieldError,
  Form,
  Input,
  Label,
  Modal,
  NumberField,
  Spinner,
  TextField,
} from '@heroui/react'
import { useEffect, useState } from 'react'
import { MSG_LIST } from '@/types/constant/MessageList.ts'
import SysModuleSelect from '@/components/shared/app/select/SysModuleSelect.tsx'
import MenuSelect from '@/components/shared/app/select/MenuSelect.tsx'
import { IconSelect } from '@/components/ui/icon/IconSelect.tsx'

interface MenuDetailProps {
  isOpen: boolean
  parent: MenuItem | undefined
  onOpenChange: (open: boolean) => void
  id: number
  onRefresh: () => void
  onResetSelected: () => void
}

export default function MenuDetail(props: MenuDetailProps) {
  const { isOpen, onOpenChange, id, onRefresh, parent, onResetSelected } = props
  const [form, setForm] = useState<SaveMenuDto>({ ...defaultSaveMenuDto })
  const { data, isFetching } = MenuHook.useGet(isOpen ? id : 0)
  const { mutateAsync: save, isPending } = MenuHook.useSave()

  const onSubmit = async (e: any) => {
    e.preventDefault()
    const response = await save(form)
    if (response && response.success) {
      onOpenChange(!isOpen)
      onRefresh()
    }
  }

  useEffect(() => {
    if (!data) {
      setForm({
        ...defaultSaveMenuDto,
        parentId: parent?.id || 0,
        url: parent?.url + '/' || '/',
      })
    }
  }, [parent?.id])

  useEffect(() => {
    if (data) {
      setForm({
        ...data,
        sysmodule: data.sysmodule || '',
      })
    }
  }, [data])

  useEffect(() => {
    if (!isOpen) {
      setForm((prev) => ({ ...prev, ...defaultSaveMenuDto }))
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
              <Modal.Heading>
                {(id > 0 ? 'Chỉnh sửa' : 'Thêm mới') + ' menu'}
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              {isFetching && <Spinner />}
              {!isFetching && (
                <Form
                  id="menuForm"
                  onSubmit={onSubmit}
                  className={'flex flex-col gap-3 p-0.5'}
                >
                  <MenuSelect
                    label={'Menu cha'}
                    values={form.parentId || 0}
                    onChange={(values) =>
                      setForm((prev) => ({
                        ...prev,
                        parentId: values as number,
                      }))
                    }
                    isRequired={false}
                    selectionMode={'single'}
                  />
                  <TextField
                    className="w-full"
                    name="name"
                    isRequired
                    value={form.name}
                    onChange={(value) => {
                      setForm((prev) => ({ ...prev, name: value }))
                    }}
                    validate={(value) => {
                      return value === '' || !value
                        ? MSG_LIST.REQUIRED_FIELD
                        : null
                    }}
                  >
                    <Label>Tên</Label>
                    <Input placeholder="Nhập tên" autoFocus tabIndex={1} />
                    <FieldError />
                  </TextField>
                  <TextField
                    className="w-full"
                    name="url"
                    isRequired
                    value={form.url}
                    onChange={(value) => {
                      setForm((prev) => ({ ...prev, url: value }))
                    }}
                    validate={(value) => {
                      return value === '' || !value
                        ? MSG_LIST.REQUIRED_FIELD
                        : null
                    }}
                  >
                    <Label>Đường dẫn</Label>
                    <Input placeholder="Nhập đường dẫn" tabIndex={2} />
                    <FieldError />
                  </TextField>
                  <IconSelect
                    label="Icon"
                    value={form.icon}
                    onChange={(value) =>
                      setForm((prev) => ({ ...prev, icon: value }))
                    }
                  />
                  <SysModuleSelect
                    isRequired={true}
                    value={form.sysmodule}
                    onChange={(value) =>
                      setForm((prev) => ({ ...prev, sysmodule: value }))
                    }
                    validate={(value) => {
                      return value === '' || !value
                        ? MSG_LIST.REQUIRED_FIELD
                        : null
                    }}
                  />
                  <NumberField
                    minValue={0}
                    step={1}
                    value={form.displayOrder}
                    onChange={(value) =>
                      setForm((prev) => ({ ...prev, displayOrder: value }))
                    }
                  >
                    <Label>Thứ tự hiển thị</Label>
                    <NumberField.Group>
                      <NumberField.DecrementButton />
                      <NumberField.Input />
                      <NumberField.IncrementButton />
                    </NumberField.Group>
                    <FieldError />
                  </NumberField>
                </Form>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="tertiary" slot="close">
                Hủy bỏ
              </Button>
              <Button type="submit" form="menuForm" isPending={isPending}>
                {({ isPending }) => {
                  if (isPending)
                    return (
                      <>
                        <Spinner />
                        <span>Đang lưu</span>
                      </>
                    )
                  else return <span>Lưu</span>
                }}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  )
}
