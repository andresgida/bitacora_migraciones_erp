import type { IBitacoraRepository } from '@/domain/repositories/IBitacoraRepository'
import type { IAuditLogRepository } from '@/domain/repositories/IAuditLogRepository'
import type { Bitacora, BitacoraUpdate } from '@/domain/entities/Bitacora'

export class UpdateBitacoraUseCase {
  constructor(
    private readonly bitacoraRepo: IBitacoraRepository,
    private readonly auditRepo: IAuditLogRepository,
  ) {}

  async execute(
    id: number,
    data: BitacoraUpdate,
    userId?: string,
    userEmail?: string,
  ): Promise<Bitacora> {
    const existing = await this.bitacoraRepo.getById(id)
    const updated = await this.bitacoraRepo.update(id, data)

    await this.auditRepo.create({
      table_name: 'bitacora',
      record_id: id,
      action: 'UPDATE',
      old_data: existing as unknown as Record<string, unknown>,
      new_data: updated as unknown as Record<string, unknown>,
      user_id: userId,
      user_email: userEmail,
    })

    return updated
  }
}
