'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Download, 
  Trash2, 
  Eye, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react'
import { formatFileSize } from '@/lib/file-upload'
import { toast } from 'sonner'

interface FileUpload {
  id: string
  fileName: string
  originalName: string
  fileSize: number
  fileType: string
  isScanned: boolean
  isSafe: boolean | null
  uploadedAt: string
  user: {
    firstName: string
    lastName: string
    email: string
  }
}

interface UploadedFilesListProps {
  refreshTrigger?: number // Add this prop to trigger refresh
}

const getFileTypeIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) {
    return '🖼️'
  } else if (fileType === 'application/json') {
    return '📄'
  } else if (fileType === 'text/csv') {
    return '📊'
  } else {
    return '📁'
  }
}

const getSecurityStatus = (isScanned: boolean, isSafe: boolean | null) => {
  if (!isScanned) {
    return {
      icon: <Shield className="h-4 w-4 text-gray-400" />,
      text: 'Pending',
      variant: 'secondary' as const,
    }
  }
  
  if (isSafe) {
    return {
      icon: <CheckCircle className="h-4 w-4 text-green-500" />,
      text: 'Safe',
      variant: 'default' as const,
    }
  } else {
    return {
      icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
      text: 'Unsafe',
      variant: 'destructive' as const,
    }
  }
}

export function UploadedFilesList({ refreshTrigger }: UploadedFilesListProps = {}) {
  const [files, setFiles] = useState<FileUpload[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFiles()
  }, [refreshTrigger]) // Refresh when trigger changes

  const fetchFiles = async () => {
    try {
      const response = await fetch('/api/files')
      if (response.ok) {
        const data = await response.json()
        console.log('Fetched files data:', data.files) // Debug logging
        setFiles(data.files || [])
      } else {
        toast.error('Failed to load files')
      }
    } catch (error) {
      console.error('Error fetching files:', error)
      toast.error('Failed to load files')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (fileId: string) => {
    try {
      const response = await fetch(`/api/files/${fileId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.file.downloadUrl) {
          // For cloud files, open in new tab
          if (data.file.isCloud) {
            window.open(data.file.downloadUrl, '_blank')
          } else {
            // For local files, trigger download
            const link = document.createElement('a')
            link.href = data.file.downloadUrl
            link.download = data.file.fileName
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
          }
          toast.success('File download started')
        }
      } else {
        toast.error('Failed to download file')
      }
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to download file')
    }
  }

  const handleDelete = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return

    try {
      const response = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        setFiles(prev => prev.filter(file => file.id !== fileId))
        toast.success('File deleted successfully')
      } else {
        toast.error('Failed to delete file')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete file')
    }
  }

  const handleView = async (fileId: string) => {
    try {
      const response = await fetch(`/api/files/${fileId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.file.downloadUrl) {
          window.open(data.file.downloadUrl, '_blank')
        }
      } else {
        toast.error('Failed to view file')
      }
    } catch (error) {
      console.error('View error:', error)
      toast.error('Failed to view file')
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Uploads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            <span className="ml-2 text-gray-500">Loading files...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Uploads</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {files.map((file) => {
                const securityStatus = getSecurityStatus(file.isScanned, file.isSafe)
                
                // Format ISO date string to readable format
                const formatUploadDate = (dateString: string) => {
                  if (!dateString) return 'Unknown'
                  
                  console.log('Raw date string:', dateString) // Debug log
                  
                  const date = new Date(dateString)
                  
                  if (isNaN(date.getTime())) {
                    console.error('Invalid date:', dateString)
                    return 'Invalid Date'
                  }
                  
                  return date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                  })
                }
                
                const uploadedDate = formatUploadDate(file.uploadedAt)
                const uploadedBy = `${file.user.firstName} ${file.user.lastName}`.trim() || file.user.email
                
                return (
                  <TableRow key={file.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">
                          {getFileTypeIcon(file.fileType)}
                        </span>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white truncate max-w-xs">
                            {file.originalName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                            by {uploadedBy}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600 dark:text-gray-300">
                      {formatFileSize(file.fileSize)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={securityStatus.variant} className="flex items-center space-x-1 w-fit">
                        {securityStatus.icon}
                        <span>{securityStatus.text}</span>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600 dark:text-gray-300">
                      {uploadedDate}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(file.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(file.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(file.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          
          {files.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No files uploaded yet
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
