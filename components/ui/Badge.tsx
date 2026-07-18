import React from 'react'
import clsx from 'clsx'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'info' | 'success' | 'warning' | 'error' | 'neutral'
}

export function Badge({ className, variant = 'neutral', ...props }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        {
          'bg-blue-50 text-blue-700 border-blue-100': variant === 'info',
          'bg-green-50 text-green-700 border-green-100': variant === 'success',
          'bg-amber-50 text-amber-800 border-amber-100': variant === 'warning',
          'bg-red-50 text-red-700 border-red-100': variant === 'error',
          'bg-gray-100 text-gray-700 border-gray-200': variant === 'neutral',
        },
        className
      )}
      {...props}
    />
  )
}
