import { AlertDialog, Button, Spinner } from '@heroui/react'
import { JobTitleHook } from '@/hooks/orgazination/jobTitle'
import type { JobTitleDto } from '@/types/sys/JobTitle'

interface DeleteJobTitleAlertProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  selectedJobTitle?: JobTitleDto
  refetch: () => void
}

function DeleteJobTitleAlert(props: DeleteJobTitleAlertProps) {
  const { isOpen, onOpenChange, selectedJobTitle, refetch } = props
  const { mutateAsync: del, isPending } = JobTitleHook.useDelete()

  const handleDelete = async () => {
    if (!selectedJobTitle) return

    await del(selectedJobTitle.id)
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
                Xóa chức danh {selectedJobTitle?.name}?
              </AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>
              <p>
                Bạn chắc chắn muốn xóa chức danh{' '}
                <strong className={'text-danger'}>
                  {selectedJobTitle?.name}
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

export default DeleteJobTitleAlert
