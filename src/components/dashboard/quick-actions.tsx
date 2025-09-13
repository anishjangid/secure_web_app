'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, Users, Shield, FileText } from 'lucide-react'
import Link from 'next/link'

const quickActions = [
  {
    name: 'Upload File',
    description: 'Upload a new file with security scanning',
    href: '/dashboard/upload',
    icon: Upload,
    color: 'bg-green-500 hover:bg-green-600',
  },
  {
    name: 'Manage Users',
    description: 'View and manage user accounts',
    href: '/dashboard/users',
    icon: Users,
    color: 'bg-blue-500 hover:bg-blue-600',
  },
  {
    name: 'Manage Roles',
    description: 'Configure roles and permissions',
    href: '/dashboard/roles',
    icon: Shield,
    color: 'bg-purple-500 hover:bg-purple-600',
  },
  {
    name: 'View Activity',
    description: 'Check recent system activity',
    href: '/dashboard/activity',
    icon: FileText,
    color: 'bg-orange-500 hover:bg-orange-600',
  },
]

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickActions.map((action) => (
            <Link key={action.name} href={action.href}>
              <Button
                variant="outline"
                className="w-full h-auto p-4 flex flex-col items-start space-y-2 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <div className="flex items-center space-x-3 w-full">
                  <div className={`p-2 rounded-lg ${action.color} text-white flex-shrink-0`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <div className="font-medium text-gray-900 dark:text-white truncate">
                      {action.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                      {action.description}
                    </div>
                  </div>
                </div>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
