import { AlertDialog, Button, Spinner } from '@heroui/react'
import { SysCategoryHook } from '@/hooks/sys/sysCategories'
import type { CategoryDto } from '@/types/sys/SysCategory'
import { useEffect } from 'react'

interface DeleteCategoryAlertProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  selectedCategory?: CategoryDto
  refetch: () => void
  resetSelected: () => void
}

function DeleteCategoryAlert(props: DeleteCategoryAlertProps) {
  const { isOpen, onOpenChange, selectedCategory, refetch, resetSelected } =
    props
  const { mutateAsync: del, isPending } = SysCategoryHook.useDelete()

  const handleDelete = async () => {
    if (!selectedCategory) return

    await del({ id: selectedCategory.id, type: selectedCategory.type })
    refetch()
    resetSelected()
    onOpenChange(false)
  }

  useEffect(() => {
    console.log(selectedCategory)
  }, [selectedCategory])

  return (
    <AlertDialog isOpen={isOpen} onOpenChange={onOpenChange}>
      <AlertDialog.Backdrop>
        <AlertDialog.Container>
          <AlertDialog.Dialog className="sm:max-w-100">
            <AlertDialog.CloseTrigger />
            <AlertDialog.Header>
              <AlertDialog.Icon status="danger" />
              <AlertDialog.Heading>
                Xóa danh mục {selectedCategory?.name}?
              </AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>
              <p>
                Bạn chắc chắn muốn xóa danh mục{' '}
                <strong className={'text-danger'}>
                  {selectedCategory?.name}
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

export default DeleteCategoryAlert
