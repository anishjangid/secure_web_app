import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
if (process.env.CLOUDINARY_URL) {
  // Use CLOUDINARY_URL if available (recommended)
  cloudinary.config({
    secure: true
  })
} else {
  // Fallback to individual credentials
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })
}

export { cloudinary }

// Upload file to Cloudinary
export async function uploadToCloudinary(file: File): Promise<{
  public_id: string
  secure_url: string
  format: string
  bytes: number
}> {
  // Convert File to Buffer
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  // Convert Buffer to base64 string
  const base64String = buffer.toString('base64')
  const dataURI = `data:${file.type};base64,${base64String}`

  // Upload to Cloudinary
  const result = await cloudinary.uploader.upload(dataURI, {
    folder: 'secure-web-app', // Organize files in a folder
    resource_type: 'auto', // Auto-detect file type
    use_filename: true,
    unique_filename: true,
  })

  return {
    public_id: result.public_id,
    secure_url: result.secure_url,
    format: result.format,
    bytes: result.bytes,
  }
}

// Delete file from Cloudinary
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId)
}

// Get Cloudinary URL with transformations
export function getCloudinaryUrl(publicId: string, transformations?: Record<string, unknown>): string {
  return cloudinary.url(publicId, transformations)
}
