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

    // Check if user has permission to read users
    if (!hasPermission(user.role.name as keyof typeof import('@/lib/rbac').ROLES, 'users.read')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get all users with their roles
    const users = await prisma.user.findMany({
      include: {
        role: true,
        _count: {
          select: {
            uploadedFiles: true,
            activityLogs: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ users })

  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    // Check if user has permission to create users
    if (!hasPermission(user.role.name as keyof typeof import('@/lib/rbac').ROLES, 'users.create')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { email, firstName, lastName, roleId } = body

    // Validate required fields
    if (!email || !firstName || !lastName || !roleId) {
      return NextResponse.json({ 
        error: 'Missing required fields: email, firstName, lastName, roleId' 
      }, { status: 400 })
    }

    // Check if role exists
    const role = await prisma.role.findUnique({
      where: { id: roleId }
    })

    if (!role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 })
    }

    // In a real app, you would create the user in Clerk first
    // For now, we'll just create a placeholder
    const newUser = await prisma.user.create({
      data: {
        clerkId: `temp_${Date.now()}`, // This would be the actual Clerk ID
        email,
        firstName,
        lastName,
        roleId,
        imageUrl: null,
      },
      include: {
        role: true
      }
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'created a user',
        details: {
          newUserId: newUser.id,
          newUserEmail: email,
          role: role.name,
        },
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      }
    })

    return NextResponse.json({ 
      success: true,
      user: newUser
    })

  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}