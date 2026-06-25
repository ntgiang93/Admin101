import RoleSelect from '@/components/shared/app/select/RoleSelect'
import { UserHook } from '@/hooks/sys/user'
import {
  defaultUserDto,
  type SaveUserDto,
  type UserDto,
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
import { useEffect, useMemo, useState } from 'react'
import { MSG_LIST } from '@/types/constant/MessageList.ts'
import {useTranslation} from "react-i18next";
import {FormSkeleton} from "@/components/ui/loading/FormSkeleton.tsx";

interface UserDetailModalProps {
  isOpen: boolean
  onOpenChange: (val: boolean) => void
  onRefresh: () => void
  id: string
}

export default function UserDetailModal(props: UserDetailModalProps) {
  const { isOpen, onOpenChange, onRefresh, id } = props
  const [form, setForm] = useState<UserDto>({ ...defaultUserDto })
  const { mutateAsync: save, isPending } = UserHook.useSaveUser()
  const { data: user, isFetching } = UserHook.useGet(isOpen ? id : '')

  const {t} = useTranslation()
  const isEdit = useMemo(() => id !== undefined && id !== '', [id])

  const onSubmit = async (e: any) => {
    e.preventDefault()
    const body: SaveUserDto = {
      id: form.id,
      fullName: form.fullName,
      userName: form.userName,
      email: form.email,
      phoneNumber: form.phone,
      roles: form.roles,
    }
    const response = await save(body)
    if (response && response.success) {
      onOpenChange(false)
      onRefresh()
    }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const validateEmail = (value: string) => {
    if (value && value.length > 0 && !emailRegex.test(value)) {
      return 'Email không hợp lệ'
    }
    return null
  }

  const validatePhoneNumber = (value: string) => {
    if (value && value.trim() !== '') {
      const phoneRegex = /^0\d{8,14}$/
      if (!phoneRegex.test(value)) {
        return 'Số điện thoại không hợp lệ'
      }
    }
    return null
  }

  useEffect(() => {
    if (user) {
      setForm({ ...user })
    }
  }, [user])

  useEffect(() => {
    if (id === '' && isOpen) {
      setForm({ ...defaultUserDto })
    }
  }, [id, isOpen])

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Backdrop>
        <Modal.Container size={'lg'}>
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>
                {(isEdit ? t('edit') : t('create')) + ' ' + t('user')}
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              {isFetching && <FormSkeleton col={2} row={4} />}
              {!isFetching && (
                <Form
                  id="userForm"
                  onSubmit={onSubmit}
                  className={'grid grid-cols-2 gap-4 p-0.5'}
                >
                  <TextField
                    className="w-full"
                    name="fullName"
                    isRequired
                    variant={'secondary'}
                    value={form.fullName || ''}
                    onChange={(value) =>
                      setForm((prev) => ({ ...prev, fullName: value }))
                    }
                    validate={(value) => {
                      return value === '' || !value
                        ? MSG_LIST.REQUIRED_FIELD
                        : null
                    }}
                  >
                    <Label>{t('full_name')}</Label>
                    <Input
                      placeholder={t('placeholder_input',{field: t('full_name')})}
                      autoFocus
                      tabIndex={1}
                    />
                    <FieldError />
                  </TextField>
                  <TextField
                    className="w-full"
                    name="userName"
                    isRequired
                    variant={'secondary'}
                    isReadOnly={isEdit}
                    value={form.userName || ''}
                    onChange={(value) =>
                      setForm((prev) => ({ ...prev, userName: value }))
                    }
                    validate={(value) => {
                      if (!isEdit && (value === '' || !value)) {
                        return MSG_LIST.REQUIRED_FIELD
                      }
                      return null
                    }}
                  >
                    <Label>{t('account')}</Label>
                    <Input placeholder={t('placeholder_input',{field: t('account')})} tabIndex={2} />
                  </TextField>
                  <TextField
                    className="w-full"
                    name="email"
                    variant={'secondary'}
                    value={form.email || ''}
                    isRequired
                    isReadOnly={isEdit}
                    onChange={(value) =>
                      setForm((prev) => ({ ...prev, email: value }))
                    }
                    validate={validateEmail}
                  >
                    <Label>{t('email')}</Label>
                    <Input placeholder={t('placeholder_input',{field: t('email')})} tabIndex={3} />
                  </TextField>
                  <TextField
                      className="w-full"
                      name="phone"
                      value={form.phone || ''}
                      variant={'secondary'}
                      onChange={(value) =>
                          setForm((prev) => ({ ...prev, phone: value }))
                      }
                      validate={validatePhoneNumber}
                  >
                    <Label>{t('phone')}</Label>
                    <Input placeholder={t('placeholder_input',{field: t('phone')})} tabIndex={4} />
                    <FieldError />
                  </TextField>
                  <RoleSelect
                    value={form.roles.map(Number) || []}
                    onChange={(values: number[] | number) => {
                      setForm((prev) => ({
                        ...prev,
                        roles: [...(values as number[])],
                      }))
                    }}
                    className={'col-span-2'}
                    selectionMode="multiple"
                    label={t('role')}
                  />
                </Form>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="tertiary" slot="close">
                {t('cancel')}
              </Button>
              <Button type="submit" form="userForm" isPending={isPending}>
                {({ isPending }) => {
                  if (isPending)
                    return (
                      <>
                        <Spinner />
                        <span>{t('saving')}</span>
                      </>
                    )
                  else return <span>{t('save')}</span>
                }}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  )
}
