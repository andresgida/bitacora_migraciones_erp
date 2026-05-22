# Bitácora Migraciones 2026

Sistema web profesional para gestión de incidencias, errores y novedades durante procesos de migración tecnológica ERP.

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite + TypeScript |
| Estilos | TailwindCSS + shadcn/ui |
| Estado | Zustand + TanStack Query v5 |
| Formularios | React Hook Form + Zod |
| Router | React Router DOM v6 |
| Backend | Supabase (PostgreSQL + Auth + Storage + RLS) |
| Tablas | TanStack Table v8 |
| Export | SheetJS (xlsx) |
| Toast | Sonner |
| Deploy | Vercel |

## Arquitectura

```
src/
├── domain/             # Entidades, interfaces, value objects
│   ├── entities/
│   ├── repositories/
│   └── value-objects/
├── application/        # Casos de uso, DTOs
│   ├── dtos/
│   └── use-cases/
├── infrastructure/     # Supabase repos, servicios
│   ├── repositories/
│   ├── services/
│   └── supabase/
└── presentation/       # Componentes, páginas, hooks, stores
    ├── components/
    │   ├── bitacora/
    │   ├── common/
    │   ├── dashboard/
    │   ├── layout/
    │   └── ui/
    ├── constants/
    ├── hooks/
    ├── pages/
    └── stores/
```

## Inicio rápido

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Editar `.env`:
```
VITE_SUPABASE_URL=https://xxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxxx
```

### 3. Configurar Supabase

1. Crear proyecto en [supabase.com](https://supabase.com)
2. Ejecutar `supabase/schema.sql` en el SQL Editor de Supabase
3. Crear usuario administrador en Authentication > Users
4. Actualizar su rol: `UPDATE profiles SET role = 'admin' WHERE email = 'tu@email.com';`

### 4. Ejecutar en desarrollo

```bash
npm run dev
```

## Roles y permisos

| Rol | Permisos |
|-----|---------|
| `admin` | CRUD completo, exportar, ver auditoría |
| `readonly` | Solo lectura y exportación |

Los permisos se aplican tanto en el frontend (UI) como en el backend (RLS de Supabase).

## Despliegue en Vercel

```bash
npm run build
```

O conectar el repositorio a Vercel y configurar las variables de entorno en el dashboard.

## Funcionalidades principales

- **Bitácora**: Tabla de incidencias con 26+ campos, filtros avanzados, búsqueda global, paginación, ordenamiento
- **Dashboard**: Métricas en tiempo real por estado, prioridad y estado FDS
- **Formulario**: Modal con 4 pestañas (General, Técnico, Descripción, FDS) y upload de imágenes
- **Export**: Descarga Excel con todos los campos
- **Auditoría**: Historial de cambios por registro
- **Seguridad**: RLS en Supabase + validación frontend con Zod

## Scripts

```bash
npm run dev      # Desarrollo
npm run build    # Producción
npm run preview  # Preview del build
npm run lint     # Linting
```
