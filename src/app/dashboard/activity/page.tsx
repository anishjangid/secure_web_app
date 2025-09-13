import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ActivityPageWrapper } from '@/components/activity/activity-page-wrapper'

export default async function ActivityPage() {
  const user = await currentUser()
  
  if (!user) {
    redirect('/')
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Activity Log
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Monitor system activity and user actions.
          </p>
        </div>

        <ActivityPageWrapper />
      </div>
    </DashboardLayout>
  )
}
