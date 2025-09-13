import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { UploadPageWrapper } from '@/components/upload/upload-page-wrapper'

export default async function UploadPage() {
  const user = await currentUser()
  
  if (!user) {
    redirect('/')
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            File Upload
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Upload files securely with real-time progress and security scanning.
          </p>
        </div>

        <UploadPageWrapper />
      </div>
    </DashboardLayout>
  )
}
