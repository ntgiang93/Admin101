import { RoleHook } from '@/hooks/sys/role.ts'
import type { RoleDto } from '@/types/sys/Role.ts'
import { AlertDialog, Button, Spinner } from '@heroui/react'

interface DeleteRoleAlertProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  selectedRole?: RoleDto
  refetch: () => void
}

function DeleteRoleAlert(props: DeleteRoleAlertProps) {
  const { isOpen, onOpenChange, selectedRole, refetch } = props
  const { mutateAsync: del, isPending } = RoleHook.useDelete(
    selectedRole?.id || 0,
  )

  const handleDelete = async () => {
    const success = await del()
    if (success) {
      refetch()
    }
    onOpenChange(false)
  }

  return (
    <AlertDialog isOpen={isOpen} onOpenChange={onOpenChange}>
      <AlertDialog.Backdrop>
        <AlertDialog.Container>
          <AlertDialog.Dialog className="sm:max-w-100">
            <AlertDialog.CloseTrigger />
            <AlertDialog.Header>
              <AlertDialog.Icon status="danger" />
              <AlertDialog.Heading>
                Xóa vai trò {selectedRole?.name} ?
              </AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>
              <p>
                Bạn chắc chắn muốn xóa vai trò{' '}
                <strong className={'text-danger'}>{selectedRole?.name}</strong>?
                Thao tác này không thể hoàn tác.
              </p>
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <Button slot="close" variant="tertiary">
                Hủy bỏ
              </Button>
              <Button
                variant="danger"
                onPress={() => handleDelete()}
                isPending={isPending}
              >
                {({ isPending }) => (
                  <>
                    {isPending ? <Spinner color="current" size="sm" /> : null}
                    Xóa
                  </>
                )}
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </AlertDialog>
  )
}

export default DeleteRoleAlert
