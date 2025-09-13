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
  Users,
  Eye,
  Loader2
} from 'lucide-react'
import { ROLES, RoleName, Permission } from '@/lib/rbac'
import { toast } from 'sonner'

interface Role {
  id: string
  name: string
  description?: string
  permissions: any
  createdAt: string
  updatedAt: string
  _count: {
    users: number
  }
}

const getRoleColor = (roleName: RoleName) => {
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

const getPermissionCategory = (permission: Permission) => {
  if (permission.startsWith('users.')) return 'User Management'
  if (permission.startsWith('roles.')) return 'Role Management'
  if (permission.startsWith('files.')) return 'File Operations'
  if (permission.startsWith('dashboard.')) return 'Dashboard'
  if (permission.startsWith('activity.')) return 'Activity'
  return 'Other'
}

const groupPermissionsByCategory = (permissions: Permission[]) => {
  const grouped: Record<string, Permission[]> = {}
  permissions.forEach(permission => {
    const category = getPermissionCategory(permission)
    if (!grouped[category]) {
      grouped[category] = []
    }
    grouped[category].push(permission)
  })
  return grouped
}

interface RolesTableProps {
  refreshTrigger?: number
}

export function RolesTable({ refreshTrigger }: RolesTableProps) {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRoles()
  }, [refreshTrigger])

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/roles')
      if (response.ok) {
        const data = await response.json()
        setRoles(data.roles || [])
      } else if (response.status === 403) {
        // User doesn't have permission to view roles
        setRoles([])
        toast.error('You do not have permission to view roles')
      } else {
        toast.error('Failed to load roles')
      }
    } catch (error) {
      console.error('Error fetching roles:', error)
      toast.error('Failed to load roles')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (roleId: string) => {
    console.log('Edit role:', roleId)
  }

  const handleDelete = async (roleId: string) => {
    if (!confirm('Are you sure you want to delete this role?')) return

    try {
      const response = await fetch(`/api/roles/${roleId}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        setRoles(prev => prev.filter(role => role.id !== roleId))
        toast.success('Role deleted successfully')
      } else {
        toast.error('Failed to delete role')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete role')
    }
  }

  const handleViewPermissions = (roleId: string) => {
    console.log('View permissions for role:', roleId)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Roles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
            <span className="ml-2 text-gray-500">Loading roles...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Roles ({roles.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => {
                const permissions = Array.isArray(role.permissions) ? role.permissions : []
                const groupedPermissions = groupPermissionsByCategory(permissions)
                const totalPermissions = permissions.length
                
                return (
                  <TableRow key={role.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                          <Shield className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {role.name}
                          </div>
                          <Badge className={getRoleColor(role.name)}>
                            {role.name}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600 dark:text-gray-300 max-w-xs">
                      {role.description}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium">
                          {role._count?.users || 0}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {totalPermissions} permissions
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {Object.keys(groupedPermissions).slice(0, 3).map(category => (
                            <Badge key={category} variant="outline" className="text-xs">
                              {category}
                            </Badge>
                          ))}
                          {Object.keys(groupedPermissions).length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{Object.keys(groupedPermissions).length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewPermissions(role.id)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Permissions
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(role.id)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Role
                          </DropdownMenuItem>
                          {role.name !== 'SuperAdmin' && (
                            <DropdownMenuItem 
                              onClick={() => handleDelete(role.id)}
                              className="text-red-600 dark:text-red-400"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          
          {roles.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Shield className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">Access Restricted</p>
              <p className="text-sm">You need Admin permissions to view roles</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Permissions Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Permission Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(ROLES).map((role) => {
              const groupedPermissions = groupPermissionsByCategory(role.permissions)
              
              return (
                <div key={role.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {role.name}
                    </h4>
                    <Badge className={getRoleColor(role.name)}>
                      {role.permissions.length} permissions
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    {Object.entries(groupedPermissions).map(([category, permissions]) => (
                      <div key={category}>
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                          {category}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {permissions.map(permission => (
                            <Badge key={permission} variant="outline" className="text-xs">
                              {permission.split('.')[1]}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
