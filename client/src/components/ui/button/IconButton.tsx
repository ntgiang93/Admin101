import { Button, Tooltip } from '@heroui/react'
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'

export interface IconButtonProps {
  color?: 'accent' | 'default' | 'success' | 'warning' | 'danger'
  tooltip?: string
  hidden?: boolean
  disabled?: boolean
  onPress: () => void
  icon: IconSvgElement
  size?: 'sm' | 'md' | 'lg'
}

const IconButton = ({
  color = 'accent',
  tooltip,
  hidden,
  disabled,
  icon,
  size = 'sm',
  onPress,
}: IconButtonProps) => {
  const accent = `text-accent hover:bg-accent-soft-hover`
  const defaultClass = `text-default hover:bg-default-soft-hover`
  const success = `text-success hover:bg-success-soft-hover`
  const warning = `text-warning hover:bg-warning-soft-hover`
  const danger = `text-danger hover:bg-danger-soft-hover`

  return (
    <Tooltip delay={0}>
      <Button
        hidden={hidden}
        isDisabled={disabled}
        isIconOnly
        aria-label={`button-icon`}
        variant="ghost"
        size={size}
        className={
          color === 'accent'
            ? accent
            : color === 'default'
            ? defaultClass
            : color === 'success'
            ? success
            : color === 'warning'
            ? warning
            : danger
        }
        onPress={onPress}
      >
        <HugeiconsIcon icon={icon} size={16} />
      </Button>
      <Tooltip.Content>{tooltip}</Tooltip.Content>
    </Tooltip>
  )
}

export default IconButton
