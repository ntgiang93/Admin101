import { AlertDialog, Button, Spinner } from '@heroui/react'
import { MenuHook } from '@/hooks/sys/menu.ts'
import type { MenuItem } from '@/types/sys/Menu.ts'

interface DeleteConfirmModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  selectedMenu?: MenuItem
  refetch: () => void
  resetSelected: () => void
}

function DeleteMenuAlert(props: DeleteConfirmModalProps) {
  const { isOpen, onOpenChange, selectedMenu, refetch, resetSelected } = props
  const { mutateAsync: del, isPending } = MenuHook.useDelete()

  const handleDelete = async () => {
    const success = await del(selectedMenu?.id || 0)
    if (success) {
      refetch()
    }
    resetSelected()
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
                Xóa menu {selectedMenu?.name} ?
              </AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>
              <p>
                Bạn chắc chắn muốn xóa{' '}
                <strong className={'text-danger'}>{selectedMenu?.name}</strong>?
                Thao tác này không thể hoàn tác.
              </p>
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <Button slot="close" variant="tertiary">
                Hủy bỏ
              </Button>
              <Button
                slot="close"
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

export default DeleteMenuAlert
