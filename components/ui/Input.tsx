import React from 'react'
import clsx from 'clsx'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, type = 'text', ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-semibold text-gray-500 tracking-wider">
            {label}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          className={clsx(
            'w-full px-4 py-3 bg-white border border-[#E5E8EF] rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-brand focus:ring-2 focus:ring-brand/30 disabled:opacity-50 disabled:bg-gray-50 disabled:cursor-not-allowed',
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

Input.displayName = 'Input'
