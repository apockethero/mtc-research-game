// ============================================================================
// Supabase Edge Function: submit-evaluation
// Runtime: Deno (TypeScript)
// Ingesta segura, validación, idempotencia y notificación por correo
// ============================================================================

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const MAX_PAYLOAD_SIZE = 512000; // 500 KB
const RATE_LIMIT_WINDOW_MINUTES = 10;
const RATE_LIMIT_MAX_REQUESTS = 15;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface IngestionRequest {
  clientSubmissionId: string;
  sessionId: string;
  instrumentVersion: string;
  evaluationMode: "guiado" | "investigacion";
  startedAt: string;
  completedAt: string;
  clientSentAt: string;
  consentGiven: boolean;
  consentTimestamp: string;
  profile: Record<string, unknown>;
  k1Responses: Record<string, unknown>;
  k2Responses: Record<string, unknown>;
  k3Responses: Record<string, unknown>;
  k4Responses: Record<string, unknown>;
  k5k6Responses: Record<string, unknown>;
  qualitativeComments: Record<string, unknown>;
  objectiveScores?: {
    k1Score?: number;
    k2Score?: number;
    totalObjectiveScore?: number;
    percentage?: number;
  };
  telemetry?: Record<string, unknown>;
  isComplete: boolean;
}

// Función auxiliar para hashear la IP del cliente (pseudo-anonimización)
async function hashIp(ipString: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = Deno.env.get("IP_SALT") || "mtc_eval_salt_2026";
  const data = encoder.encode(ipString + salt);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("").slice(0, 32);
}

// Función auxiliar de validación de esquema
function validatePayload(payload: unknown): { valid: boolean; error?: string; data?: IngestionRequest } {
  if (!payload || typeof payload !== "object") {
    return { valid: false, error: "El cuerpo de la solicitud debe ser un objeto JSON válido." };
  }

  const p = payload as Record<string, unknown>;

  if (typeof p.clientSubmissionId !== "string" || p.clientSubmissionId.trim().length < 8) {
    return { valid: false, error: "clientSubmissionId inválido o ausente (requiere identificador único de al menos 8 caracteres)." };
  }

  if (typeof p.sessionId !== "string" || p.sessionId.trim().length < 4) {
    return { valid: false, error: "sessionId inválido o ausente." };
  }

  if (p.evaluationMode !== "guiado" && p.evaluationMode !== "investigacion") {
    return { valid: false, error: "evaluationMode debe ser 'guiado' o 'investigacion'." };
  }

  // Verificación estricta de consentimiento en el servidor
  if (p.consentGiven !== true) {
    return { valid: false, error: "Consentimiento informado no acreditado. No se pueden registrar datos sin consentimiento previo." };
  }

  if (typeof p.consentTimestamp !== "string" || isNaN(Date.parse(p.consentTimestamp))) {
    return { valid: false, error: "consentTimestamp debe ser una fecha ISO 8601 válida." };
  }

  if (typeof p.startedAt !== "string" || isNaN(Date.parse(p.startedAt))) {
    return { valid: false, error: "startedAt debe ser una fecha ISO 8601 válida." };
  }

  if (typeof p.completedAt !== "string" || isNaN(Date.parse(p.completedAt))) {
    return { valid: false, error: "completedAt debe ser una fecha ISO 8601 válida." };
  }

  return { valid: true, data: p as unknown as IngestionRequest };
}

