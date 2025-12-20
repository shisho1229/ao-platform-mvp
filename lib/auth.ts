import { auth } from "@/auth"
import { UserRole } from "@prisma/client"

export async function getSession() {
  return await auth()
}

export async function getCurrentUser() {
  const session = await getSession()
  return session?.user
}

export async function requireAuth() {
  const session = await getSession()
  if (!session?.user) {
    throw new Error("認証が必要です")
  }
  return session.user
}

export async function requireRole(allowedRoles: UserRole[]) {
  const user = await requireAuth()
  if (!allowedRoles.includes(user.role)) {
    throw new Error("権限がありません")
  }
  return user
}

export async function isSuperAdmin() {
  const user = await getCurrentUser()
  return user?.role === "SUPER_ADMIN"
}

export async function isAdmin() {
  const user = await getCurrentUser()
  return user?.role === "ADMIN" || user?.role === "SUPER_ADMIN"
}

export async function isStaff() {
  const user = await getCurrentUser()
  return user?.role === "STAFF" || user?.role === "ADMIN" || user?.role === "SUPER_ADMIN"
}

export async function isUser() {
  const user = await getCurrentUser()
  return user?.role === "USER"
}

export function canViewDocuments(userRole: UserRole) {
  return userRole === "ADMIN" || userRole === "STAFF" || userRole === "SUPER_ADMIN"
}

export function canCreateStory(userRole: UserRole) {
  return userRole === "USER"
}

export function canUploadDocument(userRole: UserRole) {
  return userRole === "ADMIN" || userRole === "STAFF" || userRole === "SUPER_ADMIN"
}

export function canManageStaff(userRole: UserRole) {
  return userRole === "SUPER_ADMIN"
}

export function canManageStories(userRole: UserRole) {
  return userRole === "ADMIN" || userRole === "STAFF" || userRole === "SUPER_ADMIN"
}

export function isSuperAdminEmail(email: string) {
  return email.endsWith("@loohcs.co.jp") || email.endsWith("@juku.loohcs.co.jp")
}
