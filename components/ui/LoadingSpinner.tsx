import React from 'react'
import clsx from 'clsx'

export function LoadingSpinner({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  return (
    <div className={clsx('flex items-center justify-center', className)}>
      <div
        className={clsx(
          'animate-spin rounded-full border-brand border-t-transparent',
          {
            'w-4 h-4 border-2': size === 'sm',
            'w-8 h-8 border-3': size === 'md',
            'w-12 h-12 border-4': size === 'lg',
          }
        )}
      />
    </div>
  )
}

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx('animate-pulse rounded-xl bg-gray-200', className)}
      {...props}
    />
  )
}
