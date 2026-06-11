import { Separator, Tooltip } from '@heroui/react'
import { useCallback, useMemo } from 'react'
import { type MenuNodeType } from './SideMenu.tsx'
import { HugeIconByName } from '@/components/ui/icon/HugeIconByName.tsx'
import { Link } from '@tanstack/react-router'
import clsx from 'clsx'
import { AnimatePresence, motion } from 'motion/react'

interface SidebarNodeProps {
  node: MenuNodeType
  expandedIds: Set<string | number>
  onToggle: (id: string | number) => void
  selectionStrategy?: 'all' | 'leaf'
  isCompact?: boolean
}

const CompactMenuNode = (props: SidebarNodeProps) => {
  const { node, expandedIds, onToggle, isCompact } = props

  const renderNode = useCallback(
    (node: MenuNodeType) => {
      if (node.children && node.children.length > 0) {
        return (
          <motion.div
            key={node.id}
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
          >
            <Separator className="my-2" />
            <AnimatePresence>
              {node.children.map((child) => renderNode(child))}
            </AnimatePresence>
          </motion.div>
        )
      } else {
        return (
          <motion.div
            key={node.id}
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
          >
            <Tooltip delay={0}>
              <Tooltip.Trigger>
                <Link
                  to={node.url}
                  className={clsx(
                    'flex w-full justify-between items-center p-2 rounded-lg cursor-pointer text-sm',
                  )}
                  activeProps={{
                    className:
                      'bg-accent text-background hover:bg-accent shadow-sm shadow-accent',
                  }}
                  inactiveProps={{
                    className: 'hover:bg-muted hover:shadow-sm',
                  }}
                  key={node.id}
                >
                  <HugeIconByName name={node.icon || ''} size={18} />
                </Link>
              </Tooltip.Trigger>
              <Tooltip.Content showArrow placement={'right'}>
                <Tooltip.Arrow />
                {node.name}
              </Tooltip.Content>
            </Tooltip>
          </motion.div>
        )
      }
    },
    [node, expandedIds, onToggle, isCompact],
  )

  const menuNode = useMemo(() => {
    return renderNode(node)
  }, [node, expandedIds, onToggle, isCompact])

  return menuNode
}

export default CompactMenuNode
