import { UserHook } from '@/hooks/sys/user'
import { defaultUserDto } from '@/types/sys/User'
import { Button, Card, Tabs, Tooltip } from '@heroui/react'
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import AccountCard from './components/AccountCard.tsx'
import ActionCard from './components/ActionCard.tsx'
import UserAttachmentsDocument from './components/UserAttachmentsDocument.tsx'
import UserProfileForm from './components/UserProfileForm.tsx'

export const Route = createFileRoute('/(app)/sys/user/$id')({
  component: UserDetailPage,
})

function UserDetailPage() {
  const params = Route.useParams()
  const id = params.id
  const { data: user, isFetching, refetch } = UserHook.useGet(id)
  const navigate = useNavigate()

  return (
    <div className="h-full w-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Chi tiết người dùng</h1>
        <Tooltip delay={0}>
          <Button
            isIconOnly
            variant="ghost"
            size="sm"
            onPress={() => navigate({ to: '/sys/user' })}
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} />
          </Button>
          <Tooltip.Content>Quay lại</Tooltip.Content>
        </Tooltip>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-6 max-lg:gap-y-6 h-full">
        <div className="md:col-span-1 flex flex-col gap-6 h-full">
          <AccountCard
            user={user || { ...defaultUserDto }}
            loading={isFetching}
          />
          <div className="flex-1">
            <ActionCard
              user={user || { ...defaultUserDto }}
              fetchUser={refetch}
            />
          </div>
        </div>
        {/* Profile Card */}
        <Card className="md:col-span-2">
          <Card.Content>
            <Tabs aria-label="Options" className={'h-full'}>
              <Tabs.ListContainer>
                <Tabs.List aria-label="Options">
                  <Tabs.Tab id="generalInfo">
                    Thông tin chung
                    <Tabs.Indicator />
                  </Tabs.Tab>
                  <Tabs.Tab id="attachments">
                    Tài liệu đính kèm
                    <Tabs.Indicator />
                  </Tabs.Tab>
                </Tabs.List>
              </Tabs.ListContainer>
              <Tabs.Panel id="generalInfo" className={'h-full'}>
                <UserProfileForm id={id} />
              </Tabs.Panel>
              <Tabs.Panel id="attachments" className={'h-full'}>
                <UserAttachmentsDocument id={id} />
              </Tabs.Panel>
            </Tabs>
          </Card.Content>
        </Card>
      </div>
    </div>
  )
}
