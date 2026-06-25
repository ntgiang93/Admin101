import { ScrollShadow } from '@heroui/react'
import clsx from 'clsx'
import { AnimatePresence, motion } from 'motion/react'
import {useEffect, useMemo, useState} from 'react'
import MenuNode from '@/components/ui/navigate/Aside/MenuNode.tsx'
import CompactMenuNode from '@/components/ui/navigate/Aside/CompactMenuNode.tsx'
import {useRouterState} from "@tanstack/react-router";

export type MenuNodeType = {
  id: number
  viName: string
  enName?: string
  path: string
  icon?: string
  children?: MenuNodeType[]
  [key: string]: any
}

export interface SidebarBodyProps {
  items: MenuNodeType[]
  isCompact?: boolean
}

export const SideMenu = (props: SidebarBodyProps) => {
  const { items, isCompact } = props
  const [expandedIds, setExpandedIds] = useState<Set<string | number>>(
    new Set(),
  )

  const handleToggle = (id: string | number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }
  
  const content = useMemo(() => {
    if (!items.length) {
      return null
    }
    return (
      <ScrollShadow
        hideScrollBar
        className={clsx(
          'lg:h-[calc(100vh-11rem)] max-lg:h-[calc(100vh-12rem)] max-w-[calc(256-24px)] w-full',
        )}
      >
        <div className="w-full flex flex-col gap-1">
          <AnimatePresence key={isCompact ? 'compact' : 'regular'}>
            {items.map((node, index) => {
              return (
                <div key={index}>
                  {isCompact && (
                    <CompactMenuNode
                      node={node}
                      expandedIds={expandedIds}
                      onToggle={handleToggle}
                      isCompact={isCompact}
                    />
                  )}
                  {!isCompact && (
                    <MenuNode
                      node={node}
                      expandedIds={expandedIds}
                      onToggle={handleToggle}
                      isCompact={isCompact}
                    />
                  )}
                </div>
              )
            })}
          </AnimatePresence>
        </div>
      </ScrollShadow>
    )
  }, [items, expandedIds, isCompact])
  
  return (
    <div className={clsx('flex flex-col gap-3')}>
      <motion.div
        initial="initial"
        animate="animate"
        className="rounded-large p-2"
      >
        {content}
      </motion.div>
    </div>
  )
}

export default SideMenu
