// RBAC (Role-Based Access Control) types and utilities

export type Permission = 
  | 'users.read'
  | 'users.create'
  | 'users.update'
  | 'users.delete'
  | 'roles.read'
  | 'roles.create'
  | 'roles.update'
  | 'roles.delete'
  | 'files.upload'
  | 'files.read'
  | 'files.delete'
  | 'dashboard.read'
  | 'activity.read'

export type RoleName = 'SuperAdmin' | 'Admin' | 'Manager' | 'User' | 'Guest'

export interface Role {
  id: string
  name: RoleName
  description: string
  permissions: Permission[]
}

// Define the 5 distinct roles with their permissions
export const ROLES: Record<RoleName, Role> = {
  SuperAdmin: {
    id: 'super-admin',
    name: 'SuperAdmin',
    description: 'Full system access with all permissions',
    permissions: [
      'users.read', 'users.create', 'users.update', 'users.delete',
      'roles.read', 'roles.create', 'roles.update', 'roles.delete',
      'files.upload', 'files.read', 'files.delete',
      'dashboard.read', 'activity.read'
    ]
  },
  Admin: {
    id: 'admin',
    name: 'Admin',
    description: 'Administrative access with user and file management',
    permissions: [
      'users.read', 'users.create', 'users.update', 'users.delete',
      'roles.read', 'roles.update',
      'files.upload', 'files.read', 'files.delete',
      'dashboard.read', 'activity.read'
    ]
  },
  Manager: {
    id: 'manager',
    name: 'Manager',
    description: 'Management access with limited administrative functions',
    permissions: [
      'users.read', 'users.update',
      'files.upload', 'files.read',
      'dashboard.read', 'activity.read'
    ]
  },
  User: {
    id: 'user',
    name: 'User',
    description: 'Standard user with basic file operations',
    permissions: [
      'files.upload', 'files.read',
      'dashboard.read'
    ]
  },
  Guest: {
    id: 'guest',
    name: 'Guest',
    description: 'Limited access for viewing only',
    permissions: [
      'dashboard.read'
    ]
  }
}

// Permission checking utility
export function hasPermission(userRole: RoleName, permission: Permission): boolean {
  const role = ROLES[userRole]
  return role.permissions.includes(permission)
}

// Get all permissions for a role
export function getRolePermissions(roleName: RoleName): Permission[] {
  return ROLES[roleName].permissions
}

// Check if user can access a specific resource
export function canAccess(userRole: RoleName, resource: string, action: string): boolean {
  const permission = `${resource}.${action}` as Permission
  return hasPermission(userRole, permission)
}
