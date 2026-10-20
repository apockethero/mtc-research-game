# Política de Privacidad, Minimización y Gobernanza de Datos
## MTC Research Game — Instrumento de Validación Científica

---

### 1. Marco Ético y Principios Rectores

El instrumento de evaluación científica de **MTC Research Game** está diseñado para recopilar datos de validación empírica sobre la comprensión, trazabilidad, comparación, síntesis y esfuerzo cognitivo asociados al uso de las 49 tarjetas metodológicas MTC (enfocadas en el estado del arte de triciclos motorizados eléctricos).

La arquitectura de recolección y gobernanza se rige por los siguientes estándares:
* **Declaración de Helsinki** y pautas éticas internacionales para la investigación con participantes humanos.
* **Minimización de Datos (Privacy by Design / GDPR Art. 5c):** Se recolecta exclusivamente la información estrictamente necesaria para responder a las preguntas de investigación científica.
* **Principios FAIR (Findable, Accessible, Interoperable, Reusable):** Estructuración metódica de datasets para su reproducibilidad científica preservando la confidencialidad.
* **Seguridad en Capas:** Aislamiento perimetral entre el cliente frontend, el middleware serverless (Supabase Edge Function) y la base de datos relacional (PostgreSQL con Row Level Security).

---

### 2. Consentimiento Informado y Voluntariedad

1. **Requisito Obligatorio Previo:** Ningún dato es transmitido ni almacenado en el backend central sin la manifestación explícita, libre e informada del participante mediante la casilla de verificación de consentimiento (`consent_given = true`).
2. **Validación Criptográfica y de Esquema en Servidor:** Si un paquete de datos llega a la Edge Function sin la marca de consentimiento afirmativo (`consent_given !== true`), la solicitud es rechazada inmediatamente con código HTTP `400 Bad Request` antes de ejecutar cualquier transacción o análisis de datos.
3. **Derecho de Retiro y Autonomía:** El participante puede abandonar la prueba en cualquier momento cerrando la pestaña o reiniciando el flujo. Los datos no sincronizados permanecen únicamente en la memoria local de su navegador (`localStorage`) y son purgados si el usuario decide reiniciar la sesión.

---

### 3. Minimización y Seudonimización de Identificadores Técnicos

El sistema evita deliberadamente la recolección de Información de Identificación Personal (PII, por sus siglas en inglés):
* **No recolección de PII directa:** No se solicita cédula, documento de identidad, nombre real, dirección física, número de teléfono ni credenciales personales.
* **Seudonimización de Sesión (`sessionId` y `clientSubmissionId`):**
  * Cada intento de evaluación genera un identificador aleatorio de sesión (ej. `eval_1729452000000_a1b2c3d4e`) y un token de idempotencia criptográficamente seguro (`sub_eval_...`).
  * No se utilizan huellas digitales de hardware (Canvas Fingerprinting ni direcciones MAC).
* **Seudonimización Unidireccional de Direcciones IP:**
  * Las direcciones IP no se almacenan en texto plano en la base de datos.
  * La Edge Function concatena la IP del remitente con un secreto criptográfico de servidor (`IP_SALT`) y calcula un resumen SHA-256 (`ip_hash`).
  * Esto permite controlar ataques de denegación de servicio (DoS) y prevenir envíos masivos automatizados sin retener datos que permitan rastrear la conexión individual del participante.
* **Información del Agente de Usuario (`user_agent`):** Se almacena únicamente con fines de auditoría técnica y compatibilidad multiplataforma (resolución de pantalla, motor de renderizado y sistema operativo).

---

### 4. Salvaguardas Específicas para Niños, Jóvenes y Público No Académico

MTC Research Game dispone de una modalidad adaptada (**Modo Guiado / Lúdico**) destinada a públicos sin formación técnica especializada, incluyendo menores de edad en contextos educativos o ferias de ciencia:

1. **Lenguaje Claro y Comprensible:** Las consignas científicas se presentan en lenguaje cotidiano, eliminando jerga académica intimidante.
2. **Protección Reforzada:** En este modo no se exige ningún registro previo, correo electrónico ni cuenta de usuario.
3. **Protocolo Institucional en Aulas:** Cuando la recolección se realice en colegios o talleres infantiles, la aplicación debe ser administrada bajo la supervisión de un docente o investigador responsable, contando con el consentimiento informado institucional o de los padres/tutores legales conforme al protocolo del comité de ética de la institución participante.

---

### 5. Gestión de Riesgos en Respuestas Cualitativas Abiertas

En las etapas K4 (Síntesis) y K5 (Reflexión / Usabilidad), los participantes ingresan justificaciones y reflexiones en campos de texto libre:

