import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function SettingsPage() {
  const user = await currentUser()
  
  if (!user) {
    redirect('/')
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your application settings and preferences.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Application Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300">
              Settings functionality will be implemented in future updates.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
