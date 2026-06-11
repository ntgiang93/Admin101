import { AuthHook } from '@/hooks/sys/auth.ts'
import { UserHook } from '@/hooks/sys/user.ts'
import { useAuthStore } from '@/store/auth-store.ts'
import { EPermission } from '@/types/base/Permission.ts'
import { type UserDto } from '@/types/sys/User.ts'
import { AlertDialog, Button, Card, Link, Spinner } from '@heroui/react'
import { type ChangeEvent, useMemo, useRef, useState } from 'react'
import ChangePasswordModal from './ChangePasswordModal.tsx'
import UserDetailModal from './UserDetailModal.tsx'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Edit01Icon,
  Image02Icon,
  MailAccount01Icon,
  ResetPasswordIcon,
  SecurityPasswordIcon,
  ShieldUserIcon,
  TelephoneIcon,
} from '@hugeicons/core-free-icons'
import { useAuth } from '@/components/ui/layout/AuthProvider.tsx'

interface ActionCardProps {
  user: UserDto
  fetchUser: () => void
}

const MAX_AVATAR_SIZE = 1024 * 1024 // 1 MB

export default function ActionCard(props: ActionCardProps) {
  const { user, fetchUser } = props
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { mutateAsync: updateAvatar, isPending } = UserHook.useUpdateAvatar()
  const { mutateAsync: resetPassword, isPending: isPendingReset } =
    AuthHook.useResetPassword()
  const [detailOpen, setDetailOpen] = useState(false)
  const [changePassOpen, setChangePassOpen] = useState(false)
  const [resetPassOpen, setResetPassOpen] = useState(false)
  const { hasPermission } = useAuth()
  const { user: loginUser } = useAuthStore()

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    if (file.size > MAX_AVATAR_SIZE) {
      fileInputRef.current && (fileInputRef.current.value = '')
      return
    }

    await updateAvatar({ userId: user.id, file })
    fetchUser()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleResetPassword = async () => {
    await resetPassword(user.id)
    setResetPassOpen(false)
  }

  const isCurrentUser = useMemo(() => {
    return loginUser?.id === user.id
  }, [loginUser, user])

  return (
    <Card className="md:col-span-2 h-full">
      <Card.Header>
        <h4 className="text-lg font-semibold">Thay đổi thông tin tài khoản</h4>
      </Card.Header>
      <Card.Content className="flex flex-col gap-4 text-sm h-max overflow-hidden">
        {hasPermission('User', EPermission.Edit) && (
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={Edit01Icon} size={18} />
            <Link href="#" onPress={() => setDetailOpen(true)}>
              Chỉnh sửa
            </Link>
          </div>
        )}
        {isCurrentUser && (
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={Image02Icon} size={18} />
            {isPending && <Spinner size="sm" />}
            {!isPending && (
              <Link
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  handleAvatarClick()
                }}
                aria-disabled={isPending}
              >
                Đổi ảnh đại diện
              </Link>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
              aria-label="Đổi ảnh đại diện"
            />
          </div>
        )}
        {isCurrentUser && (
          <>
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={MailAccount01Icon} size={18} />
              <Link href="#">Đổi email</Link>
            </div>
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={TelephoneIcon} size={18} />
              <Link href="#">Đổi số điện thoại</Link>
            </div>
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={SecurityPasswordIcon} size={18} />
              <Link href="#" onPress={() => setChangePassOpen(true)}>
                Đổi mật khẩu
              </Link>
            </div>
          </>
        )}
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={ResetPasswordIcon} size={18} />
          <Link href="#" onPress={() => setResetPassOpen(true)}>
            Đặt lại mật khẩu
          </Link>
        </div>
        {user.twoFa && isCurrentUser && (
          <div className="flex items-center text-danger gap-2">
            <HugeiconsIcon icon={ShieldUserIcon} size={18} />
            <Link href="#" className="text-danger">
              Tắt xác thực 2 yếu tố
            </Link>
          </div>
        )}
        {!user.twoFa && isCurrentUser && (
          <div className="flex items-center text-primary gap-2">
            <HugeiconsIcon icon={ShieldUserIcon} size={18} />
            <Link href="#" className="text-primary">
              Bật xác thực 2 yếu tố
            </Link>
          </div>
        )}
        {hasPermission('User', EPermission.Edit) && user.isLocked && (
          <div className="flex items-center text-danger gap-2">
            <HugeiconsIcon icon={ShieldUserIcon} size={18} />
            <Link href="#" className="text-danger">
              Mở khóa người dùng
            </Link>
          </div>
        )}
      </Card.Content>
      <UserDetailModal
        isOpen={detailOpen}
        onOpenChange={() => setDetailOpen(!detailOpen)}
        onRefresh={fetchUser}
        id={user.id}
      />
      <ChangePasswordModal
        isOpen={changePassOpen}
        onOpenChange={() => setChangePassOpen(!changePassOpen)}
        onRefresh={fetchUser}
      />
      <AlertDialog
        isOpen={resetPassOpen}
        onOpenChange={() => setResetPassOpen(!resetPassOpen)}
      >
        <AlertDialog.Backdrop>
          <AlertDialog.Container>
            <AlertDialog.Dialog>
              <AlertDialog.Header>
                <AlertDialog.Heading>Đặt lại mật khẩu</AlertDialog.Heading>
              </AlertDialog.Header>
              <AlertDialog.Body>
                Bạn có chắc chắn muốn đặt lại mật khẩu cho người dùng này? Mật
                khẩu mới sẽ được gửi qua email.
              </AlertDialog.Body>
              <AlertDialog.Footer>
                <Button
                  variant="tertiary"
                  onPress={() => setResetPassOpen(false)}
                >
                  Hủy bỏ
                </Button>
                <Button
                  variant="danger"
                  isPending={isPendingReset}
                  onPress={handleResetPassword}
                >
                  {({ isPending }) => {
                    if (isPending)
                      return (
                        <>
                          <Spinner />
                          <span>Đang xử lý</span>
                        </>
                      )
                    else return <span>Xác nhận</span>
                  }}
                </Button>
              </AlertDialog.Footer>
            </AlertDialog.Dialog>
          </AlertDialog.Container>
        </AlertDialog.Backdrop>
      </AlertDialog>
    </Card>
  )
}
