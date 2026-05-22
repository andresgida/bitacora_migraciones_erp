-- ============================================================
-- seed.sql — Ejecutar DESPUÉS de crear el usuario en
-- Supabase Dashboard > Authentication > Users > Add user
-- ============================================================

-- Si el trigger no creó el perfil automáticamente, créalo manualmente:
-- (Reemplaza 'admin@tuempresa.com' por el email que usaste al crear el usuario)

INSERT INTO public.profiles (id, email, full_name, role)
SELECT
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', u.email),
  'admin'::user_role_type
FROM auth.users u
WHERE u.email = 'agomez@ofima.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = u.id
  );

-- Si el perfil ya existe, solo actualiza el rol:
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'agomez@ofima.com';

-- Verificar resultado:
SELECT id, email, full_name, role, created_at
FROM public.profiles;
