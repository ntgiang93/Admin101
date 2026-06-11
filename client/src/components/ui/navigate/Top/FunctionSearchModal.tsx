import { SearchInput } from '@/components/ui/input/SearchInput'
import { MenuHook } from '@/hooks/sys/menu'
import { type MenuItem } from '@/types/sys/Menu'
import {
  Description,
  Label,
  ListBox,
  Modal,
  ScrollShadow,
  Spinner,
} from '@heroui/react'
import { useEffect, useMemo, useState } from 'react'
import { HugeIconByName } from '@/components/ui/icon/HugeIconByName.tsx'
import { Link } from '@tanstack/react-router'

interface IFunctionSearchModalProps {
  isOpen: boolean
  onOpenChange: () => void
}

export const FunctionSearchModal = (props: IFunctionSearchModalProps) => {
  const { isOpen, onOpenChange } = props
  const [searchValue, setSearchValue] = useState('')
  const [functions, setFunction] = useState<MenuItem[]>([])
  const { data } = MenuHook.useGetUserMenu()
  const [isloading, setIsLoading] = useState(false)

  const flattenMenuData = (data: MenuItem[]): MenuItem[] =>
    data.flatMap((item) =>
      item.children?.length ? flattenMenuData(item.children) : item,
    )

  const dataSource = useMemo(() => flattenMenuData(data || []), [data])

  useEffect(() => {
    setFunction(dataSource)
  }, [dataSource])

  useEffect(() => {
    setIsLoading(true)
    const filteredData = searchValue
      ? dataSource.filter((item) => {
          return (
            item.name?.toLowerCase().includes(searchValue.toLowerCase()) ??
            false
          )
        })
      : dataSource

    setFunction(filteredData)
    setIsLoading(false)
  }, [dataSource, setSearchValue])

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <SearchInput
                value={searchValue}
                onValueChange={(value) => setSearchValue(value)}
              />
            </Modal.Header>
            <Modal.Body>
              <ScrollShadow className={'h-96'}>
                <ListBox aria-label="Dynamic Actions" items={functions}>
                  {isloading ? (
                    <Spinner></Spinner>
                  ) : (
                    (item) => (
                      <ListBox.Item key={item.id}>
                        <Link
                          to={item.url}
                          className={'flex flex-row items-center gap-4'}
                        >
                          <HugeIconByName
                            name={item.icon || 'CommandIcon'}
                            size={24}
                          />
                          <div className={'flex flex-col'}>
                            <Label>{item.name}</Label>
                            <Description>{item.url}</Description>
                          </div>
                        </Link>
                      </ListBox.Item>
                    )
                  )}
                </ListBox>
              </ScrollShadow>
            </Modal.Body>
            <Modal.Footer />
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  )
}
