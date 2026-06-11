import { type UserDto } from '@/types/sys/User.ts'
import { Avatar, Card, Chip, Skeleton } from '@heroui/react'
import dayjs from 'dayjs'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  CheckmarkCircle03Icon,
  MailAtSign01Icon,
  ShieldUserIcon,
  TelephoneIcon,
  UserIcon,
  UserLock01Icon,
} from '@hugeicons/core-free-icons'

interface AccountCardProps {
  user: UserDto
  loading: boolean
}

export default function AccountCard(props: AccountCardProps) {
  const { user, loading } = props

  return (
    <Card>
      <Card.Content className="flex flex-col justify-start gap-4 text-sm h-max overflow-hidden">
        {loading && (
          <>
            <div className="max-w-75 w-full flex items-center gap-3">
              <div>
                <Skeleton className="flex rounded-full w-14 h-14" />
              </div>
              <div className="w-full flex flex-col gap-2">
                <Skeleton className="h-4 w-3/5 rounded-lg" />
                <Skeleton className="h-3 w-4/5 rounded-lg" />
              </div>
            </div>
            <Skeleton className="h-3 w-3/5 rounded-lg" />
            <Skeleton className="h-4 w-3/5 rounded-lg" />
            <Skeleton className="h-4 w-3/5 rounded-lg" />
            <Skeleton className="h-4 w-3/5 rounded-lg" />
            <Skeleton className="h-4 w-3/5 rounded-lg" />
          </>
        )}
        {!loading && (
          <>
            <div className="flex items-center gap-3">
              <Avatar size="lg" className={'border border-accent'}>
                <Avatar.Image
                  alt={user.fullName}
                  src={
                    user.avatar ||
                    `https://ui-avatars.com/api/?name=${user.fullName}`
                  }
                />
                <Avatar.Fallback>
                  {user.fullName?.charAt(0) || 'U'}
                </Avatar.Fallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-lg font-semibold">
                  {user.fullName || 'Unknown User'}
                </span>
                <span className="text-xs text-default-500">ID: {user.id}</span>
              </div>
            </div>
            {user.isActive && (
              <div className="flex items-center gap-2 text-success">
                <HugeiconsIcon icon={CheckmarkCircle03Icon} size={16} />
                <span>Hoạt động</span>
              </div>
            )}
            {!user.isActive && (
              <div className="flex items-center gap-2 text-default">
                <HugeiconsIcon icon={CheckmarkCircle03Icon} size={16} />
                <span>Không hoạt động</span>
              </div>
            )}
            {user.isLocked && (
              <div className="flex items-center gap-2 text-danger">
                <HugeiconsIcon icon={UserLock01Icon} size={16} />
                <span>
                  {dayjs(user.lockExprires).format('DD/MM/YYYY HH:mm:ss')}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={UserIcon} size={16} />
              <span>{user.userName}</span>
            </div>
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={MailAtSign01Icon} size={16} />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={TelephoneIcon} size={16} />
              <span>{user.phone}</span>
            </div>
            {user.twoFa && (
              <div className="flex items-center gap-2 text-success">
                <HugeiconsIcon icon={ShieldUserIcon} size={16} />
                <span>Đã bật 2FA</span>
              </div>
            )}
            {!user.twoFa && (
              <div className="flex items-center gap-2 text-default">
                <HugeiconsIcon icon={ShieldUserIcon} size={16} />
                <span>Chưa bật 2FA</span>
              </div>
            )}
            <div className="flex gap-2 flex-wrap">
              {user.rolesName?.map((r) => (
                <Chip key={r} variant="soft">
                  {r}
                </Chip>
              ))}
            </div>
          </>
        )}
      </Card.Content>
    </Card>
  )
}
