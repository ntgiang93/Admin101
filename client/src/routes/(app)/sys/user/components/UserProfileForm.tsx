import GenderSelect from '@/components/shared/app/select/GenderSelect.tsx'
import JobTitleSelect from '@/components/shared/app/select/JobTitleSelect.tsx'
import { UserProfileHook } from '@/hooks/sys/userProfile.ts'
import {
  defaultUserProfileDto,
  type UserProfileDto,
} from '@/types/sys/UserProfile.ts'
import {
  Button,
  Calendar,
  DateField,
  DatePicker,
  FieldError,
  Form,
  Input,
  Label,
  Spinner,
  TextField,
} from '@heroui/react'
import { parseDate, type DateValue } from '@internationalized/date'
import { useEffect, useState } from 'react'

interface UserProfileFormProps {
  id: string
}

export default function UserProfileForm(props: UserProfileFormProps) {
  const { id } = props
  const [form, setForm] = useState<UserProfileDto>({ ...defaultUserProfileDto })
  const [dateOfBirth, setDateOfBirth] = useState<DateValue | null>(null)
  const { data, isFetching, refetch } = UserProfileHook.useGetUserProfile(id)
  const { mutateAsync: save, isPending } = UserProfileHook.useSave()

  const onSubmit = async (e: any) => {
    e.preventDefault()
    const response = await save({ ...form, id })
    if (response && response.success) {
      refetch()
    }
  }

  useEffect(() => {
    if (data) {
      setForm({ ...data })
      setDateOfBirth(data.dateOfBirth ? parseDate(data.dateOfBirth) : null)
    } else {
      setForm({ ...defaultUserProfileDto })
      setDateOfBirth(null)
    }
  }, [data])

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col">
      <Form
        className="w-full flex-1 p-4"
        onSubmit={onSubmit}
        id="user-profile-form"
      >
        <div className="flex flex-col gap-4 w-full">
          <TextField
            className="w-full"
            name="address"
            variant={'secondary'}
            value={form.address || ''}
            onChange={(value) =>
              setForm((prev) => ({ ...prev, address: value }))
            }
          >
            <Label>Địa chỉ</Label>
            <Input placeholder="Nhập địa chỉ" />
            <FieldError />
          </TextField>
          <div className="grid grid-cols-2 gap-4">
            <DatePicker
              className="w-64"
              name="dateofbirth"
              value={dateOfBirth || undefined}
              onChange={setDateOfBirth}
            >
              <Label>Ngày sinh</Label>
              <DateField.Group fullWidth>
                <DateField.Input>
                  {(segment) => <DateField.Segment segment={segment} />}
                </DateField.Input>
                <DateField.Suffix>
                  <DatePicker.Trigger>
                    <DatePicker.TriggerIndicator />
                  </DatePicker.Trigger>
                </DateField.Suffix>
              </DateField.Group>
              <DatePicker.Popover>
                <Calendar aria-label="Event date">
                  <Calendar.Header>
                    <Calendar.YearPickerTrigger>
                      <Calendar.YearPickerTriggerHeading />
                      <Calendar.YearPickerTriggerIndicator />
                    </Calendar.YearPickerTrigger>
                    <Calendar.NavButton slot="previous" />
                    <Calendar.NavButton slot="next" />
                  </Calendar.Header>
                  <Calendar.Grid>
                    <Calendar.GridHeader>
                      {(day) => (
                        <Calendar.HeaderCell>{day}</Calendar.HeaderCell>
                      )}
                    </Calendar.GridHeader>
                    <Calendar.GridBody>
                      {(date) => <Calendar.Cell date={date} />}
                    </Calendar.GridBody>
                  </Calendar.Grid>
                  <Calendar.YearPickerGrid>
                    <Calendar.YearPickerGridBody>
                      {({ year }) => <Calendar.YearPickerCell year={year} />}
                    </Calendar.YearPickerGridBody>
                  </Calendar.YearPickerGrid>
                </Calendar>
              </DatePicker.Popover>
            </DatePicker>
            <GenderSelect
              value={form.gender}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, gender: value }))
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <JobTitleSelect
              value={
                form.jobTitleId && form.jobTitleId > 0
                  ? form.jobTitleId
                  : undefined
              }
              onChange={(value) =>
                setForm((prev) => ({ ...prev, jobTitleId: value as number }))
              }
              selectionMode={'single'}
            />
            <TextField
              className="flex-1"
              name="department"
              value={form.departmentName || ''}
              isDisabled
            >
              <Label>Phòng ban</Label>
              <Input placeholder="Phòng ban" />
              <FieldError />
            </TextField>
          </div>
        </div>
      </Form>
      <div className="flex gap-4 justify-end p-4 border-t border-default">
        <Button type="submit" form="user-profile-form" isPending={isPending}>
          {({ isPending }) => {
            if (isPending)
              return (
                <>
                  <Spinner />
                  <span>Đang lưu</span>
                </>
              )
            else return <span>Lưu</span>
          }}
        </Button>
      </div>
    </div>
  )
}
