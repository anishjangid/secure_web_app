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

    // Check if user has permission to read roles
    if (!hasPermission(user.role.name as keyof typeof import('@/lib/rbac').ROLES, 'roles.read')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get all roles
    const roles = await prisma.role.findMany({
      include: {
        _count: {
          select: {
            users: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ roles })

  } catch (error) {
    console.error('Get roles error:', error)
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

    // Check if user has permission to create roles
    if (!hasPermission(user.role.name as keyof typeof import('@/lib/rbac').ROLES, 'roles.create')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, permissions } = body

    // Validate required fields
    if (!name || !permissions || !Array.isArray(permissions)) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, permissions' 
      }, { status: 400 })
    }

    // Check if role name already exists
    const existingRole = await prisma.role.findUnique({
      where: { name }
    })

    if (existingRole) {
      return NextResponse.json({ error: 'Role name already exists' }, { status: 400 })
    }

    // Create new role
    const newRole = await prisma.role.create({
      data: {
        name,
        description,
        permissions: permissions,
      }
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'created a role',
        details: {
          roleId: newRole.id,
          roleName: name,
          permissions: permissions,
        },
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      }
    })

    return NextResponse.json({ 
      success: true,
      role: newRole
    })

  } catch (error) {
    console.error('Create role error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}