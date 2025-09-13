'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Upload, Shield, Activity, Loader2 } from 'lucide-react'

interface DashboardStats {
  totalUsers: number
  totalFiles: number
  activeRoles: number
  recentActivity: number
}

const statsConfig = [
  {
    name: 'Total Users',
    key: 'totalUsers' as keyof DashboardStats,
    icon: Users,
  },
  {
    name: 'Files Uploaded',
    key: 'totalFiles' as keyof DashboardStats,
    icon: Upload,
  },
  {
    name: 'Active Roles',
    key: 'activeRoles' as keyof DashboardStats,
    icon: Shield,
  },
  {
    name: 'Recent Activity',
    key: 'recentActivity' as keyof DashboardStats,
    icon: Activity,
  },
]

export function DashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statsConfig.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {stat.name}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {statsConfig.map((stat) => (
        <Card key={stat.name}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {stat.name}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats ? stats[stat.key].toLocaleString() : '0'}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Real-time data
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
