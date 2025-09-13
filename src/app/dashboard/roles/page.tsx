import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { RolesPageWrapper } from '@/components/roles/roles-page-wrapper'

export default async function RolesPage() {
  const user = await currentUser()
  
  if (!user) {
    redirect('/')
  }

  return (
    <DashboardLayout>
      <RolesPageWrapper />
    </DashboardLayout>
  )
}
