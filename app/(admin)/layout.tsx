import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { verifyAdmin } from '@/lib/auth'
import AdminSidebar from '@/components/layout/AdminSidebar'
import { ToastProvider } from '@/components/ui/Toast'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const admin = await verifyAdmin({} as any)
  if (!admin) redirect('/')

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#FFFAEB] flex flex-col lg:flex-row relative">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto p-5 lg:p-8">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </ToastProvider>
  )
}
