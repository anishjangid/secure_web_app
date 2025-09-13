import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database, create if doesn't exist
    let dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      include: { role: true }
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
        },
        include: { role: true }
      })
    }

    // Get stats in parallel
    const [
      totalUsers,
      totalFiles,
      activeRoles,
      recentActivity
    ] = await Promise.all([
      // Total users (only admins can see all users)
      dbUser.role.name === 'SuperAdmin' || dbUser.role.name === 'Admin'
        ? prisma.user.count()
        : 1, // Regular users only see themselves
      
      // Total files (only admins can see all files)
      dbUser.role.name === 'SuperAdmin' || dbUser.role.name === 'Admin'
        ? prisma.fileUpload.count()
        : prisma.fileUpload.count({
            where: { uploadedBy: dbUser.id }
          }),
      
      // Active roles (always show all roles)
      prisma.role.count(),
      
      // Recent activity (last 24 hours)
      prisma.activityLog.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours ago
          }
        }
      })
    ])

    const stats = {
      totalUsers,
      totalFiles,
      activeRoles,
      recentActivity
    }

    return NextResponse.json({ stats })

  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
