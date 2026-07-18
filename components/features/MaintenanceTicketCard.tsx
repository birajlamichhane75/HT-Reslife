import { MaintenanceTicket } from '@/lib/types'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { format } from 'date-fns'

export default function MaintenanceTicketCard({ ticket }: { ticket: MaintenanceTicket }) {
  const statusVariants: Record<string, 'warning' | 'info' | 'success'> = {
    open: 'warning',
    in_progress: 'info',
    resolved: 'success',
  }

  const priorityColors = {
    routine: 'bg-gray-50 text-gray-600 border-gray-200',
    urgent: 'bg-amber-50 text-amber-700 border-amber-200',
    emergency: 'bg-red-50 text-red-700 border-red-200',
  }

  return (
    <Card className="hover:scale-[1.01] transition-transform duration-200 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant={statusVariants[ticket.status]}>
            {ticket.status.replace('_', ' ')}
          </Badge>
          <span className={`text-[10px] font-semibold border px-2 py-0.5 rounded-full uppercase tracking-wider ${priorityColors[ticket.priority]}`}>
            {ticket.priority}
          </span>
        </div>
        <span className="text-[10px] text-gray-400 font-medium">
          {format(new Date(ticket.created_at), 'MMM d, yyyy')}
        </span>
      </div>

      <div>
        <h4 className="font-display font-semibold text-gray-900 text-sm">
          {ticket.issue_type}
        </h4>
        <p className="text-xs text-gray-400 mt-0.5">
          Room {ticket.room_number} {ticket.student?.hall_name ? `• ${ticket.student.hall_name}` : ''}
        </p>
      </div>

      <p className="text-xs text-gray-650 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100/50 whitespace-pre-wrap">
        {ticket.description}
      </p>

      {ticket.staff_notes && (
        <div className="p-3 bg-brand-light/30 border border-brand-light/70 rounded-xl">
          <p className="text-[10px] font-bold text-brand uppercase tracking-wider mb-1">Staff Note</p>
          <p className="text-xs text-brand leading-relaxed whitespace-pre-wrap">{ticket.staff_notes}</p>
        </div>
      )}
    </Card>
  )
}
