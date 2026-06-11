import { AlertDialog, Button, Spinner } from '@heroui/react'
import { DepartmentHook } from '@/hooks/orgazination/department'
import type { DepartmentDto } from '@/types/sys/Department'

interface DeleteDepartmentAlertProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  selectedDepartment?: DepartmentDto
  refetch: () => void
}

function DeleteDepartmentAlert(props: DeleteDepartmentAlertProps) {
  const { isOpen, onOpenChange, selectedDepartment, refetch } = props
  const { mutateAsync: del, isPending } = DepartmentHook.useDelete()

  const handleDelete = async () => {
    if (!selectedDepartment) return

    await del(selectedDepartment.id)
    refetch()
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
                Xóa phòng ban {selectedDepartment?.name}?
              </AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>
              <p>
                Bạn chắc chắn muốn xóa phòng ban{' '}
                <strong className={'text-danger'}>
                  {selectedDepartment?.name}
                </strong>
                ? Thao tác này không thể hoàn tác.
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

export default DeleteDepartmentAlert
