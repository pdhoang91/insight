// constants/roles.go
package constants

// UserRole represents the type for user roles
type UserRole string

// Simple user role constants - only 2 roles
const (
	RoleUser  UserRole = "user"
	RoleAdmin UserRole = "admin"
)

// Simple helper functions

// CanWritePosts checks if a role can write posts (admin only)
func CanWritePosts(role UserRole) bool {
	return role == RoleAdmin
}

// CanViewAllProfiles checks if a role can view all profiles (admin only)
func CanViewAllProfiles(role UserRole) bool {
	return role == RoleAdmin
}

// HasAdminAccess checks if a role has admin access (admin only)
func HasAdminAccess(role UserRole) bool {
	return role == RoleAdmin
}

// IsAdmin checks if role is admin
func IsAdmin(role UserRole) bool {
	return role == RoleAdmin
}

// IsUser checks if role is user
func IsUser(role UserRole) bool {
	return role == RoleUser
}

// IsValidRole checks if a role is valid
func IsValidRole(role string) bool {
	switch UserRole(role) {
	case RoleUser, RoleAdmin:
		return true
	default:
		return false
	}
}

// GetDefaultRole returns the default role for new users
func GetDefaultRole() UserRole {
	return RoleUser
}

// GetRoleDisplayName returns a human-readable role name
func GetRoleDisplayName(role UserRole) string {
	switch role {
	case RoleAdmin:
		return "Admin"
	case RoleUser:
		return "User"
	default:
		return "User"
	}
}
