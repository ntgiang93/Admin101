import { SearchableSelectBox } from '@/components/ui/input/SearchableSelectBox'
import { JobScheduleHook } from '@/hooks/sys/jobSchedule'
import {
  defaultJobConfiguration,
  type DetailJobConfigurationDto,
} from '@/types/sys/JobConfiguration'
import {
  Button,
  FieldError,
  Form,
  Input,
  Label,
  Link,
  Modal,
  Spinner,
  TextField,
} from '@heroui/react'
import { useEffect, useMemo, useState } from 'react'

interface JobScheduleModalProps {
  id: number
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onRefresh: () => void
}

export default function DetailModal(props: JobScheduleModalProps) {
  const { id, isOpen, onOpenChange, onRefresh } = props
  const [form, setForm] = useState<DetailJobConfigurationDto>({
    ...defaultJobConfiguration,
  })
  const [searchValue, setSearchValue] = useState('')
  const { data: types, isFetching: isFetchingTypes } =
    JobScheduleHook.useGetType()
  const { data: jobSchedule, isFetching } = JobScheduleHook.useGet(
    isOpen ? id : 0,
  )
  const { mutateAsync: save, isPending } = JobScheduleHook.useSave()

  const jobTypeItems = useMemo(() => {
    if (!types) return []

    const allItems = types.map((type) => ({
      value: type.key,
      label: type.label,
    }))

    // Filter by search value
    if (searchValue) {
      return allItems.filter((item) =>
        item.label.toLowerCase().includes(searchValue.toLowerCase()),
      )
    }

    return allItems
  }, [types, searchValue])

  const onSubmit = async (e: any) => {
    e.preventDefault()
    const success = await save(form)
    if (success) {
      onOpenChange(!isOpen)
      onRefresh()
    }
  }

  const isEdit = useMemo(() => {
    return jobSchedule && jobSchedule.id > 0
  }, [jobSchedule])

  useEffect(() => {
    if (jobSchedule) {
      setForm({ ...jobSchedule })
    }
  }, [jobSchedule])

  useEffect(() => {
    if (!isOpen) {
      setForm({ ...defaultJobConfiguration })
    }
  }, [isOpen])

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-2xl">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>
                {jobSchedule?.id && jobSchedule.id > 0
                  ? 'Chỉnh sửa lịch trình'
                  : 'Thêm lịch trình'}
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              {isFetching && <Spinner />}
              {!isFetching && (
                <Form
                  id="jobScheduleForm"
                  onSubmit={onSubmit}
                  className={'flex flex-col gap-3 p-0.5'}
                >
                  <TextField
                    isRequired
                    name="jobName"
                    value={form.jobName}
                    onChange={(value) =>
                      setForm((prev) => ({ ...prev, jobName: value }))
                    }
                    validate={(value) => {
                      return !value || value.trim() === ''
                        ? 'Trường này là bắt buộc'
                        : null
                    }}
                    isDisabled={isEdit}
                  >
                    <Label>Tên công việc</Label>
                    <Input autoFocus placeholder="Nhập tên công việc" />
                    <FieldError />
                  </TextField>

                  <TextField
                    isRequired
                    name="jobGroup"
                    value={form.jobGroup}
                    onChange={(value) =>
                      setForm((prev) => ({ ...prev, jobGroup: value }))
                    }
                    validate={(value) => {
                      return !value || value.trim() === ''
                        ? 'Trường này là bắt buộc'
                        : null
                    }}
                    isDisabled={isEdit}
                  >
                    <Label>Nhóm công việc</Label>
                    <Input placeholder="Nhập nhóm công việc" />
                    <FieldError />
                  </TextField>

                  {isFetchingTypes ? (
                    <div className="flex items-center gap-2 p-2">
                      <Spinner size="sm" />
                      <span className="text-sm">
                        Đang tải loại công việc...
                      </span>
                    </div>
                  ) : (
                    <SearchableSelectBox
                      items={jobTypeItems}
                      searchValue={searchValue}
                      onSearchValueChange={setSearchValue}
                      value={form.jobType || ''}
                      onChange={(value) =>
                        setForm((prev) => ({
                          ...prev,
                          jobType: value as string,
                        }))
                      }
                      selectionMode="single"
                      label="Loại công việc"
                      placeholder="Chọn loại công việc"
                      required={true}
                      disabled={isEdit}
                      validate={(value) => {
                        if (
                          !value ||
                          (typeof value === 'string' && value.trim() === '')
                        ) {
                          return 'Trường này là bắt buộc'
                        }
                        return null
                      }}
                    />
                  )}

                  <TextField
                    isRequired
                    name="cronExpression"
                    value={form.cronExpression}
                    onChange={(value) =>
                      setForm((prev) => ({ ...prev, cronExpression: value }))
                    }
                    validate={(value) => {
                      if (!value || value.trim() === '')
                        return 'Trường này là bắt buộc'
                      const parts = value.trim().split(/\s+/)
                      if (parts.length < 6 || parts.length > 7) {
                        return 'Biểu thức cron không hợp lệ (cần 6-7 phần)'
                      }
                      return null
                    }}
                  >
                    <Label>Biểu thức cron</Label>
                    <Input placeholder="0 0 12 * * ?" />
                    <FieldError />
                    <div className="flex justify-between text-xs text-foreground-secondary mt-1">
                      <span>Định dạng: giây phút giờ ngày tháng thứ [năm]</span>
                      <Link
                        href="https://crontab.cronhub.io/"
                        target="_blank"
                        className="text-xs"
                      >
                        Tạo biểu thức →
                      </Link>
                    </div>
                  </TextField>

                  <TextField
                    name="jobDataJson"
                    value={form.jobDataJson}
                    onChange={(value) =>
                      setForm((prev) => ({ ...prev, jobDataJson: value }))
                    }
                    validate={(value) => {
                      if (!value) return null
                      try {
                        JSON.parse(value)
                        return null
                      } catch (e) {
                        return 'JSON không hợp lệ'
                      }
                    }}
                  >
                    <Label>Dữ liệu công việc (JSON)</Label>
                    <Input placeholder='{"key": "value"}' />
                    <FieldError />
                    <span className="text-xs text-foreground-secondary mt-1">
                      Dữ liệu JSON sẽ được truyền vào job khi thực thi
                    </span>
                  </TextField>

                  <TextField
                    name="description"
                    value={form.description}
                    onChange={(value) =>
                      setForm((prev) => ({ ...prev, description: value }))
                    }
                  >
                    <Label>Mô tả</Label>
                    <Input placeholder="Nhập mô tả công việc" />
                    <FieldError />
                  </TextField>
                </Form>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button slot="close" variant="tertiary">
                Đóng
              </Button>
              <Button
                type="submit"
                form="jobScheduleForm"
                isPending={isPending}
              >
                {({ isPending }) => (
                  <>
                    {isPending ? <Spinner color="current" size="sm" /> : null}
                    Lưu
                  </>
                )}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  )
}
