import { DepartmentTypeHook } from '@/hooks/orgazination/departmentType'
import {
  defaultDepartmentTypeDto,
  type DepartmentTypeDto,
} from '@/types/sys/DepartmentType'
import {
  Button,
  FieldError,
  Form,
  Input,
  Label,
  Modal,
  NumberField,
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

export default function DetailModal(props: DetailProps) {
  const { isOpen, onOpenChange, id, onRefresh, onResetSelected } = props
  const [form, setForm] = useState<DepartmentTypeDto>({
    ...defaultDepartmentTypeDto,
  })
  const { data, isFetching } = DepartmentTypeHook.useGet(isOpen ? id : 0)
  const { mutateAsync: save, isPending } = DepartmentTypeHook.useSave()

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
      setForm({ ...defaultDepartmentTypeDto })
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
              <Modal.Heading>
                {id > 0 ? 'Sửa' : 'Thêm'} loại phòng ban
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              {isFetching && <Spinner />}
              {!isFetching && (
                <Form
                  id="departmentTypeForm"
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
                    <Input autoFocus placeholder="Nhập tên loại phòng ban" />
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
                    <Input placeholder="Nhập mã loại phòng ban" />
                    <FieldError />
                  </TextField>
                  <NumberField
                    value={form.level}
                    formatOptions={{
                      maximumFractionDigits: 0,
                      minimumFractionDigits: 0,
                      style: 'decimal',
                    }}
                    minValue={0}
                    maxValue={10}
                    name="level"
                    variant="secondary"
                    onChange={(value) =>
                      setForm((prev) => ({ ...prev, level: value }))
                    }
                  >
                    <Label>Cấp bậc</Label>
                    <NumberField.Group>
                      <NumberField.DecrementButton />
                      <NumberField.Input
                        placeholder={'Nhập cấp bậc'}
                        className="w-full"
                      />
                      <NumberField.IncrementButton />
                    </NumberField.Group>
                  </NumberField>
                  <TextField
                    name="description"
                    variant={'secondary'}
                    value={form.description}
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
              <Button
                type="submit"
                form="departmentTypeForm"
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
