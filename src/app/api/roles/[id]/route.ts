import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    // Check if user has permission to delete roles
    if (dbUser.role.name !== 'SuperAdmin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Check if role is in use
    const roleInUse = await prisma.user.findFirst({
      where: { roleId: params.id }
    })

    if (roleInUse) {
      return NextResponse.json({ error: 'Cannot delete role that is in use' }, { status: 400 })
    }

    // Delete role
    await prisma.role.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Role deleted successfully' })
  } catch (error) {
    console.error('Error deleting role:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
