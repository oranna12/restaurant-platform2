import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/dashboard/Sidebar'
import Header from '@/components/dashboard/Header'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Get restaurant data
  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('*')
    .eq('owner_id', user.id)
    .single()

  if (!restaurant) {
    // This shouldn't happen if trigger works, but handle gracefully
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Sidebar restaurant={restaurant} />
      <div className="lg:mr-64">
        <Header restaurant={restaurant} user={user} />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
