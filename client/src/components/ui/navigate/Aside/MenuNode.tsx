import { Disclosure } from '@heroui/react'
import {useCallback, useMemo} from 'react'
import { type MenuNodeType } from './SideMenu.tsx'
import { HugeIconByName } from '@/components/ui/icon/HugeIconByName.tsx'
import {Link, useRouterState} from '@tanstack/react-router'
import clsx from 'clsx'
import { AnimatePresence, motion } from 'motion/react'
import {useTranslation} from "react-i18next";

interface SidebarNodeProps {
  node: MenuNodeType
  expandedIds: Set<string | number>
  onToggle: (id: string | number) => void
  selectionStrategy?: 'all' | 'leaf'
  isCompact?: boolean,
}

const MenuNode = (props: SidebarNodeProps) => {
  const { node, expandedIds, onToggle, isCompact } = props
  const {i18n} = useTranslation()
  const  locale = i18n.language

  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  const checkIsExpanded = (path: string, menus: MenuNodeType[]) => {
    for (const node of menus) {
      if (node.path === path) {
        return true;
      }

      if (node.children && node.children.length > 0) {
        const isChildExpanded = checkIsExpanded(path, node.children);
        if (isChildExpanded) {
          return true; 
        }
      }
    }

    return false;
  }
  
  const isExpanded = checkIsExpanded(pathname, node.children || [])
  
  const renderNode = useCallback(
    (node: MenuNodeType) => {
      if (node.children && node.children.length > 0) {
        return (
          <Disclosure
            isExpanded={(expandedIds.has(node.id) || isExpanded) && !isCompact}
            onExpandedChange={() => onToggle(node.id)}
            key={node.id}
          >
            <Disclosure.Heading>
              <motion.div
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
                  opacity: { duration: 0.3 },
                }}
              >
                <Disclosure.Trigger
                  className={
                    'flex w-full justify-between items-center p-2 rounded-xl cursor-pointer hover:bg-default hover:shadow hover:text-default-foreground'
                  }
                >
                  <div className={'flex items-center'}>
                    <HugeIconByName
                      name={node.icon || 'CommandIcon'}
                      size={18}
                    />
                    <span className={'mx-2 text-sm truncate'}>{node[`${locale}Name`]}</span>
                  </div>
                  <Disclosure.Indicator />
                </Disclosure.Trigger>
              </motion.div>
            </Disclosure.Heading>
            <Disclosure.Content>
              <Disclosure.Body className="shadow-panel flex flex-col items-center rounded-3xl text-center">
                <AnimatePresence>
                  {node.children.map((child) => renderNode(child))}
                </AnimatePresence>
              </Disclosure.Body>
            </Disclosure.Content>
          </Disclosure>
        )
      } else {
        return (
          <motion.div
            className={'w-full'}
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
              opacity: { duration: 0.3 },
            }}
          >
            <Link
              to={node.path}
              className={clsx(
                'flex w-full justify-between items-center p-2 rounded-xl cursor-pointer text-sm',
              )}
              activeProps={{
                className:
                  'bg-accent text-accent-foreground hover:bg-accent shadow-sm shadow-accent',
              }}
              inactiveProps={{
                className:
                  'hover:bg-default hover:shadow-sm hover:text-default-foreground',
              }}
              key={node.id}
            >
              <div className={'flex items-center'}>
                <HugeIconByName name={node.icon || ''} size={18} />
                <span className={'mx-2 truncate'}>{node[`${locale}Name`]}</span>
              </div>
            </Link>
          </motion.div>
        )
      }
    },
    [node, expandedIds, onToggle, isCompact, locale],
  )

  const menuNode = useMemo(() => {
    return renderNode(node)
  }, [node, expandedIds, onToggle, isCompact, locale])

  return menuNode
}

export default MenuNode
