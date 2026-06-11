import { AuthHook } from '@/hooks/sys/auth'
import {
  defaultForgotPasswordDto,
  type ForgotPasswordDto,
} from '@/types/sys/User'
import {
  Button,
  Form,
  InputGroup,
  Label,
  Modal,
  Spinner,
  TextField
} from '@heroui/react'
import { Mail01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { type FormEvent, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation()
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
      <Modal.Backdrop isDismissable={true}>
        <Modal.Container size={'sm'}>
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <p className="text-lg font-semibold"> {t('forgot_password')}</p>
              <p className="text-sm text-muted">
                {t('forgot_pass_description')}
              </p>
            </Modal.Header>
            
            <Modal.Body className={'p-2'}>
              <Form
                id="forgotPasswordForm"
                onSubmit={onSubmit}
                className="flex flex-col gap-4 mt-2"
              >
                <TextField
                  className="w-full"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={(value) => setForm({ ...form, email: value })}
                  validate={(value) => {
                    if (!value || value.trim() === '') {
                      return 'Trường bắt buộc'
                    }
                  }}
                >
                  <Label>{t('email')}</Label>
                                    <InputGroup>
                                    <InputGroup.Prefix>
                                      <HugeiconsIcon icon={Mail01Icon} className="size-4 text-muted" />
                                    </InputGroup.Prefix>
                                    <InputGroup.Input placeholder={t('email_placeholder')}/>
                                  </InputGroup>
                </TextField>
              </Form>
            </Modal.Body>
            <Modal.Footer className={'flex flex-col gap-2'}>
              <Button
                type="submit"
                form="forgotPasswordForm"
                isPending={isPending}
                fullWidth
              >
                                {({ isPending }) => (
                                  <>
                                    {isPending ? <Spinner color="current" size="sm" /> : null}
                {t('send_request')}
                                  </>
                                )}
              </Button>
              <Button
                isDisabled={isPending}
                variant={'ghost'}
                onPress={onOpenChange}
                fullWidth
              >
                {t('cancel')}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  )
}
