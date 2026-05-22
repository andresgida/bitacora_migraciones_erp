export type AuditAction = 'INSERT' | 'UPDATE' | 'DELETE'

export interface AuditLog {
  id: number
  table_name: string
  record_id: number
  action: AuditAction
  old_data: Record<string, unknown> | null
  new_data: Record<string, unknown> | null
  user_id: string | null
  user_email: string | null
  created_at: string
}
