import { supabase } from '../supabase/client'

const BUCKET = 'bitacora-images'

export class SupabaseStorageService {
  async uploadImage(file: File, path: string): Promise<string> {
    const fileExt = file.name.split('.').pop()
    const fileName = `${path}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`

    const { error } = await supabase.storage.from(BUCKET).upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })

    if (error) throw new Error(`Error uploading image: ${error.message}`)

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName)
    return data.publicUrl
  }

  async deleteImage(url: string): Promise<void> {
    const bucketPrefix = `${supabase.storage.from(BUCKET).getPublicUrl('').data.publicUrl}`
    const path = url.replace(bucketPrefix, '')

    const { error } = await supabase.storage.from(BUCKET).remove([path])
    if (error) throw new Error(`Error deleting image: ${error.message}`)
  }
}
