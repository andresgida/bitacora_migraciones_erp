import type { UserRoleType } from '../value-objects/enums'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: UserRoleType
  avatar_url: string | null
  created_at: string
  updated_at: string
}
