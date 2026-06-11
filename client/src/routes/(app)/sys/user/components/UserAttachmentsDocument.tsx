import { FileHook } from '@/hooks/sys/file.ts'
import { Button, Spinner } from '@heroui/react'
import { useRef, useState } from 'react'

interface UserAttachmentsDocumentProps {
  id: string
}

export default function UserAttachmentsDocument(
  props: UserAttachmentsDocumentProps,
) {
  const { id } = props
  const REFERENCE_TYPE = 'userProfile'
  const dropzoneRef = useRef<any>(null)
  const [loading, setLoading] = useState(false)
  const { data: attachments, refetch } = FileHook.useGetByReference({
    referenceId: id,
    referenceType: REFERENCE_TYPE,
  })

  const onSubmit = async () => {
    try {
      setLoading(true)
      await dropzoneRef.current.updateReference(id, REFERENCE_TYPE)
    } catch (error) {
      // Handle error
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex-1 overflow-auto p-4">
        {/*<ExtDropzone*/}
        {/*  ref={dropzoneRef}*/}
        {/*  maxSize={10}*/}
        {/*  maxFiles={20}*/}
        {/*  accept={{ 'image/*': [], 'application/pdf': [], 'text/plain': ['.txt'] }}*/}
        {/*  existingFiles={attachments}*/}
        {/*  refetch={refetch}*/}
        {/*/>*/}
      </div>
      <div className="flex justify-end p-4 border-t border-default">
        <Button type="button" isPending={loading} onPress={onSubmit}>
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
