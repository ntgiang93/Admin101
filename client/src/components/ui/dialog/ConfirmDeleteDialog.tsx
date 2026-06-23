import { AlertDialog, Button, Spinner } from '@heroui/react'
import {Trans, useTranslation} from "react-i18next";

interface DeleteConfirmModalProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    itemName?: string
    isPending: boolean
    onDelete: () => void
}

function ConfirmDeleteDialog(props: DeleteConfirmModalProps) {
    const { isOpen, onOpenChange, itemName, isPending, onDelete } = props
    const {t} = useTranslation()

    return (
        <AlertDialog isOpen={isOpen} onOpenChange={onOpenChange}>
            <AlertDialog.Backdrop>
                <AlertDialog.Container>
                    <AlertDialog.Dialog className="sm:max-w-100">
                        <AlertDialog.CloseTrigger />
                        <AlertDialog.Header>
                            <AlertDialog.Icon status="danger" />
                            <AlertDialog.Heading>
                                {t('del_title')}
                            </AlertDialog.Heading>
                        </AlertDialog.Header>
                        <AlertDialog.Body>
                            <p>
                                <Trans
                                    i18nKey="del_desc"
                                    values={{ name: itemName }}
                                    components={{
                                        bold: <strong className="text-danger"/>
                                    }}
                                />                           
                            </p>
                        </AlertDialog.Body>
                        <AlertDialog.Footer>
                            <Button slot="close" variant="tertiary">
                                Hủy bỏ
                            </Button>
                            <Button
                                slot="close"
                                variant="danger"
                                onPress={onDelete}
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

export default ConfirmDeleteDialog
