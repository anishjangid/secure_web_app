import { writeFile, mkdir, unlink } from 'fs/promises'
import { join } from 'path'
import { uploadToCloudinary, deleteFromCloudinary } from './cloudinary'

export interface StorageResult {
  fileName: string
  filePath: string
  uploadPath: string
  isCloud: boolean
  cloudPublicId?: string
  cloudUrl?: string
}

// Determine if we should use cloud storage
function shouldUseCloudStorage(): boolean {
  return process.env.NODE_ENV === 'production' && 
         (process.env.CLOUDINARY_URL || 
          (process.env.CLOUDINARY_CLOUD_NAME && 
           process.env.CLOUDINARY_API_KEY && 
           process.env.CLOUDINARY_API_SECRET))
}

// Save file to appropriate storage (local or cloud)
export async function saveFile(file: File, uniqueFileName: string): Promise<StorageResult> {
  const isCloud = shouldUseCloudStorage()
  
  if (isCloud) {
    // Upload to Cloudinary
    const cloudResult = await uploadToCloudinary(file)
    
    return {
      fileName: uniqueFileName,
      filePath: cloudResult.secure_url,
      uploadPath: cloudResult.secure_url,
      isCloud: true,
      cloudPublicId: cloudResult.public_id,
      cloudUrl: cloudResult.secure_url,
    }
  } else {
    // Save locally
    const uploadDir = join(process.cwd(), 'uploads')
    const filePath = join(uploadDir, uniqueFileName)
    
    // Ensure upload directory exists
    await mkdir(uploadDir, { recursive: true })
    
    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)
    
    return {
      fileName: uniqueFileName,
      filePath: filePath,
      uploadPath: `/uploads/${uniqueFileName}`,
      isCloud: false,
    }
  }
}

// Delete file from appropriate storage
export async function deleteFile(filePath: string, cloudPublicId?: string): Promise<void> {
  const isCloud = shouldUseCloudStorage()
  
  if (isCloud && cloudPublicId) {
    // Delete from Cloudinary
    await deleteFromCloudinary(cloudPublicId)
  } else if (!isCloud) {
    // Delete local file
    try {
      await unlink(filePath)
    } catch (error) {
      console.error('Error deleting local file:', error)
    }
  }
}

// Get file URL for serving
export function getFileUrl(uploadPath: string, cloudUrl?: string): string {
  const isCloud = shouldUseCloudStorage()
  
  if (isCloud && cloudUrl) {
    return cloudUrl
  } else {
    // For local files, return the upload path
    return uploadPath
  }
}
