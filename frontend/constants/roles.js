// constants/roles.js

// Simple user role constants - only 2 roles
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin'
};

// Role display names
export const ROLE_DISPLAY_NAMES = {
  [USER_ROLES.USER]: 'User',
  [USER_ROLES.ADMIN]: 'Admin'
};

// Simple permission checks - admin has all permissions, user has basic permissions
export const canWritePosts = (userRole) => {
  return userRole === USER_ROLES.ADMIN;
};

export const canViewAllProfiles = (userRole) => {
  return userRole === USER_ROLES.ADMIN;
};

export const hasAdminAccess = (userRole) => {
  return userRole === USER_ROLES.ADMIN;
};

export const isAdmin = (userRole) => {
  return userRole === USER_ROLES.ADMIN;
};

export const isUser = (userRole) => {
  return userRole === USER_ROLES.USER;
};

export const getRoleDisplayName = (role) => {
  return ROLE_DISPLAY_NAMES[role] || ROLE_DISPLAY_NAMES[USER_ROLES.USER];
};
