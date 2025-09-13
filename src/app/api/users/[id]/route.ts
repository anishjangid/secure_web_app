import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the current user's role
    let dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { role: true }
    })

    if (!dbUser) {
      // Create user if doesn't exist
      dbUser = await prisma.user.create({
        data: {
          clerkId: userId,
          email: 'temp@example.com', // Will be updated by webhook
          firstName: 'User',
          lastName: 'User',
          role: {
            connect: { name: 'User' }
          }
        },
        include: { role: true }
      })
    }

    // Check if user has permission to manage users
    if (!['SuperAdmin', 'Admin'].includes(dbUser.role.name)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { id } = await params
    const { roleId } = await request.json()

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        roleId: roleId
      },
      include: {
        role: true,
        _count: {
          select: {
            uploadedFiles: true,
            activityLogs: true
          }
        }
      }
    })

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the current user's role
    let dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { role: true }
    })

    if (!dbUser) {
      // Create user if doesn't exist
      dbUser = await prisma.user.create({
        data: {
          clerkId: userId,
          email: 'temp@example.com',
          firstName: 'User',
          lastName: 'User',
          role: {
            connect: { name: 'User' }
          }
        },
        include: { role: true }
      })
    }

    // Check if user has permission to delete users
    if (dbUser.role.name !== 'SuperAdmin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { id } = await params

    // Prevent self-deletion
    if (dbUser.id === id) {
      return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 })
    }

    // Delete user
    await prisma.user.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
