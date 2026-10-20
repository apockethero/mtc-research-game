-- ============================================================================
-- MTC RESEARCH GAME: ESQUEMA CENTRALIZADO DE EVALUACIÓN CIENTÍFICA
-- Base de datos: PostgreSQL (Supabase)
-- Versión del instrumento: 1.1.0-multimodal-exp
-- ============================================================================

-- Habilitar extensión criptográfica para UUIDs y funciones de hash
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. TABLA PRINCIPAL: scientific_evaluations
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.scientific_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL,
    client_submission_id TEXT NOT NULL UNIQUE,
    instrument_version TEXT NOT NULL DEFAULT '1.1.0-multimodal-exp',
    evaluation_mode TEXT NOT NULL CHECK (evaluation_mode IN ('guiado', 'investigacion')),
    started_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ NOT NULL,
    server_received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Consentimiento obligatorio verificado por el servidor
    consent_given BOOLEAN NOT NULL DEFAULT FALSE CHECK (consent_given = TRUE),
    consent_timestamp TIMESTAMPTZ NOT NULL,
    
    -- Perfil del participante (Minimización: sin datos identificativos directos)
    participant_profile JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Criterios K1 - K6 y sugerencias cualitativas
    k1_responses JSONB NOT NULL DEFAULT '{}'::jsonb,
    k2_responses JSONB NOT NULL DEFAULT '{}'::jsonb,
    k3_responses JSONB NOT NULL DEFAULT '{}'::jsonb,
    k4_responses JSONB NOT NULL DEFAULT '{}'::jsonb,
    k5k6_responses JSONB NOT NULL DEFAULT '{}'::jsonb,
    qualitative_comments JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Puntuaciones objetivas reproducibles
    objective_scores JSONB NOT NULL DEFAULT '{}'::jsonb,
    k1_score NUMERIC(5,2),
    k2_score NUMERIC(5,2),
    total_objective_score NUMERIC(5,2),
    percentage NUMERIC(5,2),
    
    -- Telemetría de exploración de cartas, pistas y asistencia
    telemetry JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Control de estado y procesamiento
    is_complete BOOLEAN NOT NULL DEFAULT TRUE,
    submission_status TEXT NOT NULL DEFAULT 'received' CHECK (submission_status IN ('received', 'processed', 'flagged')),
    
    -- Información de transporte y prevención de abuso (pseudo-anonimizada)
    client_user_agent TEXT,
    client_ip_hash TEXT,
    
    -- Telemetría de notificación por correo al investigador
    notification_sent BOOLEAN NOT NULL DEFAULT FALSE,
    notification_sent_at TIMESTAMPTZ,
    notification_error TEXT
);

-- ============================================================================
-- 2. TABLA DE CONTROL DE INVESTIGADORES AUTORIZADOS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.researcher_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'researcher' CHECK (role IN ('researcher', 'lead_investigator')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 3. TABLA DE LIMITACIÓN DE FRECUENCIA (RATE LIMITING ANTI-ABUSO)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.evaluation_rate_limits (
    ip_hash TEXT NOT NULL,
    window_minute BIGINT NOT NULL, -- Unix timestamp en minutos
    request_count INT NOT NULL DEFAULT 1,
    last_request_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (ip_hash, window_minute)
);

-- ============================================================================
-- 4. ÍNDICES DE RENDIMIENTO Y CONSULTA
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_evaluations_session_id 
    ON public.scientific_evaluations(session_id);

CREATE INDEX IF NOT EXISTS idx_evaluations_client_sub_id 
    ON public.scientific_evaluations(client_submission_id);

CREATE INDEX IF NOT EXISTS idx_evaluations_received_at 
    ON public.scientific_evaluations(server_received_at DESC);

CREATE INDEX IF NOT EXISTS idx_evaluations_mode_version 
    ON public.scientific_evaluations(evaluation_mode, instrument_version);

CREATE INDEX IF NOT EXISTS idx_evaluations_notification_sent 
    ON public.scientific_evaluations(notification_sent) 
    WHERE notification_sent = FALSE;

-- ============================================================================
-- 5. SEGURIDAD: PRIVILEGIOS SQL EXPLÍCITOS (DEFENSA EN PROFUNDIDAD)
-- ============================================================================
-- Revocar todos los privilegios por defecto a roles públicos y anónimos
REVOKE ALL ON TABLE public.scientific_evaluations FROM PUBLIC, anon;
REVOKE ALL ON TABLE public.researcher_profiles FROM PUBLIC, anon;
REVOKE ALL ON TABLE public.evaluation_rate_limits FROM PUBLIC, anon, authenticated;

-- Otorgar privilegios mínimos requeridos
-- service_role: Control total para la Edge Function de ingesta y tareas de administración
GRANT ALL ON TABLE public.scientific_evaluations TO service_role;
GRANT ALL ON TABLE public.researcher_profiles TO service_role;
GRANT ALL ON TABLE public.evaluation_rate_limits TO service_role;

-- authenticated: Exclusivamente lectura (SELECT), sujeta a las políticas RLS
GRANT SELECT ON TABLE public.scientific_evaluations TO authenticated;
GRANT SELECT ON TABLE public.researcher_profiles TO authenticated;

-- ============================================================================
-- 6. POLÍTICAS DE SEGURIDAD A NIVEL DE FILA (ROW LEVEL SECURITY - RLS)
-- ============================================================================
-- Habilitar RLS en todas las tablas
ALTER TABLE public.scientific_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.researcher_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluation_rate_limits ENABLE ROW LEVEL SECURITY;

-- Política 1: service_role (Edge Function) tiene acceso completo para insertar y consultar
CREATE POLICY "service_role_full_access" 
    ON public.scientific_evaluations 
    FOR ALL 
    TO service_role 
    USING (true) 
    WITH CHECK (true);

-- Política 2: Investigadores autorizados únicamente si existen en public.researcher_profiles
CREATE POLICY "researcher_select_evaluations" 
    ON public.scientific_evaluations 
    FOR SELECT 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.researcher_profiles 
            WHERE user_id = auth.uid()
        )
    );

-- Política 3: Investigadores pueden consultar únicamente su propio perfil
CREATE POLICY "researcher_view_own_profile" 
    ON public.researcher_profiles 
    FOR SELECT 
    TO authenticated 
    USING (user_id = auth.uid());

-- Política 4: La tabla de rate limits solo es accesible por service_role
CREATE POLICY "service_role_rate_limits" 
    ON public.evaluation_rate_limits 
    FOR ALL 
    TO service_role 
    USING (true) 
    WITH CHECK (true);

-- ============================================================================
-- 7. FUNCIÓN DE MANTENIMIENTO: LIMPIEZA DE RATE LIMITS
-- ============================================================================
CREATE OR REPLACE FUNCTION public.cleanup_stale_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- Elimina ventanas de rate limit más antiguas a 2 horas (120 minutos)
    DELETE FROM public.evaluation_rate_limits 
    WHERE window_minute < (EXTRACT(EPOCH FROM NOW()) / 60) - 120;
END;
$$;

-- Restringir estrictamente la ejecución de la función de mantenimiento
-- Revocar ejecución de PUBLIC, anon y authenticated
REVOKE ALL ON FUNCTION public.cleanup_stale_rate_limits() FROM PUBLIC, anon, authenticated;

-- Permitir ejecución únicamente al service_role (e.g. pg_cron o tareas programadas de servidor)
GRANT EXECUTE ON FUNCTION public.cleanup_stale_rate_limits() TO service_role;
