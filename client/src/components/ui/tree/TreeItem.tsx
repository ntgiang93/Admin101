import { AnimatePresence, motion } from 'motion/react'
import { Button, Checkbox } from '@heroui/react'
import clsx from 'clsx'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowRight01Icon } from '@hugeicons/core-free-icons'
import { Children, isValidElement, type ReactNode, useState } from 'react'
import { useTreeContext } from '@/components/ui/tree/TreeListContext.ts'

export interface TreeItemProps {
  id: string | number
  children?: ReactNode | ReactNode[]
  content?: ReactNode
  defaultExpanded?: boolean
  onExpandChange?: (expanded: boolean) => void
  className?: string
  value?: string | number
  isIndeterminate?: boolean
}

const TreeItem = (props: TreeItemProps) => {
  const {
    id,
    children,
    content,
    defaultExpanded = false,
    onExpandChange,
    className,
    value,
  } = props

  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const hasChildren = Boolean(children)
  const { selectionMode, selectionStrategy, onChange, values } =
    useTreeContext()

  const handleToggle = () => {
    const newExpanded = !isExpanded
    setIsExpanded(newExpanded)
    onExpandChange?.(newExpanded)
  }

  const itemValue = value ? value : id
  const isSelected = values.has(itemValue)

  const collectValues = (nodes: ReactNode): (string | number)[] => {
    let vals: (string | number)[] = []
    Children.forEach(nodes, (child) => {
      if (isValidElement(child)) {
        const childProps = child.props as TreeItemProps
        const childValue = childProps.value
          ? childProps.value
          : childProps.id.toString()
        vals.push(childValue)
        if (childProps.children) {
          vals = vals.concat(collectValues(childProps.children))
        }
      }
    })
    return vals
  }

  const childrenValue = collectValues(children)
  const isDisabled = selectionStrategy === 'leaf' && hasChildren
  const isViewMode = selectionMode === 'read-only'

  const isIndeterminate = (() => {
    if (!hasChildren || isSelected) return false
    const selectedChildValues = childrenValue.filter((val) => values.has(val))
    return selectedChildValues.length > 0
  })()

  const handleSelected = (val: boolean) => {
    if (val && selectionMode === 'single') {
      onChange(itemValue)
      return
    } else if (!val && selectionMode === 'single') {
      const emptyValue = typeof itemValue === 'string' ? '' : 0
      onChange(emptyValue)
      return
    } else if (selectionMode === 'multiple') {
      let newValues = new Set<string | number>(values)
      if (val) {
        if (selectionStrategy === 'leaf' && hasChildren) {
          childrenValue.forEach((childVal) => newValues.add(childVal))
        } else {
          newValues.add(itemValue)
        }
      } else {
        if (selectionStrategy === 'leaf' && hasChildren) {
          childrenValue.forEach((childVal) => newValues.delete(childVal))
        } else {
          newValues.delete(itemValue)
        }
      }
      onChange(Array.from(newValues))
    }
  }

  return (
    <motion.div key={id} className={clsx('w-full h-auto', className)}>
      <div className="flex items-center justify-start w-full gap-1 group">
        <Button
          isIconOnly
          size="sm"
          variant="ghost"
          onPress={handleToggle}
          className={clsx(
            hasChildren ? '' : 'invisible',
            'transition-all duration-300 aspect-square',
            isExpanded ? 'rotate-90' : 'rotate-0',
          )}
        >
          {hasChildren && <HugeiconsIcon icon={ArrowRight01Icon} />}
        </Button>
        <div
          className={
            'flex items-center gap-2 p-2 rounded-lg group-hover:bg-default group-hover:cursor-pointer w-full'
          }
        >
          {isViewMode ? null : (
            <Checkbox
              id="email-notifications"
              isSelected={isSelected}
              onChange={(val) => handleSelected(val)}
              isIndeterminate={isIndeterminate}
              className={'cursor-pointer'}
              isReadOnly={isDisabled}
            >
              <Checkbox.Control>
                <Checkbox.Indicator />
              </Checkbox.Control>
            </Checkbox>
          )}
          {content}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isExpanded && hasChildren && (
          <motion.div
            key={`children-${id}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{
              opacity: 1,
              height: 'auto',
            }}
            exit={{
              opacity: 0,
              height: 0,
            }}
            transition={{
              duration: 0.3,
              ease: [0.4, 0.0, 0.2, 1],
              opacity: { duration: 0.2 },
            }}
            className="overflow-hidden pl-6"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

TreeItem.displayName = 'TreeItem'

export default TreeItem
