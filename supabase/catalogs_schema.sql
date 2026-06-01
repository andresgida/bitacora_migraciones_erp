-- ============================================================
-- catalogs_schema.sql
-- Ejecutar en Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.catalogs (
  id          BIGSERIAL PRIMARY KEY,
  category    TEXT NOT NULL,
  value       TEXT NOT NULL,
  active      BOOLEAN NOT NULL DEFAULT TRUE,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT catalogs_category_value_key UNIQUE (category, value)
);

CREATE TRIGGER trg_catalogs_updated_at
  BEFORE UPDATE ON public.catalogs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE public.catalogs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "catalogs_select_authenticated" ON public.catalogs
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "catalogs_insert_admin" ON public.catalogs
  FOR INSERT WITH CHECK (public.current_user_role() = 'admin');

CREATE POLICY "catalogs_update_admin" ON public.catalogs
  FOR UPDATE USING (public.current_user_role() = 'admin');

CREATE POLICY "catalogs_delete_admin" ON public.catalogs
  FOR DELETE USING (public.current_user_role() = 'admin');

-- ============================================================
-- SEED — Valores iniciales desde las constantes del sistema
-- ============================================================

INSERT INTO public.catalogs (category, value, order_index) VALUES
-- Estado
('estado', 'En pruebas', 1),
('estado', 'En vivo', 2),
('estado', 'Suspendido', 3),
('estado', 'Sin iniciar', 4),

-- Prioridad
('prioridad', 'URGENTE', 1),
('prioridad', 'ALTA', 2),
('prioridad', 'MEDIA', 3),
('prioridad', 'BAJA', 4),
('prioridad', 'REVISION FORMACION', 5),
('prioridad', 'SOLUCIONADO', 6),
('prioridad', 'DEVOLUCION DE FDS', 7),
('prioridad', 'DEVOLUCION DE SERVICIOS', 8),
('prioridad', 'REVISIÓN CSM-CLIENTE', 9),

-- Estado FDS
('estado_fds', 'Solucionado', 1),
('estado_fds', 'Pendiente', 2),
('estado_fds', 'En proceso', 3),

-- Suite
('suite', 'Comercial', 1),
('suite', 'Contable', 2),
('suite', 'Nómina', 3),
('suite', 'Técnico', 4),
('suite', 'Producción', 5),
('suite', 'App', 6),

-- Módulo
('modulo', 'Ventas', 1),
('modulo', 'Compras', 2),
('modulo', 'Inventario', 3),
('modulo', 'Tecnico', 4),
('modulo', 'Recaudo', 5),
('modulo', 'Pagos', 6),
('modulo', 'Contabilidad', 7),
('modulo', 'Bancos', 8),
('modulo', 'Activos Fijos', 9),
('modulo', 'Nómina', 10),
('modulo', 'Planilla Única', 11),
('modulo', 'Manufactura', 12),
('modulo', 'Costos Estandar', 13),
('modulo', 'Costos Reales', 14),
('modulo', 'Importaciones', 15),
('modulo', 'Talleres', 16),
('modulo', 'Mantenimiento', 17),
('modulo', 'Gestión Humana', 18),

-- Clasificación
('clasificacion', 'Estandar', 1),
('clasificacion', 'Especifico', 2),

-- Proceso (valores gestionados en catálogo; alinear con producción)
('proceso', 'Migración', 1),
('proceso', 'Robot', 2),
('proceso', '2026', 3),

-- CSM
('csm', 'Adriana Cárdenas', 1),
('csm', 'Javier Cano', 2),
('csm', 'Sofia Mora', 3),
('csm', 'Pedro Castro', 4),
('csm', 'Ociel Espinosa', 5),
('csm', 'Natalia Echavarria', 6),
('csm', 'Olga Tangarife', 7),
('csm', 'Anibal Angulo', 8),
('csm', 'Katherine Nieto', 9),
('csm', 'Martha Martin', 10),
('csm', 'Gustavo Betancur', 11),
('csm', 'Johana Cabaleda', 12),
('csm', 'Laura Mogonllón', 13),
('csm', 'Jonathan', 14),
('csm', 'Claudia Restrepo', 15),
('csm', 'Carlos Mancipe', 16),
('csm', 'Carolina Rozo', 17),
('csm', 'Mesa de Soporte', 18),

-- Líder novedad
('lider_novedad', 'Ana Alvarez', 1),
('lider_novedad', 'Alejandra Marin', 2),
('lider_novedad', 'Julian Munera', 3),
('lider_novedad', 'Patricia Perez', 4),

-- Encargado FDS
('encargado_fds', 'Guillermo', 1),
('encargado_fds', 'Diana', 2),
('encargado_fds', 'Hernan', 3),
('encargado_fds', 'German', 4),
('encargado_fds', 'Natali', 5),

-- Segmentación FDS
('segmentacion_fds', 'Cambios Enterprise', 1),
('segmentacion_fds', 'Robot', 2),
('segmentacion_fds', 'Pruebas', 3),
('segmentacion_fds', 'Específicos', 4),
('segmentacion_fds', 'Mejoras de migración', 5),
('segmentacion_fds', 'Instalación inicial', 6),
('segmentacion_fds', 'Configuración', 7),

-- Impacto FDS
('impacto_fds', 'Critico', 1),
('impacto_fds', 'Alto', 2),
('impacto_fds', 'Medio', 3),
('impacto_fds', 'Bajo', 4),