serve(async (req: Request) => {
  // Manejo de preflight CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Método no permitido. Solo se acepta POST." }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Verificación de tamaño del payload
  const contentLength = req.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > MAX_PAYLOAD_SIZE) {
    return new Response(
      JSON.stringify({ error: "El tamaño de la evaluación excede el límite permitido de 500 KB." }),
      { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const rawBody = await req.text();
    if (rawBody.length > MAX_PAYLOAD_SIZE) {
      return new Response(
        JSON.stringify({ error: "El cuerpo de la solicitud supera el límite de tamaño permitido." }),
        { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const json = JSON.parse(rawBody);
    const validation = validatePayload(json);

    if (!validation.valid || !validation.data) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = validation.data;

    // Conexión a Supabase usando credenciales de servidor
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Faltan variables de entorno SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.");
      return new Response(
        JSON.stringify({ error: "Servicio de almacenamiento no configurado en el servidor." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Obtener y hashear IP para control de abuso
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown_ip";
    const ipHash = await hashIp(clientIp);
    const userAgent = req.headers.get("user-agent") || "unknown_agent";
    const currentMinute = Math.floor(Date.now() / 60000);

    // 1. Verificación de Rate Limiting en PostgreSQL
    const { data: rateData } = await supabase
      .from("evaluation_rate_limits")
      .select("request_count")
      .eq("ip_hash", ipHash)
      .eq("window_minute", currentMinute)
      .maybeSingle();

    if (rateData && rateData.request_count >= RATE_LIMIT_MAX_REQUESTS) {
      return new Response(
        JSON.stringify({ error: "Límite de envíos excedido para esta ventana de tiempo. Por favor espera unos minutos." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Actualizar o registrar intento de rate limit
    if (rateData) {
      await supabase
        .from("evaluation_rate_limits")
        .update({ request_count: rateData.request_count + 1, last_request_at: new Date().toISOString() })
        .eq("ip_hash", ipHash)
        .eq("window_minute", currentMinute);
    } else {
      await supabase
        .from("evaluation_rate_limits")
        .insert([{ ip_hash: ipHash, window_minute: currentMinute, request_count: 1 }]);
    }

    // 2. Control de Idempotencia y Prevención de Duplicados
    const { data: existing } = await supabase
      .from("scientific_evaluations")
      .select("id, session_id, client_submission_id, server_received_at")
      .eq("client_submission_id", data.clientSubmissionId)
      .maybeSingle();

    if (existing) {
      return new Response(
        JSON.stringify({
          success: true,
          sessionId: existing.session_id,
          clientSubmissionId: existing.client_submission_id,
          serverReceivedAt: existing.server_received_at,
          status: "already_received",
          message: "Esta evaluación ya fue registrada con anterioridad. No se generaron duplicados."
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Inserción en la base de datos central
    const serverReceivedAt = new Date().toISOString();
    const scores = data.objectiveScores || {};

    const insertPayload = {
      session_id: data.sessionId,
      client_submission_id: data.clientSubmissionId,
      instrument_version: data.instrumentVersion || "1.1.0-multimodal-exp",
      evaluation_mode: data.evaluationMode,
      started_at: data.startedAt,
      completed_at: data.completedAt,
      server_received_at: serverReceivedAt,
      consent_given: data.consentGiven,
      consent_timestamp: data.consentTimestamp,
      participant_profile: data.profile || {},
      k1_responses: data.k1Responses || {},
      k2_responses: data.k2Responses || {},
      k3_responses: data.k3Responses || {},
      k4_responses: data.k4Responses || {},
      k5k6_responses: data.k5k6Responses || {},
      qualitative_comments: data.qualitativeComments || {},
      objective_scores: scores,
      k1_score: typeof scores.k1Score === "number" ? scores.k1Score : null,
      k2_score: typeof scores.k2Score === "number" ? scores.k2Score : null,
      total_objective_score: typeof scores.totalObjectiveScore === "number" ? scores.totalObjectiveScore : null,
      percentage: typeof scores.percentage === "number" ? scores.percentage : null,
      telemetry: data.telemetry || {},
      is_complete: data.isComplete !== false,
      submission_status: "received",
      client_user_agent: userAgent.slice(0, 255),
      client_ip_hash: ipHash,
      notification_sent: false
    };

    const { error: insertError } = await supabase
      .from("scientific_evaluations")
      .insert([insertPayload]);

    if (insertError) {
      console.error("Error al insertar evaluación en PostgreSQL:", insertError);
      return new Response(
        JSON.stringify({ error: "Error interno al almacenar la evaluación en la base de datos." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Notificación por Correo al Investigador (Resiliente)
    // El fallo en el envío del correo NUNCA descarta ni falla la evaluación ya almacenada
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const researcherEmail = Deno.env.get("RESEARCHER_NOTIFICATION_EMAIL");
    const adminDashboardUrl = Deno.env.get("ADMIN_DASHBOARD_URL") || "";

    if (resendApiKey && researcherEmail) {
      try {
        const emailSubject = `[MTC Research Game] Nueva evaluación recibida - ${data.sessionId}`;
        const emailBody = `
Estimado/a investigador/a:

Se ha recibido y almacenado exitosamente una nueva evaluación científica en la base de datos central de MTC Research Game.

Resumen del registro:
- Identificador de Sesión: ${data.sessionId}
- Fecha y Hora de Recepción: ${serverReceivedAt}
- Modalidad: ${data.evaluationMode === "guiado" ? "Modo Guiado" : "Modo de Investigación"}
- Versión del Instrumento: ${data.instrumentVersion || "1.1.0-multimodal-exp"}
- Puntuación Replicable: ${scores.totalObjectiveScore ?? "N/A"} pts (${scores.percentage ?? "N/A"}%)
- Estado: Registrado en base de datos central

${adminDashboardUrl ? `Acceso al panel administrativo: ${adminDashboardUrl}` : ""}

Nota de Privacidad:
En cumplimiento del principio de minimización y protección de datos, este correo electrónico no incluye respuestas abiertas, justificaciones cualitativas ni datos potencialmente identificables. Consulta el panel seguro de administración para examinar el conjunto consolidado de datos.
`.trim();

        const emailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${resendApiKey}`
          },
          body: JSON.stringify({
            from: "MTC Research Game <onboarding@resend.dev>",
            to: [researcherEmail],
            subject: emailSubject,
            text: emailBody
          })
        });

        if (emailRes.ok) {
          await supabase
            .from("scientific_evaluations")
            .update({ notification_sent: true, notification_sent_at: new Date().toISOString() })
            .eq("client_submission_id", data.clientSubmissionId);
        } else {
          const errText = await emailRes.text();
          console.warn("Proveedor de correo devolvió código no-2xx:", errText);
          await supabase
            .from("scientific_evaluations")
            .update({ notification_error: `Resend error: ${errText.slice(0, 200)}` })
            .eq("client_submission_id", data.clientSubmissionId);
        }
      } catch (mailErr) {
        console.warn("Excepción al despachar notificación de correo:", mailErr);
        await supabase
          .from("scientific_evaluations")
          .update({ notification_error: String(mailErr).slice(0, 200) })
          .eq("client_submission_id", data.clientSubmissionId);
      }
    }

    // 5. Respuesta Exitosa
    return new Response(
      JSON.stringify({
        success: true,
        sessionId: data.sessionId,
        clientSubmissionId: data.clientSubmissionId,
        serverReceivedAt: serverReceivedAt,
        status: "received",
        message: "Evaluación validada y almacenada con éxito en la base de datos central."
      }),
      { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error no controlado al procesar evaluación:", err);
    return new Response(
      JSON.stringify({ error: "Error de formato o procesamiento en el servidor." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
