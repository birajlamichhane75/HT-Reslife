import React from 'react'
import clsx from 'clsx'

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        'bg-white rounded-2xl border border-[#E5E8EF] shadow-sm p-5 transition-all duration-200',
        className
      )}
      {...props}
    />
  )
}
