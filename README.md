# MTC Research Game — Prototipo de Investigación y Evaluación Científica

Juego interactivo y entorno de evaluación empírica diseñado para la validación del modelo conceptual de tarjetas de revisión del estado del arte en triciclos eléctricos ligeros (MTC01–MTC49).

---

## 🚀 Arquitectura del Sistema

El sistema implementa una arquitectura desacoplada y orientada a la privacidad para la recolección de datos científicos:

```
[ Participante / Frontend ] 
       │
       │ (1) Completa evaluación K1-K6 (Modo Guiado o Investigación)
       │ (2) POST seguro con idempotencia (clientSubmissionId)
       ▼
[ Supabase Edge Function: submit-evaluation ]
       │
       │ (3) Valida esquema, tipos, tamaño (< 500 KB) y consentimiento
       │ (4) Hashea IP con sal criptográfica y controla frecuencia
       ▼
[ PostgreSQL: scientific_evaluations ]
       │
       ├─► [ Notificación por correo: Resend API ] ──► Bandeja del Investigador
       │
       ▼
[ Supabase Dashboard ]
       - Table Editor: Consulta e inspección de evaluaciones en tiempo real
       - Export to CSV: Descarga consolidada de datos para análisis en R / Python / SPSS
```

---

## 🔒 Acceso y Gestión de Datos del Investigador

Por diseño y seguridad:
1. **Frontend Simplificado para Participantes:** La interfaz distribuida a los participantes no contiene paneles administrativos, botones restringidos, tokens de acceso ni claves privilegiadas.
2. **Consulta Centralizada en Supabase:** El investigador consulta e inspecciona los registros directamente desde [Supabase Dashboard](https://supabase.com/dashboard) (`Table Editor -> scientific_evaluations`).
3. **Descarga Consolidada:** Para obtener el conjunto de datos de todas las evaluaciones en formato CSV, basta con pulsar el botón **"Export to CSV"** dentro del Table Editor de Supabase.

---

## ⚙️ Configuración del Entorno Frontend

Para que el cliente transmita las evaluaciones a la nube, configure un archivo `.env` o `.env.local` con las dos variables públicas:

```env
VITE_SUPABASE_URL=https://<tu-proyecto>.supabase.co
VITE_SUPABASE_ANON_KEY=<tu-clave-anon-publica>
```

### ¿Por qué son necesarias estas variables?
- `VITE_SUPABASE_URL`: Permite resolver dinámicamente la ruta de la Edge Function (`/functions/v1/submit-evaluation`).
- `VITE_SUPABASE_ANON_KEY`: Se envía en el encabezado `apikey` que requiere la pasarela de Supabase (Kong API Gateway) para encaminar la petición a la Edge Function de forma segura.
- **Seguridad:** La clave `anon` es pública por diseño y las tablas tienen Row Level Security (RLS) que bloquea lecturas y escrituras directas. Las operaciones privilegiadas se ejecutan exclusivamente en el servidor con `service_role`.

---

## 🧪 Pruebas y Verificación

Para ejecutar la suite de pruebas automatizadas:

```bash
npm test
npm run typecheck
npm run build
```

---

## 📂 Estructura del Código

- `src/features/evaluation/EvaluationView.tsx`: Vista principal de la evaluación para el participante.
- `src/hooks/useEvaluationSession.ts`: Hook de estado con guardado local, sincronización y reinicio automático post-sincronización al refrescar.
- `src/services/cloudSubmissionService.ts`: Servicio cliente de envío a la Edge Function con idempotencia y control de timeout.
- `supabase/functions/submit-evaluation/index.ts`: Edge Function en Deno con validación de datos, prevención de duplicados y notificación vía Resend.
- `supabase/migrations/`: Esquema de base de datos PostgreSQL con RLS y sal criptográfica.
