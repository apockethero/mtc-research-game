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
-- 5. POLÍTICAS DE SEGURIDAD A NIVEL DE FILA (ROW LEVEL SECURITY - RLS)
-- ============================================================================
-- Habilitar RLS en todas las tablas
ALTER TABLE public.scientific_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.researcher_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluation_rate_limits ENABLE ROW LEVEL SECURITY;

-- REGLA FUNDAMENTAL: El rol 'anon' (público / cliente) NO tiene permisos de SELECT,
-- UPDATE ni DELETE sobre ninguna evaluación. Tampoco puede consultar registros ajenos.

-- Política 1: El service_role (usado exclusivamente por la Edge Function) tiene control total
CREATE POLICY "service_role_full_access" 
    ON public.scientific_evaluations 
    FOR ALL 
    TO service_role 
    USING (true) 
    WITH CHECK (true);

-- Política 2: Los investigadores autenticados pueden consultar y exportar datos
CREATE POLICY "researcher_select_evaluations" 
    ON public.scientific_evaluations 
    FOR SELECT 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.researcher_profiles 
            WHERE user_id = auth.uid()
        )
        OR auth.jwt() ->> 'role' = 'researcher'
    );

-- Política 3: Investigadores pueden consultar su propio perfil
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
-- 6. FUNCIÓN DE LIMPIEZA AUTOMÁTICA DE REGISTROS DE RATE LIMITING
-- ============================================================================
CREATE OR REPLACE FUNCTION public.cleanup_stale_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Elimina ventanas de rate limit más antiguas a 2 horas (120 minutos)
    DELETE FROM public.evaluation_rate_limits 
    WHERE window_minute < (EXTRACT(EPOCH FROM NOW()) / 60) - 120;
END;
$$;
