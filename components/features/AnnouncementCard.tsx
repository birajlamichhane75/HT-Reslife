import { Announcement } from '@/lib/types'
import { Card } from '@/components/ui/Card'
import { format } from 'date-fns'

export default function AnnouncementCard({ announcement }: { announcement: Announcement }) {
  const priorityColors = {
    urgent: 'border-l-red-500 bg-red-50/10',
    event: 'border-l-green-500 bg-green-50/10',
    info: 'border-l-blue-500 bg-blue-50/10',
  }

  const dotColors = {
    urgent: 'bg-red-500',
    event: 'bg-green-500',
    info: 'bg-blue-500',
  }

  return (
    <Card className={`border-l-4 ${priorityColors[announcement.priority]} hover:scale-[1.01] transition-transform duration-200`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${dotColors[announcement.priority]}`} />
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            {announcement.priority}
          </span>
        </div>
        <span className="text-[10px] text-gray-400 font-medium">
          {format(new Date(announcement.created_at), 'MMM d, h:mm a')}
        </span>
      </div>
      <h3 className="font-display font-semibold text-gray-900 text-sm mb-1">
        {announcement.title}
      </h3>
      <p className="text-xs text-gray-650 leading-relaxed whitespace-pre-wrap">
        {announcement.body}
      </p>
    </Card>
  )
}
