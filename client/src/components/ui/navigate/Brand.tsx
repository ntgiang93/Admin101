import { Link } from '@tanstack/react-router'
import clsx from 'clsx'
import { Button } from '@heroui/react'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft02Icon } from '@hugeicons/core-free-icons'

interface ISidebarProps {
  isCompact: boolean
  brandName: string
  setCompactMode?: () => void
}

export const Brand = (props: ISidebarProps) => {
  const { isCompact, brandName, setCompactMode } = props

  return (
    <div className={clsx('flex items-center justify-between w-full')}>
      <Link to={'/'} className={'flex relative mx-2 items-center gap-3'}>
        <img
          alt="Logo"
          height={32}
          src={'/logo.png'}
          width={32}
          className={'rounded-md'}
        />
        <p
          className={clsx(
            'font-bold text-xl text-inherit text-nowrap transition-opacity duration-300',
            `${isCompact ? 'opacity-0' : 'opacity-100'}`,
          )}
        >
          {brandName}
        </p>
      </Link>
      <Button
        className={'max-lg:hidden'}
        isIconOnly
        onPress={setCompactMode}
        hidden={isCompact}
        size={'sm'}
        variant={'ghost'}
      >
        <HugeiconsIcon icon={ArrowLeft02Icon} />
      </Button>
    </div>
  )
}
