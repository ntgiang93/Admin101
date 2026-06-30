import IconButton from '@/components/ui/button/IconButton'
import ClientTable from '@/components/ui/data-table/DataTable'
import { SearchInput } from '@/components/ui/input/SearchInput'
import { useAuth } from '@/components/ui/layout/AuthProvider'
import { JobScheduleHook } from '@/hooks/sys/jobSchedule'
import { EPermission } from '@/types/base/Permission'
import { SysModule } from '@/types/constant/SysModule.ts'
import { type JobScheduleDto } from '@/types/sys/JobConfiguration'
import { Button, Card, Tooltip } from '@heroui/react'
import {
    Delete02Icon,
    Edit01Icon,
    PauseIcon,
    PlayIcon,
    Plus,
    Refresh,
    ReplayIcon
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { createFileRoute } from '@tanstack/react-router'
import { type ColumnDef } from '@tanstack/react-table'
import dayjs from 'dayjs'
import { useMemo, useState } from 'react'
import DeleteJobScheduleAlert from './components/DeleteJobScheduleAlert'
import DetailModal from './components/DetailModal'
import PauseJobAlert from './components/PauseJobAlert'
import ResumeJobAlert from './components/ResumeJobAlert'
import TriggerJobAlert from './components/TriggerJobAlert'

export const Route = createFileRoute('/(app)/sys/job-schedule/')({
  component: JobSchedulePage,
})

function JobSchedulePage() {
  const { data: jobs, refetch, isFetching } = JobScheduleHook.useGetAll()
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isTriggerOpen, setIsTriggerOpen] = useState(false)
  const [isPauseOpen, setIsPauseOpen] = useState(false)
  const [isResumeOpen, setIsResumeOpen] = useState(false)
  const [selectedJob, setSelectedJob] = useState<JobScheduleDto | undefined>(
    undefined,
  )
  const [searchValue, setSearchValue] = useState('')
  const { hasPermission } = useAuth()
  const canCreate = hasPermission(SysModule.JobScheduler, EPermission.Create)
  const canEdit = hasPermission(SysModule.JobScheduler, EPermission.Edit)
  const canDelete = hasPermission(SysModule.JobScheduler, EPermission.Delete)

  const columns = useMemo<ColumnDef<JobScheduleDto>[]>(
    () => [
      {
        id: 'jobName',
        accessorKey: 'jobName',
        header: () => 'Tên công việc',
        footer: (props) => props.column.id,
        meta: {
          pinned: 'left',
          minWidth: 250,
        },
      },
      {
        id: 'jobGroup',
        accessorKey: 'jobGroup',
        header: () => 'Nhóm công việc',
        footer: (props) => props.column.id,
        meta: {
          width: 200,
        },
      },
      {
        id: 'jobType',
        accessorKey: 'jobType',
        header: () => 'Loại công việc',
        footer: (props) => props.column.id,
        meta: {
          minWidth: 250,
        },
      },
      {
        id: 'cronExpression',
        accessorKey: 'cronExpression',
        header: () => 'Biểu thức cron',
        footer: (props) => props.column.id,
        meta: {
          width: 150,
        },
      },
      {
        id: 'triggerState',
        accessorKey: 'triggerState',
        header: () => 'Trạng thái',
        footer: (props) => props.column.id,
        meta: {
          align: 'center',
          width: 150,
        },
      },
      {
        id: 'nextFireTime',
        accessorKey: 'nextFireTime',
        header: () => 'Thời gian thực thi tiếp theo',
        footer: (props) => props.column.id,
        meta: {
          align: 'center',
          width: 300,
        },
        cell: ({ cell }) => {
          const value = cell.getValue() as
            | string
            | number
            | Date
            | null
            | undefined
          return (
            <span>
              {value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : ''}
            </span>
          )
        },
      },
      {
        id: 'previousFireTime',
        accessorKey: 'previousFireTime',
        header: () => 'Thời gian thực thi trước',
        footer: (props) => props.column.id,
        cell: ({ cell }) => {
          const value = cell.getValue() as
            | string
            | number
            | Date
            | null
            | undefined
          return (
            <span>
              {value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : ''}
            </span>
          )
        },
        meta: {
          width: 300,
        },
      },
      {
        id: 'actions',
        accessorKey: 'actions',
        header: 'Thao tác',
        footer: (props) => props.column.id,
        meta: {
          align: 'center',
          pinned: 'right',
          width: 100,
        },
        cell: ({ row }) => {
          return (
            <div className="relative flex items-center gap-2">
              {canEdit && row.original.triggerState != 'Normal' && (
                <IconButton
                  icon={Edit01Icon}
                  tooltip="Chỉnh sửa"
                  onPress={() => {
                    if (!canEdit) return
                    setSelectedJob(row.original)
                    setIsDetailOpen(true)
                  }}
                />
              )}
              {canEdit && row.original.triggerState === 'None' && (
                <IconButton
                  icon={PlayIcon}
                  tooltip="Bắt đầu công việc"
                  color="success"
                  onPress={() => {
                    if (!canEdit) return
                    setSelectedJob(row.original)
                    setIsTriggerOpen(true)
                  }}
                />
              )}
              {canEdit && row.original.triggerState === 'Normal' && (
                <IconButton
                  icon={PauseIcon}
                  tooltip="Tạm dừng công việc"
                  color="warning"
                  onPress={() => {
                    if (!canEdit) return
                    setSelectedJob(row.original)
                    setIsPauseOpen(true)
                  }}
                />
              )}
              {canEdit && row.original.triggerState === 'Paused' && (
                <IconButton
                  icon={ReplayIcon}
                  tooltip="Tiếp tục công việc"
                  onPress={() => {
                    if (!canEdit) return
                    setSelectedJob(row.original)
                    setIsResumeOpen(true)
                  }}
                />
              )}
              {canDelete && row.original.triggerState != 'Normal' && (
                <IconButton
                  icon={Delete02Icon}
                  tooltip="Xóa"
                  color="danger"
                  onPress={() => {
                    setSelectedJob(row.original)
                    setIsDeleteOpen(true)
                  }}
                />
              )}
            </div>
          )
        },
      },
    ],
    [canDelete, canEdit],
  )

  const filteredData = useMemo(() => {
    if (!jobs) return []

    if (searchValue && searchValue.length > 0) {
      const searchValueLower = searchValue.toLowerCase()
      return jobs.filter(
        (r) =>
          r.jobName.toLowerCase().includes(searchValueLower) ||
          r.description?.toLowerCase().includes(searchValueLower),
      )
    }

    return jobs
  }, [searchValue, jobs])

  return (
    <Card className="h-full flex flex-col">
      <Card.Header>
        <Card.Title>Lịch trình công việc</Card.Title>
        <div className="flex justify-between items-center my-1">
          <SearchInput
            value={searchValue}
            onValueChange={(value) => setSearchValue(value)}
          />
          <div className="flex gap-2">
            <Tooltip delay={0}>
              <Button
                hidden={!canCreate}
                isIconOnly
                onPress={() => {
                  if (!canCreate) return
                  setSelectedJob(undefined)
                  setIsDetailOpen(true)
                }}
              >
                <HugeiconsIcon icon={Plus}></HugeiconsIcon>
              </Button>
              <Tooltip.Content>
                <p>Thêm mới</p>
              </Tooltip.Content>
            </Tooltip>
            <Tooltip delay={0}>
              <Button isIconOnly variant="secondary" onPress={() => refetch()}>
                <HugeiconsIcon icon={Refresh}></HugeiconsIcon>
              </Button>
              <Tooltip.Content>
                <p>Tải lại dữ liệu</p>
              </Tooltip.Content>
            </Tooltip>
          </div>
        </div>
      </Card.Header>
      <Card.Content className="flex-1 min-h-0">
        <ClientTable
          columns={columns}
          data={filteredData}
          isLoading={isFetching}
        />
      </Card.Content>
      <Card.Footer />
      <DetailModal
        id={selectedJob?.id || 0}
        isOpen={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onRefresh={refetch}
      />
      <DeleteJobScheduleAlert
        isOpen={isDeleteOpen}
        onOpenChange={(open) => {
          setIsDeleteOpen(open)
          if (!open) setSelectedJob(undefined)
        }}
        selectedJobSchedule={selectedJob}
        refetch={refetch}
      />
      <TriggerJobAlert
        isOpen={isTriggerOpen}
        onOpenChange={(open) => {
          setIsTriggerOpen(open)
          if (!open) setSelectedJob(undefined)
        }}
        selectedJob={selectedJob}
        refetch={refetch}
      />
      <PauseJobAlert
        isOpen={isPauseOpen}
        onOpenChange={(open) => {
          setIsPauseOpen(open)
          if (!open) setSelectedJob(undefined)
        }}
        selectedJob={selectedJob}
        refetch={refetch}
      />
      <ResumeJobAlert
        isOpen={isResumeOpen}
        onOpenChange={(open) => {
          setIsResumeOpen(open)
          if (!open) setSelectedJob(undefined)
        }}
        selectedJob={selectedJob}
        refetch={refetch}
      />
    </Card>
  )
}
