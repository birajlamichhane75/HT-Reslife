import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BottomNav from '@/components/layout/BottomNav'
import TopBar from '@/components/layout/TopBar'
import { ToastProvider } from '@/components/ui/Toast'

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: student } = await supabase
    .from('students')
    .select('full_name, hall_name, room_number, role')
    .eq('id', session.user.id)
    .single()

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#FFFAEB] flex flex-col max-w-[430px] mx-auto relative border-x border-gray-150/50 shadow-lg">
        <TopBar studentName={student?.full_name ?? ''} />
        <main className="flex-1 overflow-y-auto pb-20">
          {children}
        </main>
        <BottomNav />
      </div>
    </ToastProvider>
  )
}
