export type GetCurrentUserResponse = {
  authenticated: false
} | {
  authenticated: true
  userId: string
  email: string
  tenantId: string
  initials: string
  role: 'USER' | 'OWNER'
  signupCompleted: boolean
}
