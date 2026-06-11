import { Toast } from '@heroui/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Outlet, createRootRoute } from '@tanstack/react-router'
import { LanguageProvider } from '@/components/ui/layout/LanguageProvider'
import { AuthProvider } from '../components/ui/layout/AuthProvider'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true, // Prevents automatic refetching when user switches back to the browser tab
      retry: 0, // Disables automatic retry attempts on failed queries to avoid unnecessary network requests
      staleTime: 1000, // Sets data as fresh for 1 second (1000ms), preventing immediate refetches
      refetchOnMount: true,
    },
  },
})

export const Route = createRootRoute({
  component: () => (
    <>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <Toast.Provider placement={'top end'} />
          <AuthProvider>
            <Outlet />
          </AuthProvider>
        </LanguageProvider>
        {/* <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        /> */}
      </QueryClientProvider>
    </>
  ),
})
