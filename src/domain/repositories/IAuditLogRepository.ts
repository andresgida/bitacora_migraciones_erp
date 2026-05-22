import type { AuditLog, AuditAction } from '../entities/AuditLog'

export interface IAuditLogRepository {
  create(data: {
    table_name: string
    record_id: number
    action: AuditAction
    old_data?: Record<string, unknown> | null
    new_data?: Record<string, unknown> | null
    user_id?: string | null
    user_email?: string | null
  }): Promise<AuditLog>

  getByRecordId(recordId: number, tableName: string): Promise<AuditLog[]>

  getRecent(limit?: number): Promise<AuditLog[]>
}
