import { z } from 'zod'

// File validation schema
export const fileUploadSchema = z.object({
  file: z.instanceof(File, { message: 'File is required' }),
  maxSize: z.number().default(10 * 1024 * 1024), // 10MB default
  allowedTypes: z.array(z.string()).default(['image/jpeg', 'image/png', 'application/json', 'text/csv'])
})

export type FileUploadInput = z.infer<typeof fileUploadSchema>

// Allowed file types and their MIME types
export const ALLOWED_FILE_TYPES = {
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'png': 'image/png',
  'json': 'application/json',
  'csv': 'text/csv'
} as const

export type AllowedFileType = keyof typeof ALLOWED_FILE_TYPES

// File validation function
export function validateFile(file: File, maxSize: number = 10 * 1024 * 1024): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${Math.round(maxSize / 1024 / 1024)}MB`
    }
  }

  // Check file type
  const fileExtension = file.name.split('.').pop()?.toLowerCase() as AllowedFileType
  if (!fileExtension || !ALLOWED_FILE_TYPES[fileExtension]) {
    return {
      valid: false,
      error: `File type .${fileExtension} is not allowed. Allowed types: ${Object.keys(ALLOWED_FILE_TYPES).join(', ')}`
    }
  }

  // Check MIME type
  const expectedMimeType = ALLOWED_FILE_TYPES[fileExtension]
  if (file.type !== expectedMimeType) {
    return {
      valid: false,
      error: `File MIME type ${file.type} does not match expected type ${expectedMimeType}`
    }
  }

  return { valid: true }
}

// Generate unique filename
export function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 8)
  const extension = originalName.split('.').pop()
  return `${timestamp}_${randomString}.${extension}`
}

// Format file size for display
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Basic file security scan (placeholder for more sophisticated scanning)
export async function scanFileForSecurity(file: File): Promise<{
  isSafe: boolean
  scanResult: {
    fileSize: number
    fileType: string
    suspiciousPatterns: string[]
    warnings: string[]
  }
}> {
  const scanResult = {
    fileSize: file.size,
    fileType: file.type,
    suspiciousPatterns: [] as string[],
    warnings: [] as string[]
  }

  // Check for suspicious file size (very large files)
  if (file.size > 50 * 1024 * 1024) { // 50MB
    scanResult.warnings.push('File size is unusually large')
  }

  // Check for suspicious patterns in filename
  const suspiciousPatterns = ['script', 'exec', 'cmd', 'bat', 'exe', 'php', 'asp', 'jsp']
  const fileName = file.name.toLowerCase()
  
  for (const pattern of suspiciousPatterns) {
    if (fileName.includes(pattern)) {
      scanResult.suspiciousPatterns.push(`Suspicious pattern in filename: ${pattern}`)
    }
  }

  // For JSON files, check for potentially malicious content
  if (file.type === 'application/json') {
    try {
      const text = await file.text()
      const jsonContent = JSON.parse(text)
      
      // Check for common malicious patterns in JSON
      const jsonString = JSON.stringify(jsonContent).toLowerCase()
      if (jsonString.includes('script') || jsonString.includes('javascript:')) {
        scanResult.suspiciousPatterns.push('Potential script injection in JSON content')
      }
    } catch (error) {
      scanResult.warnings.push('Invalid JSON format')
    }
  }

  const isSafe = scanResult.suspiciousPatterns.length === 0

  return {
    isSafe,
    scanResult
  }
}
