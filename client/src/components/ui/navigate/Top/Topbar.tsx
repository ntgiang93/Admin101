import LanguageSwitcher from '@/components/shared/app/select/LanguageSwitcher'
import { useAuthStore } from '@/store/auth-store'
import { useAuth } from '../../layout/AuthProvider'
import { Avatar, Button, Dropdown, Kbd } from '@heroui/react'
import {
  LogoutSquare01Icon,
  Search01FreeIcons,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { StringHelper } from '@/libs/StringHelper.ts'
import { NotificationCenter } from '@/components/shared/drop-down/notification/NotificationCenter.tsx'
import ThemeSwitch from '@/components/ui/button/theme-switch.tsx'
import { FunctionSearchModal } from '@/components/ui/navigate/Top/FunctionSearchModal.tsx'
import { useEffect, useState } from 'react'
import { useTranslation } from '@/components/ui/layout/LanguageProvider'

export const Topbar = () => {
  const [isOpen, setOpen] = useState(false)
  const { user } = useAuthStore()
  const { navigate, logout } = useAuth()
  const { t } = useTranslation()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.altKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault()
        setOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <nav className="w-full px-8 gap-4 h-12 flex items-center justify-center relative">
      <Button
        variant={'ghost'}
        className={'rounded-xl shadow-sm w-1/4 bg-'}
        size={'sm'}
        onPress={() => setOpen(true)}
      >
        <div className={'flex flex-row justify-between w-full group'}>
          <div
            className={
              'flex items-center gap-4 text-default group-hover:text-foreground font-normal'
            }
          >
            <HugeiconsIcon icon={Search01FreeIcons} />
            <span>{t('common.search')}</span>
          </div>
          <div className={'flex gap-2'}>
            <Kbd className={'hidden md:flex'}>Alt</Kbd>
            <Kbd className={'hidden md:flex'}>S</Kbd>
          </div>
        </div>
      </Button>
      <div
        className={
          'flex flex-row gap-4 items-center justify-center absolute top-2 right-8'
        }
      >
        <LanguageSwitcher />
        <ThemeSwitch />
        <NotificationCenter />
        <Dropdown>
          <Dropdown.Trigger>
            <Avatar size={'sm'} className={'border-2 border-accent'}>
              <Avatar.Image alt="John Doe" src={user?.avatar} />
              <Avatar.Fallback>
                {StringHelper.getFirstLetterUpper(user?.fullName)}
              </Avatar.Fallback>
            </Avatar>
          </Dropdown.Trigger>
          <Dropdown.Popover placement={'bottom left'}>
            <Dropdown.Menu>
              <Dropdown.Item
                id="user"
                onAction={() => navigate(`/sys/user/${user?.id}`)}
              >
                <div className={'flex items-center gap-2'}>
                  <Avatar size={'sm'} className={'border-2 border-accent'}>
                    <Avatar.Image alt="John Doe" src={user?.avatar} />
                    <Avatar.Fallback>
                      {StringHelper.getFirstLetterUpper(user?.fullName)}
                    </Avatar.Fallback>
                  </Avatar>
                  <span>{user?.fullName}</span>
                </div>
              </Dropdown.Item>
              <Dropdown.Item id="logout" variant={'danger'} onAction={logout}>
                <div className={'flex items-center gap-2 text-danger'}>
                  <span className={'px-2'}>
                    <HugeiconsIcon icon={LogoutSquare01Icon} size={18} />
                  </span>
                  <span>{t('common.logout')}</span>
                </div>
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown.Popover>
        </Dropdown>
      </div>

      <FunctionSearchModal
        isOpen={isOpen}
        onOpenChange={() => setOpen(!isOpen)}
      />
    </nav>
  )
}
