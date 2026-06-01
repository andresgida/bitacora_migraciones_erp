import { useEffect, useRef, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Upload, X } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog'
import { BitacoraFormSchema, type BitacoraFormData } from '@/application/dtos/BitacoraDTO'
import type { Bitacora } from '@/domain/entities/Bitacora'
import { SupabaseStorageService } from '@/infrastructure/services/SupabaseStorageService'
import { useCatalogOptions } from '@/presentation/hooks/useCatalog'

interface BitacoraFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: BitacoraFormData) => void
  isLoading?: boolean
  defaultValues?: Partial<Bitacora>
  mode?: 'create' | 'edit'
}

const storage = new SupabaseStorageService()

function toCatalogArray(data?: { value: string; active: boolean }[]): string[] {
  return (data ?? []).filter((d) => d.active).map((d) => d.value)
}

function SelectField({
  control,
  name,
  label,
  placeholder,
  options,
  required,
  disabled,
}: {
  control: ReturnType<typeof useForm<BitacoraFormData>>['control']
  name: keyof BitacoraFormData
  label: string
  placeholder?: string
  options: readonly string[]
  required?: boolean
  disabled?: boolean
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Controller
        control={control}
        name={name}
        render={({ field, fieldState }) => (
          <>
            <Select
              value={
                field.value && String(field.value).trim() !== ''
                  ? (field.value as string)
                  : '__NONE__'
              }
              onValueChange={(v) => field.onChange(v === '__NONE__' ? null : v)}
              disabled={disabled}
            >
              <SelectTrigger className={fieldState.error ? 'border-destructive' : ''}>
                <SelectValue placeholder={placeholder ?? `Seleccionar ${label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                <SelectItem value="__NONE__">
                  <span className="text-muted-foreground">— Sin seleccionar —</span>
                </SelectItem>
                {options.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldState.error && (
              <p className="text-xs text-destructive">{fieldState.error.message}</p>
            )}
          </>
        )}
      />
    </div>
  )
}

export default function BitacoraForm({
  open,
  onClose,
  onSubmit,
  isLoading,
  defaultValues,
  mode = 'create',
}: BitacoraFormProps) {
  const [uploadingImg, setUploadingImg] = useState<'img1' | 'img2' | null>(null)

  const { data: catEmpresa } = useCatalogOptions('empresa')
  const { data: catEstado } = useCatalogOptions('estado')
  const { data: catPrioridad } = useCatalogOptions('prioridad')
  const { data: catSuite } = useCatalogOptions('suite')
  const { data: catModulo } = useCatalogOptions('modulo')
  const { data: catClasificacion } = useCatalogOptions('clasificacion')
  const { data: catProceso } = useCatalogOptions('proceso')
  const { data: catCsm } = useCatalogOptions('csm')
  const { data: catLider } = useCatalogOptions('lider_novedad')
  const { data: catEncargadoFds } = useCatalogOptions('encargado_fds')
  const { data: catSegmentacion } = useCatalogOptions('segmentacion_fds')
  const { data: catEstadoFds } = useCatalogOptions('estado_fds')
  const { data: catImpacto } = useCatalogOptions('impacto_fds')
  const img1Ref = useRef<HTMLInputElement>(null)
  const img2Ref = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BitacoraFormData>({
    resolver: zodResolver(BitacoraFormSchema),
    defaultValues: {
      prioridad_servicio: 'REVISION FORMACION',
      solucionado: 'En revisión',
      ...defaultValues,
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        prioridad_servicio: 'REVISION FORMACION',
        solucionado: 'En revisión',
        ...defaultValues,
      })
    }
  }, [open, defaultValues, reset])

  const img1Url = watch('imagen_1_url')
  const img2Url = watch('imagen_2_url')

  async function handleImageUpload(file: File, field: 'imagen_1_url' | 'imagen_2_url') {
    setUploadingImg(field === 'imagen_1_url' ? 'img1' : 'img2')
    try {
      const url = await storage.uploadImage(file, 'bitacora')
      setValue(field, url)
    } catch {
      // error handled by service
    } finally {
      setUploadingImg(null)
    }
  }

  const tabSections = [
    {
      id: 'general',
      label: 'General',
      fields: (
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 space-y-1.5">
            <Label htmlFor="nombre_empresa">
              Empresa <span className="text-destructive">*</span>
            </Label>
            <Controller
              control={control}
              name="nombre_empresa"
              render={({ field, fieldState }) => (
                <>
                  <Select
                    value={field.value ?? ''}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className={fieldState.error ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Seleccionar empresa" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {toCatalogArray(catEmpresa).map((emp) => (
                        <SelectItem key={emp} value={emp}>
                          {emp}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.error && (
                    <p className="text-xs text-destructive">{fieldState.error.message}</p>
                  )}
                </>
              )}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="fecha_novedad">Fecha novedad</Label>
            <Input type="date" {...register('fecha_novedad')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fecha_definiciones">Fecha definiciones</Label>
            <Input type="date" {...register('fecha_definiciones')} />
          </div>

          <SelectField control={control} name="estado" label="Estado" options={toCatalogArray(catEstado)} />
          <div className="space-y-1.5">
            <Label htmlFor="base_datos">Base de datos</Label>
            <Input placeholder="Nombre de la BD" {...register('base_datos')} />
          </div>
        </div>
      ),
    },
    {
      id: 'tecnico',
      label: 'Técnico',
      fields: (
        <div className="grid grid-cols-2 gap-4">
          <SelectField control={control} name="suite" label="Suite" options={toCatalogArray(catSuite)} />
          <SelectField control={control} name="modulo" label="Módulo" options={toCatalogArray(catModulo)} />
          <SelectField
            control={control}
            name="clasificacion"
            label="Clasificación"
            options={toCatalogArray(catClasificacion)}
          />
          <SelectField
            control={control}
            name="version_anterior"
            label="Proceso"
            options={toCatalogArray(catProceso)}
          />
          <SelectField control={control} name="csm" label="CSM" options={toCatalogArray(catCsm)} />
          <SelectField
            control={control}
            name="lider_novedad"
            label="Líder novedad"
            options={toCatalogArray(catLider)}
          />
        </div>
      ),
    },
    {
      id: 'descripcion',
      label: 'Descripción',
      fields: (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="descripcion_error">Descripción del error</Label>
            <Textarea
              rows={4}
              placeholder="Describa detalladamente el error o novedad..."
              {...register('descripcion_error')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Imagen 1</Label>
              <div className="flex items-center gap-2">
                <input
                  ref={img1Ref}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleImageUpload(file, 'imagen_1_url')
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  disabled={uploadingImg === 'img1'}
                  onClick={() => img1Ref.current?.click()}
                >
                  {uploadingImg === 'img1' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  Subir
                </Button>
                {img1Url && (
                  <div className="flex items-center gap-1 min-w-0">
                    <a
                      href={img1Url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-primary truncate max-w-[120px] hover:underline"
                    >
                      Ver imagen
                    </a>
                    <button
                      type="button"
                      onClick={() => setValue('imagen_1_url', null)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Imagen 2</Label>
              <div className="flex items-center gap-2">
                <input
                  ref={img2Ref}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleImageUpload(file, 'imagen_2_url')
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  disabled={uploadingImg === 'img2'}
                  onClick={() => img2Ref.current?.click()}
                >
                  {uploadingImg === 'img2' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  Subir
                </Button>
                {img2Url && (
                  <div className="flex items-center gap-1 min-w-0">
                    <a
                      href={img2Url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-primary truncate max-w-[120px] hover:underline"
                    >
                      Ver imagen
                    </a>
                    <button
                      type="button"
                      onClick={() => setValue('imagen_2_url', null)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="link_video">Link de video o detalle</Label>
            <Input type="text" placeholder="https://... o enlace de SharePoint" {...register('link_video')} />
            {errors.link_video && (
              <p className="text-xs text-destructive">{errors.link_video.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <SelectField
              control={control}
              name="prioridad_servicio"
              label="Prioridad Servicio"
              options={toCatalogArray(catPrioridad)}
              disabled={mode === 'create'}
            />
            <div className="space-y-1.5">
              <Label htmlFor="solucionado">Solucionado</Label>
              <Controller
                control={control}
                name="solucionado"
                render={({ field }) => (
                  <Select
                    value={
                      field.value && String(field.value).trim() !== ''
                        ? field.value
                        : '__NONE__'
                    }
                    onValueChange={(v) => field.onChange(v === '__NONE__' ? null : v)}
                    disabled={mode === 'create'}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__NONE__">
                        <span className="text-muted-foreground">— Sin seleccionar —</span>
                      </SelectItem>
                      <SelectItem value="Si">Si</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                      <SelectItem value="En revisión">En revisión</SelectItem>
                      <SelectItem value="Devuelto a FDS">Devuelto a FDS</SelectItem>
                      <SelectItem value="Devuelto a Servicios">Devuelto a Servicios</SelectItem>
                      <SelectItem value="Revisión CSM-Cliente">Revisión CSM-Cliente</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="observacion_formacion">Observación formación</Label>
            <Textarea rows={3} {...register('observacion_formacion')} />
          </div>
        </div>
      ),
    },
    {
      id: 'fds',
      label: 'FDS',
      fields: (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="fecha_tentativa_solucion">Fecha Robot Oficial</Label>
            <Input type="date" {...register('fecha_tentativa_solucion')} />
          </div>
          <SelectField
            control={control}
            name="estado_fds"
            label="Estado FDS"
            options={toCatalogArray(catEstadoFds)}
          />

          <div className="col-span-2 space-y-1.5">
            <Label htmlFor="observaciones_fds">Observaciones FDS</Label>
            <Textarea rows={3} {...register('observaciones_fds')} />
          </div>

          <SelectField
            control={control}
            name="encargado_fds"
            label="Encargado FDS"
            options={toCatalogArray(catEncargadoFds)}
          />
          <SelectField
            control={control}
            name="segmentacion_fds"
            label="Segmentación FDS"
            options={toCatalogArray(catSegmentacion)}
          />
          <SelectField
            control={control}
            name="impacto_fds"
            label="Impacto FDS"
            options={toCatalogArray(catImpacto)}
          />

          <div className="space-y-1.5">
            <Label htmlFor="azure_url">Azure URL</Label>
            <Input type="url" placeholder="https://..." {...register('azure_url')} />
            {errors.azure_url && (
              <p className="text-xs text-destructive">{errors.azure_url.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="fecha_robot_beta">Fecha robot beta</Label>
            <Input type="date" {...register('fecha_robot_beta')} />
            {errors.fecha_robot_beta && (
              <p className="text-xs text-destructive">{errors.fecha_robot_beta.message}</p>
            )}
          </div>
        </div>
      ),
    },
  ]

  const [activeTab, setActiveTab] = useState('general')

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>
            {mode === 'create' ? 'Nueva incidencia' : 'Editar incidencia'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex border-b px-6">
          {tabSections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveTab(section.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === section.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4">
            {tabSections.find((s) => s.id === activeTab)?.fields}
          </div>

          <DialogFooter className="px-6 py-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || !!uploadingImg}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'create' ? 'Crear registro' : 'Guardar cambios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
