import React from 'react'
import clsx from 'clsx'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, rows = 4, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-semibold text-gray-500 tracking-wider">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          rows={rows}
          className={clsx(
            'w-full px-4 py-3 bg-white border border-[#E5E8EF] rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-brand focus:ring-2 focus:ring-brand/30 disabled:opacity-50 disabled:bg-gray-50 disabled:cursor-not-allowed resize-none',
            {
              'border-red-500 focus:border-red-500 focus:ring-red-500/20': error,
            },
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