* **Riesgo:** Inclusión inadvertida de datos personales por parte del participante (por ejemplo, firmas, menciones a personas específicas o correos institucionales).
* **Medidas Preventivas en Frontend:** Las instrucciones solicitan explícitamente responder desde una perspectiva técnica o metodológica sin incluir nombres personales o datos de contacto.
* **Curaduría Previa a la Publicación en Repositorios Abiertos:**
  * Los investigadores tienen la obligación ética de realizar un proceso de higienización de datos (*data sanitization*) antes de exportar o publicar datasets abiertos en plataformas como Zenodo, Figshare u OSF.
  * Cualquier mención fortuita a identidades individuales o institucionales en los campos `qualitative_synthesis` o `open_feedback` debe ser anonimizada con etiquetas como `[PARTICIPANTE_ANÓNIMO]` o `[INSTITUCIÓN_REDACTADA]`.

---

### 6. Notificaciones por Correo Electrónico sin Fuga de Privacidad

La Edge Function (`submit-evaluation`) incluye un mecanismo de alerta instantánea al investigador mediante la API de Resend:
* **Zero PII Exposure:** El cuerpo del correo electrónico de notificación **nunca incluye** el texto cualitativo abierto, ni el resumen de IP, ni respuestas detalladas de las etapas.
* **Contenido de la Notificación:** Únicamente reporta metadatos agregados de validación:
  * Modalidad (Académica vs. Guiada).
  * Puntuación global obtenida.
  * Tiempos totales de interacción por etapa.
  * Marca temporal de envío.
  * `sessionId` seudonimizado.
* **Resiliencia Operativa:** Si el servicio de correo experimenta fallas o demoras, la transacción de guardado en PostgreSQL **no se cancela**. El dato de la evaluación queda asegurado en la base de datos y el error del servicio de correo queda registrado internamente para auditoría.

---

### 7. Ciclo de Vida, Retención y Derecho de Supresión

| Fase | Duración | Procedimiento |
| :--- | :--- | :--- |
| **Recolección Activa** | Duración del estudio piloto | Almacenamiento seguro en PostgreSQL (Supabase) con encriptación en reposo (AES-256). |
| **Análisis y Validación** | 12 a 24 meses | Descargas consolidadas directamente desde Supabase Dashboard (Table Editor -> Export to CSV) o consultas SQL autenticadas en entorno seguro. |
| **Preservación a Largo Plazo** | 5 años post-publicación | Datasets curados y anonimizados almacenados en repositorios de investigación científica abierta (Zenodo/OSF). |
| **Derecho de Supresión (Eliminación)** | Solicitud a petición | Un participante puede contactar al investigador principal proveyendo su `sessionId` (visible en la interfaz final) para solicitar la eliminación irrevocable de su registro en la base de datos central. |

---

### 8. Seguridad y Control de Acceso (Matriz RLS)

```
                       +-----------------------------------+
                       | Cliente / Navegador Web           |
                       | (Anon / Participante)             |
                       +-----------------+-----------------+
                                         |
                                         | POST HTTPS (JSON < 500KB)
                                         v
                       +-----------------------------------+
                       | Supabase Edge Function            |
                       | submit-evaluation                 |
                       | - Validación de esquema y tamaño  |
                       | - Verificación de consentimiento  |
                       | - Hash salado de IP               |
                       | - Control de tasa de peticiones   |
                       | - Idempotencia (anti-duplicados)  |
                       +-----------------+-----------------+
                                         |
                                         | Service Role (Privilegiado interno)
                                         v
                       +-----------------------------------+
                       | PostgreSQL Database               |
                       | Tabla: scientific_evaluations     |
                       | RLS Activo:                       |
                       | - anon: Acceso CERO (No Read/No W)|
                       | - researcher: SELECT autenticado  |
                       | - service_role: ALL               |
                       +-----------------------------------+
                                         ^
                                         | SELECT / Export CSV (Autenticado)
                       +-----------------+-----------------+
                       | Supabase Dashboard                |
                       | (Table Editor / Export to CSV)    |
                       +-----------------------------------+
```

1. **Aislamiento Total del Rol Público (`anon`):**
   * Ningún cliente no autenticado puede ejecutar consultas `SELECT`, `UPDATE` o `DELETE` sobre la tabla `scientific_evaluations`.
   * Toda inserción pasa obligatoriamente a través del pipeline de la Edge Function.
2. **Protección del Rol Investigador (`authenticated`):**
   * Solo usuarios autenticados con cuentas autorizadas en Supabase Auth y vinculados en la tabla `researcher_profiles` tienen permisos de lectura para inspeccionar evaluaciones y descargar datasets consolidados.
3. **Gestión Estricta de Secretos:**
   * Las claves `SUPABASE_SERVICE_ROLE_KEY` y `RESEND_API_KEY` residen única y exclusivamente en el entorno seguro de Supabase Vault / Secrets.
   * Ninguna variable privada de servidor es empaquetada en la compilación de Vite ni expuesta en el repositorio Git.
