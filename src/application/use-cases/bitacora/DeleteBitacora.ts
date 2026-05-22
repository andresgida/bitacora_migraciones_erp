import type { IBitacoraRepository } from '@/domain/repositories/IBitacoraRepository'
import type { IAuditLogRepository } from '@/domain/repositories/IAuditLogRepository'

export class DeleteBitacoraUseCase {
  constructor(
    private readonly bitacoraRepo: IBitacoraRepository,
    private readonly auditRepo: IAuditLogRepository,
  ) {}

  async execute(id: number, userId?: string, userEmail?: string): Promise<void> {
    const existing = await this.bitacoraRepo.getById(id)

    await this.bitacoraRepo.delete(id)

    await this.auditRepo.create({
      table_name: 'bitacora',
      record_id: id,
      action: 'DELETE',
      old_data: existing as unknown as Record<string, unknown>,
      new_data: null,
      user_id: userId,
      user_email: userEmail,
    })
  }
}
