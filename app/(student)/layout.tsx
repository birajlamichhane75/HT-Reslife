import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BottomNav from '@/components/layout/BottomNav'
import TopBar from '@/components/layout/TopBar'
import { ToastProvider } from '@/components/ui/Toast'
import StudentSidebar from '@/components/layout/StudentSidebar'

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
      <div className="min-h-screen bg-[#FFFAEB] flex flex-col md:flex-row max-w-[430px] md:max-w-none mx-auto relative border-x border-gray-150/50 md:border-x-0 shadow-lg md:shadow-none">
        {/* Mobile Top Bar */}
        <div className="md:hidden flex-shrink-0">
          <TopBar studentName={student?.full_name ?? ''} />
        </div>
        
        {/* Desktop Sidebar (Left side) */}
        <StudentSidebar 
          studentName={student?.full_name ?? ''} 
          hallName={student?.hall_name ?? null} 
          roomNumber={student?.room_number ?? null} 
        />

        {/* Main Content Pane */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-8">
          <div className="max-w-4xl mx-auto w-full md:py-8 md:px-10">
            {children}
          </div>
        </main>
        
        <BottomNav />
      </div>
    </ToastProvider>
  )
}
