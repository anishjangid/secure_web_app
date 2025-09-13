import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { validateFile, generateUniqueFileName, scanFileForSecurity } from '@/lib/file-upload'
import { saveFile } from '@/lib/storage'

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file
    const validation = validateFile(file)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // Scan file for security
    const scanResult = await scanFileForSecurity(file)
    if (!scanResult.isSafe) {
      return NextResponse.json({ 
        error: 'File failed security scan',
        scanResult: scanResult.scanResult
      }, { status: 400 })
    }

    // Generate unique filename and save file
    const uniqueFileName = generateUniqueFileName(file.name)
    const storageResult = await saveFile(file, uniqueFileName)

    // Get user from database, create if doesn't exist
    let dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id }
    })

    if (!dbUser) {
      // Get the default "User" role
      const defaultRole = await prisma.role.findUnique({
        where: { name: 'User' }
      })

      if (!defaultRole) {
        return NextResponse.json({ error: 'Default role not found' }, { status: 500 })
      }

      // Create user in database
      dbUser = await prisma.user.create({
        data: {
          clerkId: user.id,
          email: user.emailAddresses[0].emailAddress,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          imageUrl: user.imageUrl,
          roleId: defaultRole.id,
        }
      })
    }

    // Save file record to database
    const fileRecord = await prisma.fileUpload.create({
      data: {
        fileName: uniqueFileName,
        originalName: file.name,
        fileSize: file.size,
        fileType: file.type,
        filePath: storageResult.filePath,
        uploadPath: storageResult.uploadPath,
        isScanned: true,
        isSafe: true,
        scanResult: {
          ...scanResult.scanResult,
          isCloud: storageResult.isCloud,
          cloudPublicId: storageResult.cloudPublicId,
          cloudUrl: storageResult.cloudUrl,
        },
        uploadedBy: dbUser.id,
      }
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: dbUser.id,
        action: 'uploaded a file',
        details: {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
        },
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      }
    })

    return NextResponse.json({
      success: true,
      file: {
        id: fileRecord.id,
        fileName: fileRecord.fileName,
        originalName: fileRecord.originalName,
        fileSize: fileRecord.fileSize,
        fileType: fileRecord.fileType,
        uploadPath: fileRecord.uploadPath,
        isSafe: fileRecord.isSafe,
        uploadedAt: fileRecord.createdAt.toISOString(),
        isCloud: storageResult.isCloud,
        cloudUrl: storageResult.cloudUrl,
      }
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
