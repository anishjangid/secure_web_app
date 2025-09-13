import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { UsersTable } from '@/components/users/users-table'

export default async function UsersPage() {
  const user = await currentUser()
  
  if (!user) {
    redirect('/')
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            User Management
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage user accounts, roles, and permissions.
          </p>
        </div>

        <UsersTable />
      </div>
    </DashboardLayout>
  )
}
