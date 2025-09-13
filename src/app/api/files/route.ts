import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { hasPermission } from '@/lib/rbac'

export async function GET(request: NextRequest) {
  try {
    const currentUserData = await currentUser()
    
    if (!currentUserData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user and check permissions, create if doesn't exist
    let user = await prisma.user.findUnique({
      where: { clerkId: currentUserData.id },
      include: { role: true }
    })

    if (!user) {
      // Get the default "User" role
      const defaultRole = await prisma.role.findUnique({
        where: { name: 'User' }
      })

      if (!defaultRole) {
        return NextResponse.json({ error: 'Default role not found' }, { status: 500 })
      }

      // Create user in database
      user = await prisma.user.create({
        data: {
          clerkId: currentUserData.id,
          email: currentUserData.emailAddresses[0].emailAddress,
          firstName: currentUserData.firstName || '',
          lastName: currentUserData.lastName || '',
          imageUrl: currentUserData.imageUrl,
          roleId: defaultRole.id,
        },
        include: { role: true }
      })
    }

    // Check if user has permission to read files
    if (!hasPermission(user.role.name as keyof typeof import('@/lib/rbac').ROLES, 'files.read')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const uploadedBy = searchParams.get('uploadedBy')

    // Build where clause
    const where: any = {}
    
    // If user is not admin, only show their own files
    if (user.role.name !== 'SuperAdmin' && user.role.name !== 'Admin') {
      where.uploadedBy = user.id
    } else if (uploadedBy) {
      where.uploadedBy = uploadedBy
    }

    // Get files with pagination
    const files = await prisma.fileUpload.findMany({
      where,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset,
    })

    // Transform the data to match the expected interface
    const transformedFiles = files.map(file => {
      console.log('Original createdAt:', file.createdAt, 'Type:', typeof file.createdAt) // Debug log
      return {
        ...file,
        uploadedAt: file.createdAt.toISOString(), // Convert Date to ISO string
      }
    })

    // Get total count for pagination
    const totalCount = await prisma.fileUpload.count({ where })

    return NextResponse.json({
      files: transformedFiles,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    })

  } catch (error) {
    console.error('Get files error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
