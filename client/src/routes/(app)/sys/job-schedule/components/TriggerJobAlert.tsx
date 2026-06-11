import { AlertDialog, Button, Spinner } from '@heroui/react'
import { JobScheduleHook } from '@/hooks/sys/jobSchedule'
import type { JobScheduleDto } from '@/types/sys/JobConfiguration'

interface TriggerJobAlertProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  selectedJob?: JobScheduleDto
  refetch: () => void
}

function TriggerJobAlert(props: TriggerJobAlertProps) {
  const { isOpen, onOpenChange, selectedJob, refetch } = props
  const { mutateAsync: trigger, isPending } = JobScheduleHook.useTrigger()

  const handleTrigger = async () => {
    if (!selectedJob) return

    const success = await trigger(selectedJob.jobName)
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
              <AlertDialog.Icon status="success" />
              <AlertDialog.Heading>
                Bắt đầu công việc {selectedJob?.jobName}?
              </AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>
              <p>
                Bạn chắc chắn muốn bắt đầu công việc{' '}
                <strong className={'text-success'}>
                  {selectedJob?.jobName}
                </strong>
                ?
              </p>
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <Button slot="close" variant="tertiary">
                Hủy bỏ
              </Button>
              <Button
                slot="close"
                variant="primary"
                onPress={() => handleTrigger()}
                isPending={isPending}
              >
                {({ isPending }) => (
                  <>
                    {isPending ? <Spinner color="current" size="sm" /> : null}
                    Bắt đầu
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

export default TriggerJobAlert
