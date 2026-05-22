import { supabase } from '../supabase/client'
import type { IAuditLogRepository } from '@/domain/repositories/IAuditLogRepository'
import type { AuditLog, AuditAction } from '@/domain/entities/AuditLog'

export class SupabaseAuditLogRepository implements IAuditLogRepository {
  private readonly table = 'audit_logs'

  async create(data: {
    table_name: string
    record_id: number
    action: AuditAction
    old_data?: Record<string, unknown> | null
    new_data?: Record<string, unknown> | null
    user_id?: string | null
    user_email?: string | null
  }): Promise<AuditLog> {
    const { data: created, error } = await supabase
      .from(this.table)
      .insert(data)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return created as AuditLog
  }

  async getByRecordId(recordId: number, tableName: string): Promise<AuditLog[]> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('record_id', recordId)
      .eq('table_name', tableName)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return (data as AuditLog[]) ?? []
  }

  async getRecent(limit = 20): Promise<AuditLog[]> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw new Error(error.message)
    return (data as AuditLog[]) ?? []
  }
}
