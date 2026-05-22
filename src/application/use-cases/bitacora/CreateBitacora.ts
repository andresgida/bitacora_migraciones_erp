import type { IBitacoraRepository } from '@/domain/repositories/IBitacoraRepository'
import type { IAuditLogRepository } from '@/domain/repositories/IAuditLogRepository'
import type { Bitacora, BitacoraCreate } from '@/domain/entities/Bitacora'

export class CreateBitacoraUseCase {
  constructor(
    private readonly bitacoraRepo: IBitacoraRepository,
    private readonly auditRepo: IAuditLogRepository,
  ) {}

  async execute(data: BitacoraCreate, userId?: string, userEmail?: string): Promise<Bitacora> {
    const bitacora = await this.bitacoraRepo.create(data)

    await this.auditRepo.create({
      table_name: 'bitacora',
      record_id: bitacora.id,
      action: 'INSERT',
      old_data: null,
      new_data: bitacora as unknown as Record<string, unknown>,
      user_id: userId,
      user_email: userEmail,
    })

    return bitacora
  }
}
