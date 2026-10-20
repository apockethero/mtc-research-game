# Guía de Despliegue y Configuración Centralizada: Supabase & PostgreSQL
**Proyecto:** MTC Research Game  
**Componente:** Ingesta y Almacenamiento Centralizado de Evaluaciones Científicas  
**Versión del Instrumento:** 1.1.0-multimodal-exp  

---

## 1. Arquitectura de Ingesta Segura

El sistema implementa una arquitectura desacoplada y orientada a la minimización de riesgos:

```
[ Participante en Navegador ]
             │
             │ (1) Completa evaluación y valida respuestas localmente
             │ (2) Confirma envío (Consentimiento explícito obligatorio)
             ▼
[ Supabase Edge Function: submit-evaluation ]
             │
             │ (3) Valida tamaño (< 500 KB), esquema, tipos, límites y consentimiento
             │ (4) Controla idempotencia (evita duplicados si hay reintentos)
             │ (5) Rate limiting por IP pseudo-anonimizada con sal criptográfica
             ▼
[ Base de Datos PostgreSQL: scientific_evaluations ]
  - RLS activado: Público/Anon NO puede leer, modificar ni borrar registros
  - Almacena respuestas K1-K6, puntuaciones reproducibles y telemetría
             │
             │ (6) Notificación asíncrona y no bloqueante
             ▼
[ Proveedor Transaccional: Resend API ] ──► [ Correo del Investigador ]
                                             - Notifica recepción
                                             - Sin respuestas abiertas ni PII
                                             - Enlace a Supabase Dashboard
             ▲
             │ (7) Consulta e inspección directa y exportación a CSV
[ Supabase Dashboard (Table Editor / Export to CSV) ]
```

---

## 2. Paso a Paso para la Puesta en Producción

