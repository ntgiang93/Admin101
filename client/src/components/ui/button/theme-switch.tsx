import { Button } from '@heroui/react'
import { AnimatePresence, motion } from 'motion/react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Moon02Icon, Sun03Icon } from '@hugeicons/core-free-icons'
import { useEffect, useState } from 'react'

const ThemeSwitch = () => {
  const [theme, setTheme] = useState('light')

  const handleThemeChange = (newTheme: string) => {
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  const onChange = () => {
    if (theme === 'light') {
      setTheme('dark')
      localStorage.setItem('theme', 'dark')
      handleThemeChange('dark')
    } else {
      setTheme('light')
      localStorage.setItem('theme', 'light')
      handleThemeChange('light')
    }
  }

  useEffect(() => {
    const theme = localStorage.getItem('theme')
    setTheme(theme || 'light')
    handleThemeChange(theme || 'light')
  })

  return (
    <AnimatePresence mode={'popLayout'} initial={false}>
      {theme === 'dark' ? (
        <motion.div
          key={'light'}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
        >
          <Button isIconOnly variant={'ghost'} onPress={onChange}>
            <HugeiconsIcon icon={Moon02Icon} size={22} />
          </Button>
        </motion.div>
      ) : (
        <motion.div
          key={'dark'}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
        >
          <Button isIconOnly variant={'ghost'} onPress={onChange}>
            <HugeiconsIcon icon={Sun03Icon} size={22} />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ThemeSwitch