-- Empresas
('empresa', 'Disteandinas', 1),
('empresa', 'Alpa Construcciones SAS', 2),
('empresa', 'Super Máquinas', 3),
('empresa', 'Doranca', 4),
('empresa', 'Natural Sant Cosmeticos SAS', 5),
('empresa', 'Pisersa', 6),
('empresa', 'Inversiones Capira', 7),
('empresa', 'Intermodal', 8),
('empresa', 'Laboratorios Decno', 9),
('empresa', 'Comercializadora LH', 10),
('empresa', 'Ferreteria La Jimenez SAS', 11),
('empresa', 'Era Electronica', 12),
('empresa', 'Centro de Endoscopia Del Valle SAS', 13),
('empresa', 'Comercializadora Gilza SAS', 14),
('empresa', 'Artepan', 15),
('empresa', 'Senco', 16),
('empresa', 'Fundación Ramirez Moreno', 17),
('empresa', 'Ferrin SAS', 18),
('empresa', 'Imporquim Group SAS', 19),
('empresa', 'Mediser', 20),
('empresa', 'Expreso Girardota', 21),
('empresa', 'Intercalco', 22),
('empresa', 'Proyecciones Plasticas', 23),
('empresa', 'Corporacion centro de ciencia y tecnologia de Antioquia CTA', 24),
('empresa', 'Teknum', 25),
('empresa', 'Distribuidora Químicos Industriales DQI', 26),
('empresa', 'Reimpex', 27),
('empresa', 'UnionAgro', 28),
('empresa', 'Degres', 29),
('empresa', 'Colombiana de Television', 30),
('empresa', 'ICIPC', 31),
('empresa', 'Aceros Industriales', 32),
('empresa', 'Dormilandia', 33),
('empresa', 'Alejandro Galvis Ramirez e Hijos SAS', 34),
('empresa', 'Medvivir', 35),
('empresa', 'Induali', 36),
('empresa', 'Vuelven', 37),
('empresa', 'Core Laboratories', 38),
('empresa', 'Simelca', 39),
('empresa', 'Lito', 40),
('empresa', 'Eypo', 41),
('empresa', 'Ingelectrica', 42),
('empresa', 'Osaka', 43),
('empresa', 'Lumen', 44),
('empresa', 'Callizo Aroma', 45),
('empresa', 'Pavimentar', 46),
('empresa', 'Puro Cuero', 47),
('empresa', 'Visionamos', 48),
('empresa', 'Pecoda', 49),
('empresa', 'Cinco SAS', 50),
('empresa', 'Representaciones Hego', 51),
('empresa', 'Galenicum Vitae Ecuador SAS', 52),
('empresa', 'PVC Global', 53),
('empresa', 'Jardines de Paz', 54),
('empresa', 'Euro Stone SAS', 55),
('empresa', 'Jmendoza Equipos SAS', 56),
('empresa', 'Coordinadora de Tanques', 57),
('empresa', 'Dimotriz', 58),
('empresa', 'Comercial Tonkin', 59),
('empresa', 'Hotel Monterrey', 60),
('empresa', 'Seracis', 61),
('empresa', 'Disinco SAS', 62),
('empresa', 'Distribuciones Hernandez & Hernandez', 63),
('empresa', 'Distribuciones Monarca SAS', 64),
('empresa', 'Yadich', 65),
('empresa', 'Integra', 66),
('empresa', 'One Energy', 67),
('empresa', 'Mavill', 68),
('empresa', 'It Certifica', 69),
('empresa', 'IMD Y CIA SAS', 70),
('empresa', 'Cootransmede', 71),
('empresa', 'Higuera Escalante & Cia SAS', 72),
('empresa', 'Rotoplast', 73),
('empresa', 'Sensoria Fragancia', 74),
('empresa', 'RedInstatic', 75),
('empresa', 'BIOFLUIDOS & FARMA SAS', 76),
('empresa', 'Mi Celu', 77),
('empresa', 'Victory Key', 78),
('empresa', 'Uroclin', 79),
('empresa', 'Anillos Doble O', 80),
('empresa', 'Electronic JJ Audio SAS', 81),
('empresa', 'ETICAP', 82),
('empresa', 'Undemor', 83),
('empresa', 'Grupo Gabel', 84),
('empresa', 'Ciles SAS', 85),
('empresa', 'Fiza', 86),
('empresa', 'Coacosta', 87),
('empresa', 'Colnotex', 88),
('empresa', 'Termovent SAS', 89),
('empresa', 'Factor Diferencial', 90),
('empresa', 'Vila Decoraciones', 91),
('empresa', 'Pizantex', 92),
('empresa', 'TCDX', 93),
('empresa', 'Kababi', 94),
('empresa', 'Suplacol', 95),
('empresa', 'Hidrospa', 96),
('empresa', 'Colmediks', 97),
('empresa', 'Samara Cosmetic', 98),
('empresa', 'OpciónTemporal', 99),
('empresa', 'Biourbe', 100),
('empresa', 'Arkis', 101),
('empresa', 'Distribuidora de Mariscos y Pescados de la Sabana', 102),
('empresa', 'Aress Corredores de Seguros', 103),
('empresa', 'Coamesa', 104),
('empresa', 'Carrocerias Panamericana', 105),
('empresa', 'Cachivaches/Rangun/Morai', 106),
('empresa', 'Serrano Gomez', 107),
('empresa', 'Flores Elegancia', 108),
('empresa', 'Todoterreno', 109),
('empresa', 'Nueva Empresa SAS', 110)

ON CONFLICT (category, value) DO NOTHING;

SELECT category, COUNT(*) AS total
FROM public.catalogs
GROUP BY category
ORDER BY category;
