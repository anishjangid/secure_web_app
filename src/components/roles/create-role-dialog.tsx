'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Loader2 } from 'lucide-react'
import { Permission } from '@/lib/rbac'
import { toast } from 'sonner'

const permissionCategories = [
  {
    name: 'User Management',
    permissions: [
      { id: 'users.read', label: 'View Users' },
      { id: 'users.create', label: 'Create Users' },
      { id: 'users.update', label: 'Edit Users' },
      { id: 'users.delete', label: 'Delete Users' },
    ] as { id: Permission; label: string }[],
  },
  {
    name: 'Role Management',
    permissions: [
      { id: 'roles.read', label: 'View Roles' },
      { id: 'roles.create', label: 'Create Roles' },
      { id: 'roles.update', label: 'Edit Roles' },
      { id: 'roles.delete', label: 'Delete Roles' },
    ] as { id: Permission; label: string }[],
  },
  {
    name: 'File Operations',
    permissions: [
      { id: 'files.upload', label: 'Upload Files' },
      { id: 'files.read', label: 'View Files' },
      { id: 'files.delete', label: 'Delete Files' },
    ] as { id: Permission; label: string }[],
  },
  {
    name: 'Dashboard & Activity',
    permissions: [
      { id: 'dashboard.read', label: 'View Dashboard' },
      { id: 'activity.read', label: 'View Activity Log' },
    ] as { id: Permission; label: string }[],
  },
]

interface CreateRoleDialogProps {
  onRoleCreated?: () => void // Callback to refresh roles list
}

export function CreateRoleDialog({ onRoleCreated }: CreateRoleDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as Permission[],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.permissions.length === 0) {
      toast.error('Please select at least one permission')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          permissions: formData.permissions,
        }),
      })

      if (response.ok) {
        toast.success('Role created successfully!')
        setOpen(false)
        setFormData({
          name: '',
          description: '',
          permissions: [],
        })
        
        // Refresh the roles list if callback provided
        if (onRoleCreated) {
          onRoleCreated()
        }
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to create role')
      }
    } catch (error) {
      console.error('Create role error:', error)
      toast.error('Failed to create role')
    } finally {
      setLoading(false)
    }
  }

  const handlePermissionChange = (permission: Permission, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: checked
        ? [...prev.permissions, permission]
        : prev.permissions.filter(p => p !== permission)
    }))
  }

  const handleSelectAll = (categoryPermissions: { id: Permission; label: string }[], checked: boolean) => {
    setFormData(prev => {
      const categoryPermissionIds = categoryPermissions.map(p => p.id)
      const otherPermissions = prev.permissions.filter(p => !categoryPermissionIds.includes(p))
      return {
        ...prev,
        permissions: checked
          ? [...otherPermissions, ...categoryPermissionIds]
          : otherPermissions
      }
    })
  }

  const isCategorySelected = (categoryPermissions: { id: Permission; label: string }[]) => {
    return categoryPermissions.every(p => formData.permissions.includes(p.id))
  }

  const isCategoryPartiallySelected = (categoryPermissions: { id: Permission; label: string }[]) => {
    const selectedCount = categoryPermissions.filter(p => formData.permissions.includes(p.id)).length
    return selectedCount > 0 && selectedCount < categoryPermissions.length
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Role
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Role</DialogTitle>
          <DialogDescription>
            Define a new role with specific permissions for your organization.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Role Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Content Manager"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the role's responsibilities..."
                rows={3}
              />
            </div>

            <div className="space-y-4">
              <Label>Permissions</Label>
              <div className="space-y-4">
                {permissionCategories.map((category) => (
                  <div key={category.name} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category.name}`}
                        checked={isCategorySelected(category.permissions)}
                        onCheckedChange={(checked) => 
                          handleSelectAll(category.permissions, checked as boolean)
                        }
                      />
                      <Label 
                        htmlFor={`category-${category.name}`}
                        className="font-medium text-gray-900 dark:text-white"
                      >
                        {category.name}
                      </Label>
                      {isCategoryPartiallySelected(category.permissions) && (
                        <span className="text-xs text-gray-500">(partial)</span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ml-6">
                      {category.permissions.map((permission) => (
                        <div key={permission.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={permission.id}
                            checked={formData.permissions.includes(permission.id)}
                            onCheckedChange={(checked) => 
                              handlePermissionChange(permission.id, checked as boolean)
                            }
                          />
                          <Label 
                            htmlFor={permission.id}
                            className="text-sm text-gray-700 dark:text-gray-300"
                          >
                            {permission.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={formData.permissions.length === 0 || loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                `Create Role (${formData.permissions.length} permissions)`
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
