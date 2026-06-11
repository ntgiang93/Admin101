import { AuthHook } from '@/hooks/sys/auth'
import {
  type ChangePasswordDto,
  defaultChangePasswordDto,
} from '@/types/sys/User'
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
import { useState } from 'react'
import { MSG_LIST } from '@/types/constant/MessageList.ts'

interface ChangePasswordModalProps {
  isOpen: boolean
  onOpenChange: () => void
  onRefresh: () => void
}

export default function ChangePasswordModal(props: ChangePasswordModalProps) {
  const { isOpen, onOpenChange, onRefresh } = props
  const [form, setForm] = useState<ChangePasswordDto>({
    ...defaultChangePasswordDto,
  })
  const { mutateAsync: submit, isPending } = AuthHook.useChangePassword()

  const onSubmit = async (e: any) => {
    e.preventDefault()
    const response = await submit(form)
    if (response && response.success) {
      onOpenChange()
      setForm({ ...defaultChangePasswordDto })
      onRefresh()
    }
  }

  const validatePassword = (password: string): string | null => {
    if (password.length === 0) return MSG_LIST.REQUIRED_FIELD
    else if (password.length < 4) {
      return 'Mật khẩu phải có ít nhất 4 ký tự'
    } else if ((password.match(/[A-Z]/g) || []).length < 1) {
      return 'Mật khẩu phải có ít nhất 1 chữ hoa'
    } else if ((password.match(/[^a-z]/gi) || []).length < 1) {
      return 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt'
    } else return null
  }

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>Đổi mật khẩu</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <Form
                id="changePasswordForm"
                onSubmit={onSubmit}
                className={'flex flex-col gap-3 p-0.5'}
              >
                <TextField
                  className="w-full"
                  name="oldPassword"
                  isRequired
                  value={form.oldPassword}
                  onChange={(value) => setForm({ ...form, oldPassword: value })}
                  validate={(value) => {
                    return !value || value.trim() === ''
                      ? MSG_LIST.REQUIRED_FIELD
                      : null
                  }}
                >
                  <Label>Mật khẩu cũ</Label>
                  <Input
                    type="password"
                    placeholder="Nhập mật khẩu cũ"
                    autoFocus
                    tabIndex={1}
                  />
                  <FieldError />
                </TextField>
                <TextField
                  className="w-full"
                  name="newPassword"
                  isRequired
                  value={form.newPassword}
                  onChange={(value) => setForm({ ...form, newPassword: value })}
                  validate={validatePassword}
                >
                  <Label>Mật khẩu mới</Label>
                  <Input
                    type="password"
                    placeholder="Nhập mật khẩu mới"
                    tabIndex={2}
                  />
                  <FieldError />
                </TextField>
                <TextField
                  className="w-full"
                  name="confirmPassword"
                  isRequired
                  value={form.confirmPassword}
                  onChange={(value) =>
                    setForm({ ...form, confirmPassword: value })
                  }
                  validate={(value) => {
                    if (!value || value.trim() === '') {
                      return MSG_LIST.REQUIRED_FIELD
                    } else if (value !== form.newPassword) {
                      return 'Mật khẩu xác nhận không khớp'
                    }
                    return null
                  }}
                >
                  <Label>Xác nhận mật khẩu</Label>
                  <Input
                    type="password"
                    placeholder="Nhập lại mật khẩu mới"
                    tabIndex={3}
                  />
                  <FieldError />
                </TextField>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="tertiary" slot="close">
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                form="changePasswordForm"
                isPending={isPending}
              >
                {({ isPending }) => {
                  if (isPending)
                    return (
                      <>
                        <Spinner />
                        <span>Đang xử lý</span>
                      </>
                    )
                  else return <span>Xác nhận</span>
                }}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  )
}
