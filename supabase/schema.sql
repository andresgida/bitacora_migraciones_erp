-- ============================================================
-- Bitácora Migraciones 2026 — Database Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- CUSTOM TYPES
-- ============================================================
-- NOTE: Field values are validated at the application layer via Zod.
-- Using TEXT for flexibility; role uses an enum for strong guarantees.

CREATE TYPE user_role_type AS ENUM ('admin', 'readonly');

-- ============================================================
-- TABLES
-- ============================================================

-- Profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email       TEXT NOT NULL,
  full_name   TEXT,
  role        user_role_type NOT NULL DEFAULT 'readonly',
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bitácora main table
CREATE TABLE IF NOT EXISTS public.bitacora (
  id                      BIGSERIAL PRIMARY KEY,

  -- Fecha / Empresa
  fecha_novedad           DATE,
  fecha_definiciones      DATE,
  nombre_empresa          TEXT NOT NULL,

  -- Estado / BD
  estado                  TEXT CHECK (estado IN ('En pruebas', 'En vivo', 'Suspendido', 'Sin iniciar')),
  base_datos              TEXT,

  -- Equipo
  csm                     TEXT,
  lider_novedad           TEXT,

  -- Técnico
  suite                   TEXT,
  modulo                  TEXT,
  clasificacion           TEXT CHECK (clasificacion IN ('Estandar', 'Especifico')),
  version_anterior        TEXT,

  -- Descripción
  descripcion_error       TEXT,
  imagen_1_url            TEXT,
  imagen_2_url            TEXT,
  link_video              TEXT,

  -- Prioridad / Solución
  prioridad_servicio      TEXT,
  solucionado             BOOLEAN NOT NULL DEFAULT FALSE,
  observacion_formacion   TEXT,

  -- FDS
  fecha_tentativa_solucion DATE,
  estado_fds              TEXT CHECK (estado_fds IN ('Solucionado', 'Pendiente', 'En proceso')),
  observaciones_fds       TEXT,
  encargado_fds           TEXT,
  azure_url               TEXT,
  segmentacion_fds        TEXT,
  impacto_fds             TEXT CHECK (impacto_fds IN ('Critico', 'Alto', 'Medio', 'Bajo')),

  -- Metadata
  created_by              UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audit logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id          BIGSERIAL PRIMARY KEY,
  table_name  TEXT NOT NULL,
  record_id   BIGINT NOT NULL,
  action      TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data    JSONB,
  new_data    JSONB,
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_bitacora_nombre_empresa ON public.bitacora (nombre_empresa);
CREATE INDEX IF NOT EXISTS idx_bitacora_estado ON public.bitacora (estado);
CREATE INDEX IF NOT EXISTS idx_bitacora_prioridad ON public.bitacora (prioridad_servicio);
CREATE INDEX IF NOT EXISTS idx_bitacora_estado_fds ON public.bitacora (estado_fds);
CREATE INDEX IF NOT EXISTS idx_bitacora_solucionado ON public.bitacora (solucionado);
CREATE INDEX IF NOT EXISTS idx_bitacora_created_at ON public.bitacora (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bitacora_fecha_novedad ON public.bitacora (fecha_novedad DESC);
CREATE INDEX IF NOT EXISTS idx_bitacora_csm ON public.bitacora (csm);
CREATE INDEX IF NOT EXISTS idx_bitacora_lider ON public.bitacora (lider_novedad);
CREATE INDEX IF NOT EXISTS idx_audit_logs_record ON public.audit_logs (table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs (user_id);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_bitacora_search ON public.bitacora USING GIN (
  to_tsvector('spanish',
    COALESCE(nombre_empresa, '') || ' ' ||
    COALESCE(descripcion_error, '') || ' ' ||
    COALESCE(base_datos, '') || ' ' ||
    COALESCE(csm, '') || ' ' ||
    COALESCE(lider_novedad, '')
  )
);

-- ============================================================
-- TRIGGERS — updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_bitacora_updated_at
  BEFORE UPDATE ON public.bitacora
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role_type, 'readonly')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bitacora ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper: get current user role
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT AS $$
  SELECT role::TEXT FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- PROFILES policies
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

-- BITACORA policies
CREATE POLICY "bitacora_select_authenticated" ON public.bitacora
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "bitacora_insert_admin" ON public.bitacora
  FOR INSERT WITH CHECK (public.current_user_role() = 'admin');

CREATE POLICY "bitacora_update_admin" ON public.bitacora
  FOR UPDATE USING (public.current_user_role() = 'admin');

CREATE POLICY "bitacora_delete_admin" ON public.bitacora
  FOR DELETE USING (public.current_user_role() = 'admin');

-- AUDIT LOGS policies
CREATE POLICY "audit_select_authenticated" ON public.audit_logs
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "audit_insert_authenticated" ON public.audit_logs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- STORAGE
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('bitacora-images', 'bitacora-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "storage_select_authenticated" ON storage.objects
  FOR SELECT USING (bucket_id = 'bitacora-images' AND auth.role() = 'authenticated');

CREATE POLICY "storage_insert_admin" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'bitacora-images' AND public.current_user_role() = 'admin');

CREATE POLICY "storage_delete_admin" ON storage.objects
  FOR DELETE USING (bucket_id = 'bitacora-images' AND public.current_user_role() = 'admin');
