import { createFileRoute, Outlet } from '@tanstack/react-router'
import { AdminLayout } from '@/components/ui/layout/AdminLayout.tsx'
import { useAuth } from '@/components/ui/layout/AuthProvider.tsx'
import clsx from 'clsx'
import { Skeleton } from '@heroui/react'

export const Route = createFileRoute('/(app)')({
  component: RouteComponent,
})

function RouteComponent() {
  const { isAppLoading } = useAuth()
  if (isAppLoading) {
    return (
      //App skeleton layout
      <div
        className={clsx(
          `text-foreground bg-background overflow-hidden`,
          'min-h-screen flex flex-row',
        )}
      >
        <aside
          className={clsx(
            ' flex flex-col h-screen justify-between w-64 p-3 gap-4 shrink-0',
            'max-lg:hidden',
          )}
        >
          <div>
            <div
              className={clsx(
                'flex items-center justify-start w-full gap-2 mb-4',
              )}
            >
              <Skeleton className="h-8 w-8 rounded-lg aspect-square" />
              <Skeleton className="h-8 rounded-lg w-full" />
            </div>
            <div className={'flex flex-col gap-2'}>
              {Array.from({ length: 8 }, (_, i) => (
                <Skeleton
                  key={`skeleton-lg-${i}`}
                  className="h-6 rounded-lg w-full"
                />
              ))}
            </div>
          </div>
          <Skeleton className="h-8 rounded-lg w-full" />
        </aside>
        <div className="w-full flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
          <div
            className={'flex flex-row justify-end gap-2 p-4 items-center h-12'}
          >
            <Skeleton className="h-6 rounded-full w-6" />
            <Skeleton className="h-6 rounded-full w-6" />
            <Skeleton className="h-6 rounded-full w-6" />
            <Skeleton className="h-8 rounded-full w-8" />
          </div>
          <main className="bg-accent/10 p-4 rounded-xl h-full shadow-inner overflow-auto shirk-1">
            <Skeleton className="h-full rounded-lg bg-background shadow w-full" />
          </main>
        </div>
      </div>
    )
  } else
    return (
      <AdminLayout>
        <Outlet />
      </AdminLayout>
    )
}
