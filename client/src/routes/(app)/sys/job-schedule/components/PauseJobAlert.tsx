import { AlertDialog, Button, Spinner } from '@heroui/react'
import { JobScheduleHook } from '@/hooks/sys/jobSchedule'
import type { JobScheduleDto } from '@/types/sys/JobConfiguration'

interface PauseJobAlertProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  selectedJob?: JobScheduleDto
  refetch: () => void
}

function PauseJobAlert(props: PauseJobAlertProps) {
  const { isOpen, onOpenChange, selectedJob, refetch } = props
  const { mutateAsync: pause, isPending } = JobScheduleHook.usePause()

  const handlePause = async () => {
    if (!selectedJob) return

    const success = await pause(selectedJob.jobName)
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
              <AlertDialog.Icon status="warning" />
              <AlertDialog.Heading>
                Tạm dừng công việc {selectedJob?.jobName}?
              </AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>
              <p>
                Bạn chắc chắn muốn tạm dừng công việc{' '}
                <strong className={'text-warning'}>
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
                onPress={() => handlePause()}
                isPending={isPending}
              >
                {({ isPending }) => (
                  <>
                    {isPending ? <Spinner color="current" size="sm" /> : null}
                    Tạm dừng
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

export default PauseJobAlert
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/(app)/sys/job-schedule/components/PauseJobAlert',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(app)/sys/job-schedule/components/PauseJobAlert"!</div>
}
