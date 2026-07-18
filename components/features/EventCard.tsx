import { Event } from '@/lib/types'
import { Card } from '@/components/ui/Card'
import { format } from 'date-fns'

export default function EventCard({ event }: { event: Event }) {
  const tagColors = {
    mandatory: 'bg-amber-500 text-white',
    social: 'bg-green-500 text-white',
    academic: 'bg-blue-500 text-white',
    deadline: 'bg-red-500 text-white',
    housing: 'bg-purple-500 text-white',
  }

  const dateColors = {
    mandatory: 'bg-amber-50 text-amber-700 border-amber-200',
    social: 'bg-green-50 text-green-700 border-green-200',
    academic: 'bg-blue-50 text-blue-700 border-blue-200',
    deadline: 'bg-red-50 text-red-700 border-red-200',
    housing: 'bg-purple-50 text-purple-700 border-purple-200',
  }

  const eventDate = new Date(event.event_date)
  const month = format(eventDate, 'MMM')
  const day = format(eventDate, 'd')
  const time = format(eventDate, 'h:mm a')

  return (
    <Card className="hover:scale-[1.01] transition-transform duration-200 p-4 flex gap-4 items-center">
      {/* Date Column */}
      <div className={`w-14 h-14 rounded-xl border flex flex-col items-center justify-center flex-shrink-0 ${dateColors[event.tag]}`}>
        <span className="text-[9px] uppercase font-bold tracking-wider leading-none mb-0.5">{month}</span>
        <span className="text-xl font-bold font-display leading-none">{day}</span>
      </div>

      {/* Info Column */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${tagColors[event.tag]}`}>
            {event.tag}
          </span>
          <span className="text-[10px] text-gray-400 font-semibold">{time}</span>
        </div>
        <h3 className="font-display font-semibold text-gray-900 text-sm truncate">{event.title}</h3>
        {event.location && (
          <p className="text-[11px] text-gray-400 font-medium flex items-center gap-1 mt-0.5">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">{event.location}</span>
          </p>
        )}
        {event.description && (
          <p className="text-xs text-gray-500 mt-2 leading-relaxed whitespace-pre-wrap border-t border-gray-50 pt-2">{event.description}</p>
        )}
      </div>
    </Card>
  )
}
