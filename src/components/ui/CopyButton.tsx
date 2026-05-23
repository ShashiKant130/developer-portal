import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import { Button, type ButtonProps } from './Button'

const COPIED_DURATION_MS = 2000

interface CopyButtonProps {
  text: string
  label?: string
  variant?: ButtonProps['variant']
  size?: ButtonProps['size']
  className?: string
  buttonClassName?: string
}

export function CopyButton({
  text,
  label = 'Copy',
  variant = 'ghost',
  size = 'sm',
  className,
  buttonClassName,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setCopied(false), COPIED_DURATION_MS)
  }

  return (
    <div className={cn('inline-flex flex-col items-center', className)}>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={buttonClassName}
        onClick={() => void handleCopy()}
      >
        {label}
      </Button>
      {copied && (
        <span className="mt-1 text-xs font-medium text-emerald-400" aria-live="polite">
          Copied
        </span>
      )}
    </div>
  )
}
