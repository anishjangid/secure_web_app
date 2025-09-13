'use client'

import { useState } from 'react'
import { FileUploadForm } from '@/components/upload/file-upload-form'
import { UploadedFilesList } from '@/components/upload/uploaded-files-list'

export function UploadPageWrapper() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleUploadSuccess = () => {
    // Increment the trigger to refresh the files list
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <FileUploadForm onUploadSuccess={handleUploadSuccess} />
      <UploadedFilesList refreshTrigger={refreshTrigger} />
    </div>
  )
}
