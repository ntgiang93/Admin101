import { JobTitleHook } from '@/hooks/orgazination/jobTitle'
import { defaultJobTitleDto, type JobTitleDto } from '@/types/sys/JobTitle'
import {
  Button,
  FieldError,
  Form,
  Input,
  Label,
  Modal,
  Spinner,
  TextField,
} from '@heroui/react'
import { useEffect, useState } from 'react'

interface DetailProps {
  isOpen: boolean
  onOpenChange: () => void
  id: number
  onRefresh: () => void
  onResetSelected: () => void
}

function DetailModal(props: DetailProps) {
  const { isOpen, onOpenChange, id, onRefresh, onResetSelected } = props
  const [form, setForm] = useState<JobTitleDto>({ ...defaultJobTitleDto })
  const { data, isFetching } = JobTitleHook.useGet(isOpen ? id : 0)
  const { mutateAsync: save, isPending } = JobTitleHook.useSave()

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const response = await save(form)
    if (response && response.success) {
      onOpenChange()
      onRefresh()
    }
  }

  useEffect(() => {
    if (data) {
      setForm({
        ...data,
      })
    }
  }, [data])

  useEffect(() => {
    if (!isOpen) {
      setForm({ ...defaultJobTitleDto })
      onResetSelected()
    }
  }, [isOpen])

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>{id > 0 ? 'Sửa' : 'Thêm'} chức danh</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              {isFetching && <Spinner />}
              {!isFetching && (
                <Form
                  id="jobTitleForm"
                  onSubmit={onSubmit}
                  className={'flex flex-col gap-3 p-0.5'}
                >
                  <TextField
                    isRequired
                    name="name"
                    variant={'secondary'}
                    value={form.name}
                    onChange={(value) =>
                      setForm((prev) => ({ ...prev, name: value }))
                    }
                    validate={(value) => {
                      return value === '' || !value
                        ? 'Trường này là bắt buộc'
                        : null
                    }}
                  >
                    <Label>Tên</Label>
                    <Input autoFocus placeholder="Nhập tên chức danh" />
                    <FieldError />
                  </TextField>

                  <TextField
                    isRequired
                    name="code"
                    variant={'secondary'}
                    value={form.code}
                    onChange={(value) =>
                      setForm((prev) => ({ ...prev, code: value }))
                    }
                    validate={(value) => {
                      return value === '' || !value
                        ? 'Trường này là bắt buộc'
                        : null
                    }}
                  >
                    <Label>Mã</Label>
                    <Input placeholder="Nhập mã chức danh" />
                    <FieldError />
                  </TextField>

                  <TextField
                    name="description"
                    value={form.description}
                    variant={'secondary'}
                    onChange={(value) =>
                      setForm((prev) => ({ ...prev, description: value }))
                    }
                  >
                    <Label>Mô tả</Label>
                    <Input placeholder="Nhập mô tả" />
                    <FieldError />
                  </TextField>
                </Form>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button slot="close" variant="tertiary">
                Đóng
              </Button>
              <Button type="submit" form="jobTitleForm" isPending={isPending}>
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

export default DetailModal
