import { Sidebar } from '@/components/ui//navigate/Aside/Sidebar'
import { Topbar } from '@/components/ui/navigate/Top/Topbar'
import { UserHook } from '@/hooks/sys/user'
import { useNavivationStore } from '@/store/navigation-store'
import clsx from 'clsx'
import { type ReactNode, useMemo, useRef } from 'react'
import { useAuth } from './AuthProvider'

export const AdminLayout = ({ children }: { children: ReactNode }) => {
  const { isAppLoading } = useAuth()
  const { navigating } = useNavivationStore()
  const topbarRef = useRef<HTMLDivElement>(null)
  const {} = UserHook.useGetMe(!isAppLoading)

  const topbarHeight = useMemo(() => {
    return topbarRef.current?.offsetHeight || 0
  }, [topbarRef.current])

  return (
    <div
      className={clsx(
        `text-foreground bg-surface overflow-hidden`,
        'min-h-screen flex flex-row',
      )}
    >
      {/* SidebarMenu */}
      <aside
        className={clsx(' flex flex-col h-screen shrink-0', 'max-lg:hidden')}
      >
        <Sidebar />
      </aside>
      {/* Drawer side bar */}
      {/*<Drawer*/}
      {/*  isOpen={isOpen}*/}
      {/*  size={'sm'}*/}
      {/*  onClose={onClose}*/}
      {/*  className={'lg:hidden w-fit'}*/}
      {/*  placement={'left'}*/}
      {/*  backdrop={'blur'}*/}
      {/*  radius={'sm'}*/}
      {/*>*/}
      {/*  <DrawerContent>*/}
      {/*    {(onClose) => (*/}
      {/*      <>*/}
      {/*        <DrawerBody className="p-2">*/}
      {/*          <Sidebar isCompact={isCompact && !showSidebar} />*/}
      {/*        </DrawerBody>*/}
      {/*      </>*/}
      {/*    )}*/}
      {/*  </DrawerContent>*/}
      {/*</Drawer>*/}

      {/* SidebarMenu và Main content */}
      <div className="w-full flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <div ref={topbarRef}>
          <Topbar />
        </div>
        {/* Main content */}
        <main
          className="bg-background p-4 rounded-xl shadow-inner overflow-auto"
          style={{ height: `calc(100vh - ${topbarHeight}px)` }}
        >
          {!navigating && children}
        </main>
      </div>
    </div>
  )
}
