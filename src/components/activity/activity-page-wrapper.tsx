'use client'

import { useState } from 'react'
import { ActivityFilters } from '@/components/activity/activity-filters'
import { ActivityLogTable } from '@/components/activity/activity-log-table'

export function ActivityPageWrapper() {
  const [filters, setFilters] = useState<{
    search?: string
    actionType?: string
    timeRange?: string
    dateFrom?: Date
    dateTo?: Date
  }>({})

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
  }

  return (
    <div className="space-y-6">
      <ActivityFilters onFiltersChange={handleFiltersChange} />
      <ActivityLogTable filters={filters} />
    </div>
  )
}
