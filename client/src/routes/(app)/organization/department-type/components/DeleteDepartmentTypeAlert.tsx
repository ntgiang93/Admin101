import { AlertDialog, Button, Spinner } from '@heroui/react'
import { DepartmentTypeHook } from '@/hooks/orgazination/departmentType'
import type { DepartmentTypeDto } from '@/types/sys/DepartmentType'

interface DeleteDepartmentTypeAlertProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  selectedDepartmentType?: DepartmentTypeDto
  refetch: () => void
}

function DeleteDepartmentTypeAlert(props: DeleteDepartmentTypeAlertProps) {
  const { isOpen, onOpenChange, selectedDepartmentType, refetch } = props
  const { mutateAsync: del, isPending } = DepartmentTypeHook.useDelete()

  const handleDelete = async () => {
    if (!selectedDepartmentType) return

    await del(selectedDepartmentType.id)
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
                Xóa loại phòng ban {selectedDepartmentType?.name}?
              </AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>
              <p>
                Bạn chắc chắn muốn xóa loại phòng ban{' '}
                <strong className={'text-danger'}>
                  {selectedDepartmentType?.name}
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

export default DeleteDepartmentTypeAlert
