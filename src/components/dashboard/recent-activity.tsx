'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'

interface Activity {
  id: string
  action: string
  details: any
  createdAt: string
  user: {
    firstName: string
    lastName: string
    email: string
    imageUrl?: string
  }
}

const getActivityIcon = (action: string) => {
  if (action.includes('upload')) return '📁'
  if (action.includes('role')) return '👥'
  if (action.includes('permission') || action.includes('user')) return '🔐'
  if (action.includes('delete')) return '🗑️'
  if (action.includes('download')) return '⬇️'
  if (action.includes('login') || action.includes('sign')) return '🔑'
  return '📝'
}

const getActivityColor = (action: string) => {
  if (action.includes('upload')) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
  if (action.includes('role')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
  if (action.includes('permission') || action.includes('user')) return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
  if (action.includes('delete')) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  if (action.includes('download')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
  if (action.includes('login') || action.includes('sign')) return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
}

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
  return date.toLocaleDateString()
}

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchActivities()
  }, [])

  const fetchActivities = async () => {
    try {
      const response = await fetch('/api/activity?limit=5')
      if (response.ok) {
        const data = await response.json()
        setActivities(data.activities || [])
      }
    } catch (error) {
      console.error('Error fetching activities:', error)
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
            <span className="ml-2 text-gray-500">Loading activities...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Recent Activity</span>
          <Badge variant="secondary" className="ml-auto">
            {activities.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const userName = `${activity.user.firstName} ${activity.user.lastName}`.trim() || activity.user.email
            const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase()
            const target = activity.details?.fileName || activity.details?.roleName || activity.details?.newUserEmail || ''
            
            return (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700">
                    <span className="text-sm">
                      {getActivityIcon(activity.action)}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={activity.user.imageUrl} />
                      <AvatarFallback className="text-xs">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {userName}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {activity.action}
                    {target && (
                      <span className="font-medium text-gray-900 dark:text-white">
                        {' '}{target}
                      </span>
                    )}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getActivityColor(activity.action)}`}
                    >
                      {activity.action.split(' ')[0]}
                    </Badge>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTimeAgo(activity.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
          
          {activities.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No recent activity
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
