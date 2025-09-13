'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Shield, 
  Mail,
  Calendar,
  Loader2
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ROLES, RoleName } from '@/lib/rbac'
import { toast } from 'sonner'

interface User {
  id: string
  clerkId: string
  email: string
  firstName: string
  lastName: string
  imageUrl?: string
  role: {
    id: string
    name: string
    description?: string
  }
  createdAt: string
  updatedAt: string
  _count: {
    uploadedFiles: number
    activityLogs: number
  }
}


const getRoleColor = (roleName: string) => {
  switch (roleName) {
    case 'SuperAdmin':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    case 'Admin':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    case 'Manager':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    case 'User':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case 'Guest':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }
}

const getInitials = (firstName: string, lastName: string) => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return 'Invalid Date'
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const isRecentlyActive = (updatedAt: string) => {
  const updatedDate = new Date(updatedAt)
  const now = new Date()
  const diffInHours = (now.getTime() - updatedDate.getTime()) / (1000 * 60 * 60)
  return diffInHours < 24
}

export function UsersTable() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      } else if (response.status === 403) {
        // User doesn't have permission to view users
        setUsers([])
        toast.error('You do not have permission to view users')
      } else {
        toast.error('Failed to load users')
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (userId: string) => {
    console.log('Edit user:', userId)
  }

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        setUsers(prev => prev.filter(user => user.id !== userId))
        toast.success('User deleted successfully')
      } else {
        toast.error('Failed to delete user')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete user')
    }
  }

  const handleRoleChange = async (userId: string, newRoleId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roleId: newRoleId })
      })
      if (response.ok) {
        // Refresh users list
        fetchUsers()
        toast.success('User role updated successfully')
      } else {
        toast.error('Failed to update user role')
      }
    } catch (error) {
      console.error('Role change error:', error)
      toast.error('Failed to update user role')
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
            <span className="ml-2 text-gray-500">Loading users...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users ({users.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.imageUrl} />
                      <AvatarFallback>
                        {getInitials(user.firstName, user.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {user.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getRoleColor(user.role.name)}>
                    {user.role.name}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <div className={`h-2 w-2 rounded-full ${
                      isRecentlyActive(user.updatedAt) 
                        ? 'bg-green-500' 
                        : 'bg-gray-400'
                    }`} />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {isRecentlyActive(user.updatedAt) ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(user.createdAt)}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-gray-600 dark:text-gray-300">
                  {formatDate(user.updatedAt)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(user.id)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'Manager')}>
                        <Shield className="h-4 w-4 mr-2" />
                        Change Role
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 dark:text-red-400"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {users.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Shield className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium">Access Restricted</p>
            <p className="text-sm">You need Admin or Manager permissions to view users</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
