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

    // Check if user has permission to read activity logs
    if (!hasPermission(user.role.name as keyof typeof import('@/lib/rbac').ROLES, 'activity.read')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const userId = searchParams.get('userId')
    const action = searchParams.get('action')
    
    // New filter parameters
    const search = searchParams.get('search')
    const actionType = searchParams.get('actionType')
    const timeRange = searchParams.get('timeRange')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    // Build where clause
    const where: any = {}
    
    // If user is not admin, only show their own activities
    if (user.role.name !== 'SuperAdmin' && user.role.name !== 'Admin') {
      where.userId = user.id
    } else if (userId) {
      where.userId = userId
    }

    // Search filter
    if (search) {
      where.OR = [
        {
          action: {
            contains: search
          }
        },
        {
          user: {
            OR: [
              {
                firstName: {
                  contains: search
                }
              },
              {
                lastName: {
                  contains: search
                }
              },
              {
                email: {
                  contains: search
                }
              }
            ]
          }
        }
      ]
    }

    // Action type filter
    if (actionType && actionType !== 'all') {
      where.action = {
        contains: actionType
      }
    }

    // Date range filters
    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom)
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo)
      }
    } else if (timeRange && timeRange !== 'all') {
      const now = new Date()
      const whereCreatedAt: any = {}
      
      switch (timeRange) {
        case 'today':
          whereCreatedAt.gte = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case 'yesterday':
          const yesterday = new Date(now)
          yesterday.setDate(yesterday.getDate() - 1)
          whereCreatedAt.gte = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate())
          whereCreatedAt.lt = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case 'week':
          const weekAgo = new Date(now)
          weekAgo.setDate(weekAgo.getDate() - 7)
          whereCreatedAt.gte = weekAgo
          break
        case 'month':
          const monthAgo = new Date(now)
          monthAgo.setMonth(monthAgo.getMonth() - 1)
          whereCreatedAt.gte = monthAgo
          break
      }
      
      if (Object.keys(whereCreatedAt).length > 0) {
        where.createdAt = whereCreatedAt
      }
    }

    // Get activities with pagination
    const activities = await prisma.activityLog.findMany({
      where,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            imageUrl: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset,
    })

    // Get total count for pagination
    const totalCount = await prisma.activityLog.count({ where })

    return NextResponse.json({
      activities,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    })

  } catch (error) {
    console.error('Get activity error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
