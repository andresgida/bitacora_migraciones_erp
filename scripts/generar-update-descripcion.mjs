// Genera sentencias UPDATE para múltiples campos desde el Excel
// Uso: node scripts/generar-update-descripcion.mjs "ruta\al\archivo.xlsx"

import * as XLSX from 'xlsx'
import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

const filePath = process.argv[2]
if (!filePath) {
  console.error('Uso: node scripts/generar-update-descripcion.mjs "ruta\\al\\archivo.xlsx"')
  process.exit(1)
}

// Campos a actualizar: campo BD → aliases posibles en Excel
const FIELD_ALIASES = {
  link_video: [
    'link_video', 'link video', 'video', 'url video', 'video url',
    'link del video', 'enlace video', 'enlace del video',
  ],
}

const absPath = resolve(filePath)
console.log(`Leyendo: ${absPath}\n`)

const buf = readFileSync(absPath)
const wb = XLSX.read(buf, { type: 'buffer', cellDates: false })
const ws = wb.Sheets[wb.SheetNames[0]]
const rows = XLSX.utils.sheet_to_json(ws, { defval: null, raw: true })

const excelHeaders = Object.keys(rows[0] ?? {})

// Mapear cada campo BD a su columna Excel encontrada
const fieldMap = {}
for (const [dbField, aliases] of Object.entries(FIELD_ALIASES)) {
  const found = excelHeaders.find(h => aliases.includes(h.trim().toLowerCase()))
  if (found) {
    fieldMap[dbField] = found
    console.log(`✅ ${dbField} → columna Excel: "${found}"`)
  } else {
    console.log(`⚠️  ${dbField} → columna NO encontrada (se omite)`)
  }
}

// Correcciones de valor: valor en Excel → valor real en BD
const VALUE_CORRECTIONS = {
  encargado_fds: {
    gulle: 'Guillermo', guille: 'Guillermo', guillermo: 'Guillermo',
    diana: 'Diana', hernan: 'Hernan', hernán: 'Hernan',
    german: 'German', germán: 'German',
    natali: 'Natali', nataly: 'Natali',
  },
}

function correctValue(dbField, raw) {
  const map = VALUE_CORRECTIONS[dbField]
  if (!map) return raw
  const key = String(raw).trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  return map[key] ?? raw
}

if (Object.keys(fieldMap).length === 0) {
  console.error('\nNo se encontró ninguna columna. Columnas disponibles:')
  console.error(excelHeaders.join(', '))
  process.exit(1)
}

console.log(`\nFilas en Excel: ${rows.length}`)

// Generar SQL — fila N del Excel = ID N en la BD
const lines = ['BEGIN;', '']
let count = 0

rows.forEach((row, i) => {
  const id = i + 1
  const sets = []

  for (const [dbField, excelCol] of Object.entries(fieldMap)) {
    const val = row[excelCol]
    if (val === null || val === undefined || String(val).trim() === '') continue
    const corrected = correctValue(dbField, val)
    const escaped = String(corrected).replace(/'/g, "''")
    sets.push(`${dbField} = '${escaped}'`)
  }

  if (sets.length === 0) {
    lines.push(`-- Fila ${id}: todos los campos vacíos, se omite`)
    return
  }

  lines.push(`UPDATE public.bitacora SET ${sets.join(', ')} WHERE id = ${id};`)
  count++
})

lines.push('')
lines.push('COMMIT;')
lines.push('')
lines.push(`-- Total: ${count} registros actualizados`)
lines.push(`-- Campos: ${Object.keys(fieldMap).join(', ')}`)

const output = lines.join('\n')
const outFile = 'scripts/update-descripcion.sql'
writeFileSync(outFile, output, 'utf8')

console.log(`\n✅ SQL generado: ${outFile}`)
console.log(`   Updates generados: ${count}`)
console.log('\nPega el contenido en Supabase → SQL Editor y ejecuta.')
