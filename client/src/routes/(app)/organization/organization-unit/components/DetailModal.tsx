
import {
  defaultDetailOrganizationUnitDto,
  type OrganizationUnitDto,
  type DetailOrganizationUnitDto,
} from '@/types/sys/OrganizationUnit'
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
import { useEffect, useMemo, useState } from 'react'
import {OrganizationUnitHook} from "@/hooks/orgazination/department.ts";
import {useTranslation} from "react-i18next";
import OrganizationUnitSelect from "@/components/shared/app/select/OrganizationUnitSelect.tsx";
import OrganizationLevelSelect from "@/components/shared/app/select/OrganizationLevelSelect.tsx";
import UserSelect from "@/components/shared/app/select/UserSelect.tsx";

interface DetailProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  id: number
  onRefresh: () => void
  onResetSelected: () => void
  parent?: OrganizationUnitDto
}

export default function DetailModal(props: DetailProps) {
  const { isOpen, onOpenChange, id, onRefresh, onResetSelected, parent } = props
  const [form, setForm] = useState<DetailOrganizationUnitDto>({
    ...defaultDetailOrganizationUnitDto,
  })
  const { data, isFetching } = OrganizationUnitHook.useGet(isOpen ? id : 0)
  const { mutateAsync: save, isPending } = OrganizationUnitHook.useSave()
  const { data: allOrganizationUnits } = OrganizationUnitHook.useGetAll()
  const {t} = useTranslation();
  const parentLevel = useMemo(() => {
    if (!allOrganizationUnits || !form.parentId) return undefined

    const findInTree = (
      items: OrganizationUnitDto[],
      id: number,
    ): OrganizationUnitDto | undefined => {
      for (const item of items) {
        if (item.id === id) return item
        if (item.children && item.children.length > 0) {
          const found = findInTree(item.children, id)
          if (found) return found
        }
      }
      return undefined
    }
    return findInTree(allOrganizationUnits, form.parentId)?.organizationLevelName
  }, [allOrganizationUnits, form.parentId])

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const response = await save(form)
    if (response && response.success) {
      onOpenChange(false)
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
      setForm((prev) => ({ ...prev, ...defaultDetailOrganizationUnitDto }))
      onResetSelected()
    }
  }, [isOpen])

  useEffect(() => {
    if (id > 0) return
    if (parent && parent.id) {
      setForm((prev) => ({ ...prev, parentId: parent.id }))
    }
  }, [parent, id])

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Backdrop>
        <Modal.Container size={"lg"}>
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>{`${id > 0 ? t('edit') : t('create')} ${t('organization_unit')}`}</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              {isFetching && <Spinner />}
              {!isFetching && (
                <Form
                  id="detailForm"
                  onSubmit={onSubmit}
                  className={'flex flex-col gap-3 p-0.5'}
                >
                  <TextField
                    isRequired
                    name="name"
                    variant={'secondary'}
                    value={form.name}
                    onChange={(value) => setForm({ ...form, name: value })}
                    validate={(value) => {
                      return value === '' || !value
                        ? t('msg.required_field')
                        : null
                    }}
                  >
                    <Label>{t('name')}</Label>
                    <Input autoFocus placeholder={t('placeholder_input', {field: t('name')})} />
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
                        ? t('msg.required_field')
                        : null
                    }}
                  >
                    <Label>{t('code')}</Label>
                    <Input placeholder={t('placeholder_input', {field: t('code')})} />
                    <FieldError />
                  </TextField>
                  <OrganizationLevelSelect
                      value={form.organizationLevelId}
                      onChange={(value) => {
                        setForm((prev) => ({
                          ...prev,
                          organizationLevelId: value as number,
                        }))
                      }}
                      validate={(value) => {
                        return value === '' || !value
                            ? t('msg.required_field')
                            : null
                      }}
                      isRequired
                      parentLevel={0}
                  />
                  <OrganizationUnitSelect
                      values={form.parentId ?? 0}
                      onChange={(values) => {
                        setForm((prev) => ({
                          ...prev,
                          parentId: values as number,
                        }))
                      }}
                      anyLevel
                  />
                  <UserSelect 
                      label={t('unit_head')}
                      selectionMode={'single'}
                      value={form.headId} 
                              onChange={(values) => {
                    setForm((prev) => ({
                      ...prev,
                      headId: values as string,
                    }))
                  }}/>
                  <TextField
                    name="description"
                    value={form.description}
                    variant={'secondary'}
                    onChange={(value) =>
                      setForm((prev) => ({ ...prev, description: value }))
                    }
                  >
                    <Label>{t('description')}</Label>
                    <Input placeholder={t('placeholder_input', {field: t('description')})} />
                    <FieldError />
                  </TextField>

                  <TextField
                    name="address"
                    value={form.address}
                    variant={'secondary'}
                    onChange={(value) =>
                      setForm((prev) => ({ ...prev, address: value }))
                    }
                  >
                    <Label>{t('address')}</Label>
                    <Input placeholder={t('placeholder_input', {field: t('address')})} />
                    <FieldError />
                  </TextField>

                  {form.treePath && (
                    <TextField
                      name="treePath"
                      value={form.treePath}
                      isDisabled
                      variant={'secondary'}
                    >
                      <Label>Đường dẫn</Label>
                      <Input />
                      <FieldError />
                    </TextField>
                  )}
                </Form>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button slot="close" variant="tertiary">
                Đóng
              </Button>
              <Button type="submit" form="detailForm" isPending={isPending}>
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
