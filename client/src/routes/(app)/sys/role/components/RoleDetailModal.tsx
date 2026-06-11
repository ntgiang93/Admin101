import { RoleHook } from '@/hooks/sys/role'
import { MSG_LIST } from '@/types/constant/MessageList.ts'
import { defaultRoleDto, type RoleDto } from '@/types/sys/Role'
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

interface RoleDetailModalProps {
  id: number
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onRefresh: () => void
}

export default function RoleDetailModal(props: RoleDetailModalProps) {
  const { id, isOpen, onOpenChange, onRefresh } = props
  const [form, setForm] = useState<RoleDto>({ ...defaultRoleDto })
  const { data: role, isFetching } = RoleHook.useGet(isOpen ? id : 0)
  const { mutateAsync: save, isPending } = RoleHook.useSave()

  const handleRoleCode = (value: string) => {
    const roleCode = value.trim().toUpperCase().replace(/\s+/g, '_')
    setForm((prev) => ({ ...prev, code: roleCode }))
  }

  const onSubmit = async (e: any) => {
    e.preventDefault()
    const response = await save(form)
    if (response && response.success) {
      onOpenChange(!isOpen)
      onRefresh()
    }
  }

  useEffect(() => {
    if (role) {
      setForm({ ...role })
    }
  }, [role])

  useEffect(() => {
    if (id === 0 && isOpen) {
      setForm({ ...defaultRoleDto })
    }
  }, [id, isOpen])

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>
                {(id > 0 ? 'Chỉnh sửa' : 'Thêm mới') + ' vai trò'}
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              {isFetching && <Spinner />}
              {!isFetching && (
                <Form
                  id="roleForm"
                  onSubmit={onSubmit}
                  className={'flex flex-col gap-3 p-0.5'}
                >
                  <TextField
                    className="w-full"
                    name="code"
                    isRequired
                    value={form.code}
                    onChange={(value) => handleRoleCode(value)}
                    validate={(value) => {
                      return value === '' || !value
                        ? MSG_LIST.REQUIRED_FIELD
                        : null
                    }}
                  >
                    <Label>Mã vai trò</Label>
                    <Input
                      placeholder="Nhập mã vai trò"
                      autoFocus
                      tabIndex={1}
                      disabled={id > 0}
                    />
                    <FieldError />
                  </TextField>
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
                    <Label>Tên vai trò</Label>
                    <Input placeholder="Nhập tên vai trò" tabIndex={2} />
                    <FieldError />
                  </TextField>
                  <TextField
                    className="w-full"
                    name="description"
                    value={form.description || ''}
                    onChange={(value) => {
                      setForm((prev) => ({ ...prev, description: value }))
                    }}
                  >
                    <Label>Mô tả</Label>
                    <Input placeholder="Nhập mô tả" tabIndex={3} />
                    <FieldError />
                  </TextField>
                </Form>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="tertiary" slot="close">
                Hủy bỏ
              </Button>
              <Button type="submit" form="roleForm" isPending={isPending}>
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
