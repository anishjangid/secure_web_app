'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { 
  Filter, 
  Search, 
  Calendar as CalendarIcon,
  X
} from 'lucide-react'
import { format } from 'date-fns'

const actionTypes = [
  { value: 'all', label: 'All Actions' },
  { value: 'upload', label: 'File Upload' },
  { value: 'login', label: 'Login' },
  { value: 'role_create', label: 'Role Created' },
  { value: 'role_update', label: 'Role Updated' },
  { value: 'role_delete', label: 'Role Deleted' },
  { value: 'permission_update', label: 'Permission Updated' },
  { value: 'file_delete', label: 'File Deleted' },
  { value: 'user_edit', label: 'User Edited' },
  { value: 'user_create', label: 'User Created' },
  { value: 'user_delete', label: 'User Deleted' },
]

const timeRanges = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'custom', label: 'Custom Range' },
]

interface ActivityFiltersProps {
  onFiltersChange: (filters: {
    search?: string
    actionType?: string
    timeRange?: string
    dateFrom?: Date
    dateTo?: Date
  }) => void
}

export function ActivityFilters({ onFiltersChange }: ActivityFiltersProps) {
  const [filters, setFilters] = useState({
    search: '',
    actionType: 'all',
    timeRange: 'all',
    dateFrom: undefined as Date | undefined,
    dateTo: undefined as Date | undefined,
  })

  const handleFilterChange = (key: string, value: string | Date | undefined) => {
    const newFilters = {
      ...filters,
      [key]: value
    }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      actionType: 'all',
      timeRange: 'all',
      dateFrom: undefined,
      dateTo: undefined,
    }
    setFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }

  const hasActiveFilters = filters.search || 
    filters.actionType !== 'all' || 
    filters.timeRange !== 'all' ||
    filters.dateFrom ||
    filters.dateTo

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Filter className="h-5 w-5" />
          <span>Filters</span>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="ml-auto"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Search activities..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Action Type */}
          <div className="space-y-2">
            <Label>Action Type</Label>
            <Select
              value={filters.actionType}
              onValueChange={(value) => handleFilterChange('actionType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select action type" />
              </SelectTrigger>
              <SelectContent>
                {actionTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Time Range */}
          <div className="space-y-2">
            <Label>Time Range</Label>
            <Select
              value={filters.timeRange}
              onValueChange={(value) => handleFilterChange('timeRange', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                {timeRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date From */}
          <div className="space-y-2">
            <Label>From Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateFrom ? format(filters.dateFrom, 'PPP') : 'Select date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.dateFrom}
                  onSelect={(date) => handleFilterChange('dateFrom', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Custom Date Range */}
        {filters.timeRange === 'custom' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <Label>To Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateTo ? format(filters.dateTo, 'PPP') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.dateTo}
                    onSelect={(date) => handleFilterChange('dateTo', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  )
}
