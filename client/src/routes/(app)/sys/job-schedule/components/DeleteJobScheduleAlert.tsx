import { AlertDialog, Button, Spinner } from '@heroui/react'
import { JobScheduleHook } from '@/hooks/sys/jobSchedule'
import type { JobScheduleDto } from '@/types/sys/JobConfiguration.ts'

interface DeleteJobScheduleAlertProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  selectedJobSchedule?: JobScheduleDto
  refetch: () => void
}

function DeleteJobScheduleAlert(props: DeleteJobScheduleAlertProps) {
  const { isOpen, onOpenChange, selectedJobSchedule, refetch } = props
  const { mutateAsync: del, isPending } = JobScheduleHook.useDelete()

  const handleDelete = async () => {
    if (!selectedJobSchedule) return

    await del(selectedJobSchedule.id)
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
                Xóa lịch trình {selectedJobSchedule?.jobName}?
              </AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>
              <p>
                Bạn chắc chắn muốn xóa lịch trình{' '}
                <strong className={'text-danger'}>
                  {selectedJobSchedule?.jobName}
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

export default DeleteJobScheduleAlert
