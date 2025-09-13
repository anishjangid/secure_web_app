import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { getFileUrl } from '@/lib/storage'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Get file record from database
    const fileRecord = await prisma.fileUpload.findUnique({
      where: { id },
      include: { user: true }
    })

    if (!fileRecord) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Check if user has permission to download this file
    // Users can download their own files, admins can download any file
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      include: { role: true }
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check permissions (user can download their own files or if they have download permission)
    const canDownload = fileRecord.uploadedBy === dbUser.id || 
                       dbUser.role.name === 'SuperAdmin' || 
                       dbUser.role.name === 'Admin'

    if (!canDownload) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get the file URL
    const scanResult = fileRecord.scanResult as { cloudUrl?: string; isCloud?: boolean }
    const fileUrl = getFileUrl(fileRecord.uploadPath, scanResult?.cloudUrl)

    // Log download activity
    await prisma.activityLog.create({
      data: {
        userId: dbUser.id,
        action: 'downloaded a file',
        details: {
          fileId: fileRecord.id,
          fileName: fileRecord.originalName,
          fileSize: fileRecord.fileSize,
        },
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      }
    })

    // Return file info and URL for download
    return NextResponse.json({
      success: true,
      file: {
        id: fileRecord.id,
        fileName: fileRecord.originalName,
        fileSize: fileRecord.fileSize,
        fileType: fileRecord.fileType,
        downloadUrl: fileUrl,
        isCloud: scanResult?.isCloud || false,
      }
    })
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      include: { role: true }
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get file record from database
    const fileRecord = await prisma.fileUpload.findUnique({
      where: { id },
      include: { user: true }
    })

    if (!fileRecord) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Check permissions (user can delete their own files or if they have delete permission)
    const canDelete = fileRecord.uploadedBy === dbUser.id || 
                     dbUser.role.name === 'SuperAdmin' || 
                     dbUser.role.name === 'Admin'

    if (!canDelete) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Delete file from storage
    const { deleteFile } = await import('@/lib/storage')
    const scanResult = fileRecord.scanResult as { cloudPublicId?: string }
    await deleteFile(fileRecord.filePath, scanResult?.cloudPublicId)

    // Delete file record from database
    await prisma.fileUpload.delete({
      where: { id }
    })

    // Log delete activity
    await prisma.activityLog.create({
      data: {
        userId: dbUser.id,
        action: 'deleted a file',
        details: {
          fileId: fileRecord.id,
          fileName: fileRecord.originalName,
          fileSize: fileRecord.fileSize,
        },
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      }
    })

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    })

  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
