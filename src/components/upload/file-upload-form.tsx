'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react'
import { validateFile, formatFileSize, scanFileForSecurity } from '@/lib/file-upload'
import { toast } from 'sonner'

interface UploadProgress {
  file: File
  progress: number
  status: 'uploading' | 'scanning' | 'completed' | 'error'
  error?: string
  scanResult?: {
    fileSize: number
    fileType: string
    suspiciousPatterns: string[]
    warnings: string[]
  }
}

interface FileUploadFormProps {
  onUploadSuccess?: () => void // Add callback prop
}

export function FileUploadForm({ onUploadSuccess }: FileUploadFormProps) {
  const [uploads, setUploads] = useState<UploadProgress[]>([])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    
    for (const file of acceptedFiles) {
      // Validate file
      const validation = validateFile(file)
      if (!validation.valid) {
        toast.error(validation.error)
        continue
      }

      // Add to uploads list
      const newUpload: UploadProgress = {
        file,
        progress: 0,
        status: 'uploading',
      }
      
      setUploads(prev => [...prev, newUpload])

      try {
        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 100))
          setUploads(prev => 
            prev.map(upload => 
              upload.file === file 
                ? { ...upload, progress }
                : upload
            )
          )
        }

        // Simulate security scanning
        setUploads(prev => 
          prev.map(upload => 
            upload.file === file 
              ? { ...upload, status: 'scanning' as const }
              : upload
          )
        )

        // Actually upload the file to the server
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        const result = await response.json()

        if (response.ok && result.success) {
          setUploads(prev => 
            prev.map(upload => 
              upload.file === file 
                ? { 
                    ...upload, 
                    status: 'completed' as const,
                    scanResult: result.file.scanResult || {
                      fileSize: file.size,
                      fileType: file.type,
                      suspiciousPatterns: [],
                      warnings: []
                    }
                  }
                : upload
            )
          )
          const storageType = result.file.isCloud ? 'cloud' : 'local'
          toast.success(`${file.name} uploaded to ${storageType} storage and scanned successfully`)
          
          // Trigger refresh of files list
          if (onUploadSuccess) {
            onUploadSuccess()
          }
        } else {
          setUploads(prev => 
            prev.map(upload => 
              upload.file === file 
                ? { 
                    ...upload, 
                    status: 'error' as const,
                    error: result.error || 'Upload failed'
                  }
                : upload
            )
          )
          toast.error(result.error || `Failed to upload ${file.name}`)
        }

      } catch {
        setUploads(prev => 
          prev.map(upload => 
            upload.file === file 
              ? { 
                  ...upload, 
                  status: 'error' as const,
                  error: 'Upload failed'
                }
              : upload
          )
        )
        toast.error(`Failed to upload ${file.name}`)
      }
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'application/json': ['.json'],
      'text/csv': ['.csv'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true,
  })

  const removeUpload = (file: File) => {
    setUploads(prev => prev.filter(upload => upload.file !== file))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case 'scanning':
        return <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      default:
        return <Upload className="h-5 w-5 text-gray-400" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Files</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            or click to select files
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Supported: JPG, PNG, JSON, CSV (max 10MB)
          </p>
        </div>

        {uploads.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-white">
              Upload Progress
            </h4>
            {uploads.map((upload, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(upload.status)}
                    <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {upload.file.name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ({formatFileSize(upload.file.size)})
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeUpload(upload.file)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <Progress value={upload.progress} className="h-2" />
                
                {upload.status === 'scanning' && (
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    Scanning for security threats...
                  </p>
                )}
                
                {upload.status === 'error' && upload.error && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {upload.error}
                  </p>
                )}
                
                {upload.status === 'completed' && upload.scanResult && (
                  <div className="text-xs text-green-600 dark:text-green-400">
                    <p>✓ File scanned and safe</p>
                    {upload.scanResult.warnings.length > 0 && (
                      <p className="text-yellow-600 dark:text-yellow-400">
                        ⚠ {upload.scanResult.warnings.join(', ')}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
