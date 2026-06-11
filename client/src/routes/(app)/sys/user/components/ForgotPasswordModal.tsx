import { AuthHook } from '@/hooks/sys/auth'
import {
  defaultForgotPasswordDto,
  type ForgotPasswordDto,
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
import { type FormEvent, useEffect, useState } from 'react'
import { MSG_LIST } from '@/types/constant/MessageList.ts'

interface ForgotPasswordModalProps {
  isOpen: boolean
  onOpenChange: () => void
}

export default function ForgotPasswordModal(props: ForgotPasswordModalProps) {
  const { isOpen, onOpenChange } = props
  const [form, setForm] = useState<ForgotPasswordDto>({
    ...defaultForgotPasswordDto,
  })
  const { mutateAsync: requestReset, isPending } = AuthHook.useForgotPassword()

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const response = await requestReset(form)
    if (response && response.success) {
      setForm({ ...defaultForgotPasswordDto })
      onOpenChange()
    }
  }

  useEffect(() => {
    if (!isOpen) {
      setForm({ ...defaultForgotPasswordDto })
    }
  }, [isOpen])

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>Quên mật khẩu</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <p className="text-sm text-default-500 mb-4">
                Nhập email của bạn để nhận link đặt lại mật khẩu.
              </p>
              <Form
                id="forgotPasswordForm"
                onSubmit={onSubmit}
                className="flex flex-col gap-3 p-0.5"
              >
                <TextField
                  className="w-full"
                  name="email"
                  isRequired
                  value={form.email}
                  onChange={(value) => setForm({ ...form, email: value })}
                  validate={(value) => {
                    if (!value || value.trim() === '') {
                      return MSG_LIST.REQUIRED_FIELD
                    }
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                    if (!emailRegex.test(value)) {
                      return 'Email không hợp lệ'
                    }
                    return null
                  }}
                >
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="Nhập email"
                    autoFocus
                    tabIndex={1}
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
                form="forgotPasswordForm"
                isPending={isPending}
              >
                {({ isPending }) => {
                  if (isPending)
                    return (
                      <>
                        <Spinner />
                        <span>Đang gửi</span>
                      </>
                    )
                  else return <span>Gửi</span>
                }}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  )
}
