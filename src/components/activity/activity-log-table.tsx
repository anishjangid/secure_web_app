'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  User, 
  Upload, 
  Shield, 
  Trash2, 
  Edit, 
  LogIn,
  Calendar,
  Clock,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'

interface Activity {
  id: string
  action: string
  details: any
  ipAddress?: string
  userAgent?: string
  createdAt: string
  user: {
    firstName: string
    lastName: string
    email: string
    imageUrl?: string
  }
}

interface ActivityLogTableProps {
  refreshTrigger?: number
  filters?: {
    search?: string
    actionType?: string
    timeRange?: string
    dateFrom?: Date
    dateTo?: Date
  }
}

// Mock data - in real app, this would come from API
const mockActivities = [
  {
    id: '1',
    user: {
      name: 'John Doe',
      avatar: '/avatars/john.jpg',
      initials: 'JD',
    },
    action: 'uploaded a file',
    target: 'document.pdf',
    type: 'upload',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    timestamp: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    user: {
      name: 'Jane Smith',
      avatar: '/avatars/jane.jpg',
      initials: 'JS',
    },
    action: 'created a new role',
    target: 'Content Manager',
    type: 'role_create',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    timestamp: '2024-01-15T09:15:00Z',
  },
  {
    id: '3',
    user: {
      name: 'Mike Johnson',
      avatar: '/avatars/mike.jpg',
      initials: 'MJ',
    },
    action: 'updated user permissions',
    target: 'Sarah Wilson',
    type: 'permission_update',
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
    timestamp: '2024-01-15T08:45:00Z',
  },
  {
    id: '4',
    user: {
      name: 'Sarah Wilson',
      avatar: '/avatars/sarah.jpg',
      initials: 'SW',
    },
    action: 'deleted a file',
    target: 'old-document.pdf',
    type: 'file_delete',
    ipAddress: '192.168.1.103',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    timestamp: '2024-01-15T07:20:00Z',
  },
  {
    id: '5',
    user: {
      name: 'Admin User',
      avatar: '/avatars/admin.jpg',
      initials: 'AU',
    },
    action: 'signed in',
    target: '',
    type: 'login',
    ipAddress: '192.168.1.104',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    timestamp: '2024-01-15T06:00:00Z',
  },
  {
    id: '6',
    user: {
      name: 'John Doe',
      avatar: '/avatars/john.jpg',
      initials: 'JD',
    },
    action: 'edited user profile',
    target: 'Mike Johnson',
    type: 'user_edit',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    timestamp: '2024-01-14T16:30:00Z',
  },
]

const getActionIcon = (type: string) => {
  switch (type) {
    case 'upload':
      return <Upload className="h-4 w-4" />
    case 'role_create':
    case 'role_update':
    case 'role_delete':
      return <Shield className="h-4 w-4" />
    case 'permission_update':
      return <Shield className="h-4 w-4" />
    case 'file_delete':
      return <Trash2 className="h-4 w-4" />
    case 'user_edit':
    case 'user_create':
    case 'user_delete':
      return <User className="h-4 w-4" />
    case 'login':
      return <LogIn className="h-4 w-4" />
    default:
      return <Edit className="h-4 w-4" />
  }
}

const getActionColor = (type: string) => {
  switch (type) {
    case 'upload':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case 'role_create':
    case 'role_update':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    case 'role_delete':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    case 'permission_update':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    case 'file_delete':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    case 'user_edit':
    case 'user_create':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    case 'user_delete':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    case 'login':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }
}

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  
  if (diffInHours < 1) {
    return 'Just now'
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)} hours ago`
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n.charAt(0))
    .join('')
    .toUpperCase()
}

export function ActivityLogTable({ refreshTrigger, filters }: ActivityLogTableProps) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchActivities()
  }, [refreshTrigger, filters])

  const fetchActivities = async () => {
    try {
      // Build query parameters from filters
      const params = new URLSearchParams()
      
      if (filters?.search) {
        params.append('search', filters.search)
      }
      if (filters?.actionType && filters.actionType !== 'all') {
        params.append('actionType', filters.actionType)
      }
      if (filters?.timeRange && filters.timeRange !== 'all') {
        params.append('timeRange', filters.timeRange)
      }
      if (filters?.dateFrom) {
        params.append('dateFrom', filters.dateFrom.toISOString())
      }
      if (filters?.dateTo) {
        params.append('dateTo', filters.dateTo.toISOString())
      }

      const url = `/api/activity${params.toString() ? `?${params.toString()}` : ''}`
      const response = await fetch(url)
      
      if (response.ok) {
        const data = await response.json()
        setActivities(data.activities || [])
      } else if (response.status === 403) {
        // User doesn't have permission to view activity
        setActivities([])
        toast.error('You do not have permission to view activity logs')
      } else {
        toast.error('Failed to load activity log')
      }
    } catch (error) {
      console.error('Error fetching activities:', error)
      toast.error('Failed to load activity log')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
            <span className="ml-2 text-gray-500">Loading activity log...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity ({activities.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((activity) => (
              <TableRow key={activity.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={activity.user.imageUrl} />
                      <AvatarFallback className="text-xs">
                        {getInitials(activity.user.firstName, activity.user.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {activity.user.firstName} {activity.user.lastName}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <div className={`p-1 rounded ${getActionColor(activity.type)}`}>
                      {getActionIcon(activity.type)}
                    </div>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {activity.action}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {activity.details?.target ? (
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.details.target}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      -
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-600 dark:text-gray-300 font-mono">
                    {activity.ipAddress}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-300">
                    <Clock className="h-3 w-3" />
                    <span>{formatTimestamp(activity.createdAt)}</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {activities.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Shield className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium">Access Restricted</p>
            <p className="text-sm">You need Manager or Admin permissions to view activity logs</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
