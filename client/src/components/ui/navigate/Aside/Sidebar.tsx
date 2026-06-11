import { Brand } from '@/components/ui/navigate/Brand'
import { MenuHook } from '@/hooks/sys/menu'
import { UserHook } from '@/hooks/sys/user'
import { StringHelper } from '@/libs/StringHelper.ts'
import { useAuthStore } from '@/store/auth-store'
import {
  Avatar,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  Separator,
  Skeleton,
} from '@heroui/react'
import { ArrowRight02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import clsx from 'clsx'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import SideMenu from './SideMenu.tsx'

interface ISidebarMenuProps {}

export const Sidebar = (props: ISidebarMenuProps) => {
  const {} = props
  const [isCompact, setIsCompact] = useState(false)
  const { data, isFetching } = MenuHook.useGetUserMenu()
  const { data: permission } = UserHook.useGetPermissions()
  const { setPermissions, user } = useAuthStore()

  const toggleSidebar = () => {
    setIsCompact(!isCompact)
  }
  useEffect(() => {
    setPermissions(permission || [])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permission])

  return (
    <Card
      variant={'transparent'}
      className={clsx(
        'h-full transition-all duration-400 ease-in-out p-2',
        `${isCompact ? 'w-16' : 'w-64'}`,
      )}
    >
      <CardHeader>
        <Brand
          isCompact={isCompact}
          brandName={'Next Admin'}
          setCompactMode={toggleSidebar}
        />
      </CardHeader>
      <CardContent>
        {isFetching ? (
          Array.from({ length: 10 }).map((_, rowIndex) => (
            <Skeleton
              key={rowIndex}
              className="h-8 w-full rounded-md my-2"
            ></Skeleton>
          ))
        ) : (
          <SideMenu items={data || []} isCompact={isCompact} />
        )}
        <Button
          className={clsx(
            'max-lg:hidden mx-auto transition-all duration-300',
            `${isCompact ? 'opacity-100' : 'opacity-0'}`,
          )}
          isIconOnly
          onPress={toggleSidebar}
          hidden={!isCompact}
          size={'sm'}
          variant={'ghost'}
        >
          <HugeiconsIcon icon={ArrowRight02Icon} />
        </Button>
      </CardContent>
      <CardFooter className="flex w-full flex-col gap-2 justify-center">
        <Separator />
        <div className={clsx('w-full items-center flex justify-center gap-2')}>
          <div>
            <Avatar className={'border-2 border-accent'}>
              <Avatar.Image alt="John Doe" src={user?.avatar} />
              <Avatar.Fallback>
                {StringHelper.getFirstLetterUpper(user?.fullName)}
              </Avatar.Fallback>
            </Avatar>
          </div>
          <AnimatePresence>
            {!isCompact && (
              <motion.span
                initial={{ opacity: 1, width: 'auto' }}
                animate={{
                  opacity: 1,
                  width: 'auto',
                }}
                exit={{
                  opacity: 0,
                  width: 0,
                }}
                transition={{
                  duration: 0.5,
                  ease: [0.4, 0.0, 0.2, 1],
                  opacity: { duration: 0.2 },
                  delay: 0.3,
                }}
                className={clsx('truncate text-sm')}
              >
                {user?.fullName}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </CardFooter>
    </Card>
  )
}
