import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { DashboardStats } from '@/components/dashboard/dashboard-stats'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { QuickActions } from '@/components/dashboard/quick-actions'

export default async function DashboardPage() {
  const user = await currentUser()
  
  if (!user) {
    redirect('/')
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user.firstName || 'User'}!
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Here&apos;s what&apos;s happening with your account today.
          </p>
        </div>

        <DashboardStats />
        
        <div className="grid lg:grid-cols-2 gap-6">
          <RecentActivity />
          <QuickActions />
        </div>
      </div>
    </DashboardLayout>
  )
}