### Paso 1: Crear el Proyecto en Supabase
1. Accede a [Supabase Dashboard](https://supabase.com/dashboard) e inicia sesión.
2. Pulsa en **"New Project"**.
3. Asigna un nombre al proyecto (ej. `mtc-research-evaluations`).
4. Genera una contraseña segura para la base de datos PostgreSQL y guárdala en tu gestor de contraseñas.
5. Selecciona la región más cercana a tus participantes (ej. `sa-east-1` para Sudamérica o `us-east-1`).
6. Espera aproximadamente 2 minutos hasta que el aprovisionamiento concluya.

---

### Paso 2: Ejecutar la Migración del Esquema SQL
1. En el menú lateral izquierdo de Supabase, entra a **"SQL Editor"**.
2. Pulsa en **"New Query"**.
3. Abre el archivo local [`supabase/migrations/20261020000000_create_evaluations_schema.sql`](../supabase/migrations/20261020000000_create_evaluations_schema.sql).
4. Copia su contenido completo y pégalo en el editor SQL de Supabase.
5. Pulsa el botón **"Run"** (o `Ctrl + Enter`).
6. Verifica que aparezca el mensaje de éxito `Success. No rows returned`.
7. En el menú **"Table Editor"**, confirma la existencia de las siguientes tablas:
   - `scientific_evaluations` (con RLS habilitado).
   - `researcher_profiles` (con RLS habilitado).
   - `evaluation_rate_limits` (con RLS habilitado).

---

### Paso 3: Configurar Secretos del Servidor (Edge Function)
En la consola de comandos de tu computador o en **Project Settings -> Edge Functions -> Secrets** de Supabase, define las siguientes variables secretas:

Si utilizas Supabase CLI:
```bash
# Iniciar sesión en Supabase CLI
supabase login

# Vincular al proyecto remoto (obtén el project-ref en la URL de tu proyecto)
supabase link --project-ref your-project-ref

# Configurar secretos privados del servidor
supabase secrets set RESEND_API_KEY=re_tu_api_key_de_resend
supabase secrets set RESEARCHER_NOTIFICATION_EMAIL=tu_correo_institucional@universidad.edu
supabase secrets set ADMIN_DASHBOARD_URL=https://tu-dominio-del-juego.com/
supabase secrets set IP_SALT=un_string_aleatorio_muy_largo_y_seguro_para_hashear_ips
```

*Nota:* Las variables `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` son inyectadas automáticamente por el entorno de Supabase Edge Functions.

---

### Paso 4: Desplegar la Función de Servidor (`submit-evaluation`)
Desde la carpeta raíz del proyecto `mtc_game_prototype`:

```bash
# Desplegar la función de ingesta con verificación pública (permite llamadas anónimas seguras)
supabase functions deploy submit-evaluation --no-verify-jwt
```

La función quedará disponible en:
`https://your-project-ref.supabase.co/functions/v1/submit-evaluation`

---

### Paso 5: Configurar el Proveedor de Correo (Resend)
1. Crea una cuenta gratuita en [Resend](https://resend.com/).
2. En la sección **API Keys**, crea una nueva clave con permisos de envío (`Sending access`).
3. Copia la clave generada (`re_...`).
4. Si tienes un dominio propio (ej. `tu-universidad.edu`), configúralo en la pestaña **Domains** de Resend. Si no tienes dominio, puedes utilizar el remitente de pruebas predeterminado de Resend para entregar en tu propio correo registrado.
5. Asigna la clave al secreto `RESEND_API_KEY` como se indicó en el Paso 3.

*Resiliencia:* Si el servicio de correo experimenta fallos o límites temporales, la evaluación se almacena igualmente en PostgreSQL y el cliente recibe confirmación de éxito. El error del correo se audita en la columna `notification_error`.

---

### Paso 6: Consulta y Exportación de Datos en Supabase Dashboard
Para consultar, filtrar y exportar las evaluaciones consolidadas sin necesidad de un panel administrativo en el cliente:

1. Accede a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard).
2. Dirígete a **Table Editor -> scientific_evaluations**.
3. Podrás inspeccionar en tiempo real cada registro recibido, su puntuación calculada, telemetría y respuestas cualitativas.
4. Para descargar todos los registros consolidados compatibles con Excel, R o Python, pulsa en el botón **"Export to CSV"** en la barra superior del Table Editor.
5. Para análisis estadísticos agregados, accede al **SQL Editor** y ejecuta consultas directas con privilegios de administrador.

---

### Paso 7: Configurar Variables del Cliente (Frontend)
Copia el archivo `.env.example` como `.env` en la raíz del proyecto local o configúralo en la plataforma de hosting (GitHub Pages, Vercel, Netlify):

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.tu_anon_key_publica
```

*Importante:* Nunca coloques la `SUPABASE_SERVICE_ROLE_KEY` en el archivo `.env` del frontend ni en variables con prefijo `VITE_`.

---

### Paso 8: Cómo Configurar Clones o Copias Descargadas de GitHub
Si un participante o evaluador descarga el repositorio o ejecuta una copia local:
- Si no dispone de `.env`, la aplicación detecta automáticamente el estado `unconfigured`. Guarda todas las respuestas en el `localStorage` del navegador y permite exportar en JSON/CSV sin interrumpir la actividad.
- Si la copia se distribuye para un taller o sesión experimental presencial, basta con incluir un archivo `.env` configurado con las dos variables públicas `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`. Todas las evaluaciones completadas en esas máquinas se enviarán a la misma base de datos central sin requerir ninguna instalación de servidor local.

---

## 3. Lista de Pasos Pendientes para el Propietario del Proyecto

Antes de declarar el sistema formalmente operativo en producción con participantes reales, debes completar los siguientes pasos en tu propia infraestructura:

- [ ] Crear el proyecto en [Supabase](https://supabase.com).
- [ ] Ejecutar el script SQL de migración en el editor de Supabase.
- [ ] Obtener una clave API en [Resend](https://resend.com) y configurar el correo receptor.
- [ ] Configurar los secretos en Supabase (`RESEND_API_KEY`, `RESEARCHER_NOTIFICATION_EMAIL`, `IP_SALT`).
- [ ] Desplegar la Edge Function `submit-evaluation`.
- [ ] Crear las variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en el entorno de despliegue frontend.
- [ ] Realizar un envío de prueba completo y verificar que aparezca en la tabla `scientific_evaluations`.
- [ ] Verificar la recepción del correo de notificación en la bandeja del investigador.
- [ ] Abrir Supabase Dashboard -> Table Editor -> scientific_evaluations, verificar la llegada del registro y exportar a CSV con el botón "Export to CSV".
