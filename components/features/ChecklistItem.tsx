'use client'

import React, { useState, useEffect } from 'react'
import clsx from 'clsx'
import { FAQ, ChecklistItem as ChecklistItemType } from '@/lib/types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'

export default function ChecklistItem({
  label,
  completed,
  onToggle,
  disabled = false,
}: {
  label: string
  completed: boolean
  onToggle: () => void
  disabled?: boolean
}) {
  return (
    <div
      onClick={() => {
        if (!disabled) onToggle()
      }}
      className={clsx(
        "flex items-center gap-3.5 p-4 rounded-xl border transition-all duration-200 cursor-pointer select-none",
        completed
          ? "bg-brand-light/20 border-brand-light/50 text-gray-500"
          : "bg-white border-[#E5E8EF] text-gray-800 hover:border-brand/40",
        disabled && "opacity-60 cursor-not-allowed"
      )}
    >
      <div className={clsx(
        "w-5 h-5 rounded-md border flex items-center justify-center transition-colors flex-shrink-0",
        completed
          ? "bg-brand border-brand text-white"
          : "border-gray-300 bg-white"
      )}>
        {completed && (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span className={clsx(
        "text-xs font-medium leading-snug transition-all",
        completed && "line-through text-gray-400"
      )}>
        {label}
      </span>
    </div>
  )
}

export function FAQAccordion({ faqs }: { faqs: FAQ[] }) {
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <div className="flex flex-col gap-3">
      {faqs.map((faq) => {
        const isOpen = openId === faq.id
        return (
          <div
            key={faq.id}
            className="bg-white border border-[#E5E8EF] rounded-2xl overflow-hidden shadow-sm transition-all"
          >
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : faq.id)}
              className="w-full px-5 py-4.5 text-left flex justify-between items-center gap-4 hover:bg-gray-50/50 transition-colors"
            >
              <span className="text-xs font-semibold text-gray-900 leading-snug">{faq.question}</span>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ${
                  isOpen ? 'rotate-180 text-brand' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isOpen && (
              <div className="px-5 pb-4.5 pt-1 text-xs text-gray-500 leading-relaxed border-t border-gray-100/50 bg-gray-50/10">
                {faq.answer}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

interface MoveInManagerProps {
  items: ChecklistItemType[]
  initialProgress: { item_id: string; completed: boolean }[]
}

export function MoveInManager({ items, initialProgress }: MoveInManagerProps) {
  const toasts = useToast()
  const [progress, setProgress] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {}
    items.forEach((item) => {
      const match = initialProgress.find((p) => p.item_id === item.id)
      map[item.id] = match ? match.completed : false
    })
    return map
  })
  
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  // Calculate countdown days remaining
  useEffect(() => {
    const deadline = new Date('2026-07-15T23:59:59')
    const diffTime = deadline.getTime() - new Date().getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    setDaysRemaining(diffDays > 0 ? diffDays : 0)
  }, [])

  const handleToggle = async (itemId: string) => {
    const currentStatus = progress[itemId]
    const nextStatus = !currentStatus

    setTogglingId(itemId)
    // Optimistic Update
    setProgress((prev) => ({ ...prev, [itemId]: nextStatus }))

    try {
      const res = await fetch('/api/movein', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_id: itemId, completed: nextStatus }),
      })

      if (!res.ok) {
        throw new Error('Failed to update progress')
      }
    } catch (error) {
      toasts.error('Failed to save progress update.')
      // Rollback
      setProgress((prev) => ({ ...prev, [itemId]: currentStatus }))
    } finally {
      setTogglingId(null)
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Countdown Banner */}
      <div className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl p-5 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[9px] uppercase font-bold tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
            Move-In Deadline
          </span>
          <h3 className="font-display font-semibold text-base mt-2">
            {daysRemaining !== null
              ? daysRemaining > 0
                ? `${daysRemaining} Days Remaining`
                : 'Deadline has passed'
              : 'Calculating...'}
          </h3>
          <p className="text-[10px] text-white/80 mt-0.5 font-medium">Target date: July 15, 2026</p>
        </div>
        <div className="text-white/25">
          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>

      {/* Checklist */}
      <div>
        <h3 className="font-display font-semibold text-gray-900 text-sm mb-3">Your Checklist</h3>
        {items.length === 0 ? (
          <p className="text-xs text-gray-400 italic">No checklist items set by administrator.</p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {items.map((item) => (
              <ChecklistItem
                key={item.id}
                label={item.label}
                completed={progress[item.id] || false}
                disabled={togglingId === item.id}
                onToggle={() => handleToggle(item.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Key Dates Card */}
      <Card className="flex flex-col gap-3.5">
        <h4 className="font-display font-semibold text-gray-900 text-xs uppercase tracking-wider">Key Housing Dates</h4>
        <div className="flex flex-col gap-3 text-xs">
          <div className="flex justify-between border-b border-gray-50 pb-2">
            <span className="text-gray-400 font-medium">Application Opens</span>
            <span className="font-semibold text-gray-800">June 1, 2026</span>
          </div>
          <div className="flex justify-between border-b border-gray-50 pb-2">
            <span className="text-gray-400 font-medium font-semibold text-brand">Priority Deadline</span>
            <span className="font-bold text-brand">July 15, 2026</span>
          </div>
          <div className="flex justify-between border-b border-gray-50 pb-2">
            <span className="text-gray-400 font-medium">Hall Assignments</span>
            <span className="font-semibold text-gray-800">August 1, 2026</span>
          </div>
          <div className="flex justify-between border-b border-gray-50 pb-2">
            <span className="text-gray-400 font-medium">Move-In Day</span>
            <span className="font-semibold text-gray-800">August 22, 2026</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400 font-medium">First Day of Classes</span>
            <span className="font-semibold text-gray-800">August 25, 2026</span>
          </div>
        </div>
      </Card>

      {/* Portal Button */}
      <a href="#" className="w-full">
        <Button variant="primary" className="w-full">
          Open Housing Application Portal
        </Button>
      </a>
    </div>
  )
}
