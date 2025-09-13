'use client'

import { useState } from 'react'
import { CreateRoleDialog } from '@/components/roles/create-role-dialog'
import { RolesTable } from '@/components/roles/roles-table'

export function RolesPageWrapper() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleRoleCreated = () => {
    // Increment the trigger to refresh the roles list
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Role Management
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Configure roles and permissions for your organization.
          </p>
        </div>
        <CreateRoleDialog onRoleCreated={handleRoleCreated} />
      </div>

      <RolesTable refreshTrigger={refreshTrigger} />
    </div>
  )
}
