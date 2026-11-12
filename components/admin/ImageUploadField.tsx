'use client'

import React, { useState, useRef } from 'react'
import { useToast } from '@/components/ui/Toast'

interface ImageUploadFieldProps {
  value: string
  onChange: (url: string) => void
  folder?: string
  label?: string
}

export default function ImageUploadField({
  value,
  onChange,
  folder = 'announcements',
  label = 'Flyer / Image (Optional)',
}: ImageUploadFieldProps) {
  const toasts = useToast()
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toasts.error('Please select an image file (PNG, JPG, WebP, etc.).')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toasts.error('Image size must be under 10MB.')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload image')
      }

      onChange(data.url)
      toasts.success('Flyer image uploaded to Supabase Storage!')
    } catch (err: any) {
      toasts.error(err.message || 'Image upload failed.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemove = () => {
    onChange('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-700">{label}</label>

      {value ? (
        <div className="relative border border-[#E5E8EF] rounded-xl p-2 bg-gray-50 flex items-center gap-3">
          <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 bg-white flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Uploaded Flyer Preview"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0 flex flex-col gap-1">
            <span className="text-xs font-semibold text-gray-800 truncate">Flyer Attached</span>
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-brand hover:underline truncate block"
            >
              {value}
            </a>
            <button
              type="button"
              onClick={handleRemove}
              className="self-start text-[11px] font-semibold text-red-600 hover:text-red-700 hover:underline mt-0.5"
            >
              Remove image
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 hover:border-brand/60 rounded-xl p-4 text-center cursor-pointer transition-colors bg-gray-50/50 hover:bg-white flex flex-col items-center justify-center gap-1.5"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading}
            />

            {uploading ? (
              <div className="flex items-center gap-2 text-xs font-medium text-brand">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Uploading to Supabase Storage...</span>
              </div>
            ) : (
              <>
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div className="text-xs text-gray-650">
                  <span className="font-semibold text-brand">Click to upload flyer image</span> or drag and drop
                </div>
                <span className="text-[10px] text-gray-400">PNG, JPG, WebP up to 10MB</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-400 font-medium">Or paste image URL:</span>
            <input
              type="url"
              placeholder="https://..."
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="flex-1 px-2.5 py-1 text-xs border border-gray-200 rounded-lg outline-none focus:border-brand"
            />
          </div>
        </div>
      )}
    </div>
  )
}

