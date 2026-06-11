import { AlertDialog, Button, Spinner } from '@heroui/react'
import { JobScheduleHook } from '@/hooks/sys/jobSchedule'
import type { JobScheduleDto } from '@/types/sys/JobConfiguration'

interface ResumeJobAlertProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  selectedJob?: JobScheduleDto
  refetch: () => void
}

function ResumeJobAlert(props: ResumeJobAlertProps) {
  const { isOpen, onOpenChange, selectedJob, refetch } = props
  const { mutateAsync: resume, isPending } = JobScheduleHook.useResume()

  const handleResume = async () => {
    if (!selectedJob) return

    const success = await resume(selectedJob.jobName)
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
              <AlertDialog.Icon status="accent" />
              <AlertDialog.Heading>
                Tiếp tục công việc {selectedJob?.jobName}?
              </AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>
              <p>
                Bạn chắc chắn muốn tiếp tục công việc{' '}
                <strong className={'text-primary'}>
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
                onPress={() => handleResume()}
                isPending={isPending}
              >
                {({ isPending }) => (
                  <>
                    {isPending ? <Spinner color="current" size="sm" /> : null}
                    Tiếp tục
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

export default ResumeJobAlert
