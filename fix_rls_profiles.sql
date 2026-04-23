-- ============================================================
-- SCRIPT: Crear tabla profiles desde cero + RLS + datos iniciales
-- Ejecutar en: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Crear la tabla profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'alumno' CHECK (role IN ('alumno', 'profesor')),
  ninja_name TEXT,
  real_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Activar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Políticas simples y no-recursivas
CREATE POLICY "profiles_select_own"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 4. Crear también las tablas de clases si no existen
CREATE TABLE IF NOT EXISTS public.clases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  codigo TEXT UNIQUE NOT NULL,
  profesor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.clases ENABLE ROW LEVEL SECURITY;

-- Políticas para clases
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'clases_select_profesor' AND tablename = 'clases') THEN
    CREATE POLICY "clases_select_profesor" ON public.clases FOR SELECT USING (auth.uid() = profesor_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'clases_insert_profesor' AND tablename = 'clases') THEN
    CREATE POLICY "clases_insert_profesor" ON public.clases FOR INSERT WITH CHECK (auth.uid() = profesor_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'clases_delete_profesor' AND tablename = 'clases') THEN
    CREATE POLICY "clases_delete_profesor" ON public.clases FOR DELETE USING (auth.uid() = profesor_id);
  END IF;
END $$;

-- Tabla de alumnos en clase
CREATE TABLE IF NOT EXISTS public.clase_alumnos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clase_id UUID NOT NULL REFERENCES public.clases(id) ON DELETE CASCADE,
  alumno_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(clase_id, alumno_id)
);

ALTER TABLE public.clase_alumnos ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'clase_alumnos_select' AND tablename = 'clase_alumnos') THEN
    CREATE POLICY "clase_alumnos_select" ON public.clase_alumnos FOR SELECT 
    USING (
      auth.uid() = alumno_id OR 
      auth.uid() IN (SELECT profesor_id FROM public.clases WHERE id = clase_id)
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'clase_alumnos_insert' AND tablename = 'clase_alumnos') THEN
    CREATE POLICY "clase_alumnos_insert" ON public.clase_alumnos FOR INSERT WITH CHECK (auth.uid() = alumno_id);
  END IF;
END $$;

-- Tabla de recursos generados
CREATE TABLE IF NOT EXISTS public.recursos_generados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profesor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tecnologia TEXT NOT NULL,
  tipo_recurso TEXT NOT NULL,
  contenido JSONB,
  fecha_creacion TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.recursos_generados ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'recursos_select_own' AND tablename = 'recursos_generados') THEN
    CREATE POLICY "recursos_select_own" ON public.recursos_generados FOR SELECT USING (auth.uid() = profesor_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'recursos_insert_own' AND tablename = 'recursos_generados') THEN
    CREATE POLICY "recursos_insert_own" ON public.recursos_generados FOR INSERT WITH CHECK (auth.uid() = profesor_id);
  END IF;
END $$;

-- 5. Verificación final
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
