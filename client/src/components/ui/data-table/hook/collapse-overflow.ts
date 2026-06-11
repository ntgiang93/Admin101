import { useEffect, useRef, useState } from "react"

export function useCollapseOverflow() {
  const [isAnimating, setIsAnimating] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  // Cleanup timeout khi unmount
  useEffect(() => {
    return () => clearTimeout(timerRef.current)
  }, [])

  const handleToggleExpanded = (row: any) => {
    if (!row.getIsExpanded()) {
      row.toggleExpanded()
      return
    }

    setIsAnimating(true)
    row.toggleExpanded()

    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setIsAnimating(false), 300)
  }

  return { isAnimating, handleToggleExpanded }
}
