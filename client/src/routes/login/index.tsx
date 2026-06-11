import Logo from '@/assets/logo.png'
import { useAuth } from '@/components/ui/layout/AuthProvider.tsx'
import ForgotPasswordModal from '@/routes/login/components/ForgotPasswordModal'
import { defaultLogin, type LoginDto } from '@/types/sys/Auth.ts'
import {
  Button,
  Card,
  CardDescription,
  CardHeader,
  FieldError,
  Form,
  InputGroup,
  Label,
  Link,
  Separator,
  Spinner,
  TextField
} from '@heroui/react'
import { LockPasswordIcon, LoginSquare01Icon, User03Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { createFileRoute } from '@tanstack/react-router'
import clsx from 'clsx'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/login/')({
  component: LoginComponent,
})

function LoginComponent() {
  const [form, setForm] = useState<LoginDto>({ ...defaultLogin })
  const { login } = useAuth()
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const validatePassword = (password: string): string => {
    if (password.length === 0) return t('login.passwordRequired')
    return ''
  }

  const onSubmit = async (e: any) => {
    setIsLoading(true)
    e.preventDefault()
    await login(form)
    setIsLoading(false)
  }

  return (
    <div className="flex justify-center gap-40 h-screen md:p-32 max-sm:p-8 bg-[#fef0cd]">
      <div className={'flex items-center justify-center h-full w-full'}>
        <Card
          className={clsx(
            'p-8 backdrop-blur-md border w-100 max-sm:w-96',
            'transition-all duration-300 ease-in-out',
          )}
        >
          <CardHeader className="flex flex-col gap-3">
            <img
              alt="Logo"
              className="h-16 w-auto mx-auto rounded-xl"
              loading="lazy"
              src={Logo}
            />
            <h3 className="font-semibold text-center text-3xl text-accent">
              {t('app_name')}
            </h3>
            <p className="text-center text-muted text-sm">
              {t('company_name')}
            </p>
          </CardHeader>
          <CardDescription className={'text-center font-semibold text-lg text-foreground/80'}>
            {t('welcome_back')}
          </CardDescription>
          <Card.Content className={'overflow-hidden'}>
            <Form
              id="loginForm"
              onSubmit={onSubmit}
              className={'flex flex-col gap-6 mx-2'}
            >
              <TextField
                className="w-full"
                name="username"
                isRequired
                onChange={(value) => {
                  setForm((prev) => ({ ...prev, username: value }))
                }}
                validate={(value) =>
                  value === '' || !value ? t('common.required') : null
                }
              >
                <Label>{t('account')}</Label>
                  <InputGroup>
                  <InputGroup.Prefix>
                    <HugeiconsIcon icon={User03Icon} className="size-4 text-muted" />
                  </InputGroup.Prefix>
                  <InputGroup.Input placeholder={t('username_placeholder')}/>
                </InputGroup>
                <FieldError />
              </TextField>
              <TextField
                className="w-full"
                name="password"
                type={'password'}
                isRequired
                onChange={(value) => {
                  setForm((prev) => ({ ...prev, password: value }))
                }}
                validate={(value) => {
                  const error = validatePassword(value)
                  if (error && error.length > 0) return error
                }}
              >
                <Label>{t('password')}</Label>
                  <InputGroup>
                  <InputGroup.Prefix>
                    <HugeiconsIcon icon={LockPasswordIcon} className="size-4 text-muted" />
                  </InputGroup.Prefix>
                  <InputGroup.Input placeholder={t('password_placeholder')}/>
                </InputGroup>
                <FieldError />
              </TextField>
              <div className={'flex justify-end w-full'}>
                <Link
                  className="text-sm text-accent font-light hover:underline decoration-accent/50"
                  onPress={() => setIsOpen(true)}
                >
                  {t('forgot_password')}
                </Link>
              </div>
              <Button
                form="loginForm"
                type="submit"
                className={'w-full'}
                isPending={isLoading}
              >
                {({ isPending }) => (
                  <>
                    {isPending ? <Spinner color="current" size="sm" /> : null}
                    {t('login')}
                    <HugeiconsIcon icon={LoginSquare01Icon} />
                  </>
                )}
              </Button>
              <Separator/>
              <p className={'text-muted text-sm w-full text-center'}>
                {t('app_description')}
              </p>
            </Form>
          </Card.Content>
        </Card>
      </div>
      <ForgotPasswordModal
        isOpen={isOpen}
        onOpenChange={() => setIsOpen(!isOpen)}
      />
    </div>
  )
}
