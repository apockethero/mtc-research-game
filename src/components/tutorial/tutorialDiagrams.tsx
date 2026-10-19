import React from 'react';

// Paleta oficial MTC Research Game
// Crimson: #B82C39, Copper: #D4783D, Peach: #FD995C, Rose: #D29884, Plum: #6C3745
// Backgrounds: #180d15, #22121e

const SvgContainer: React.FC<{ children: React.ReactNode; title: string }> = ({ children, title }) => (
  <div className="tutorial-svg-frame" role="img" aria-label={title}>
    <svg viewBox="0 0 520 220" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gradCrimsonPlum" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#B82C39" />
          <stop offset="100%" stopColor="#6C3745" />
        </linearGradient>
        <linearGradient id="gradPeachCopper" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FD995C" />
          <stop offset="100%" stopColor="#D4783D" />
        </linearGradient>
        <linearGradient id="gradBeam" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FD995C" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#D4783D" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#B82C39" stopOpacity="0.9" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <rect width="520" height="220" rx="10" fill="#150a12" stroke="#3d1d2b" strokeWidth="1.5" />
      {children}
    </svg>
  </div>
);

/* =========================================================================
   1. DIAGRAMAS PARA EL PUENTE DE CRONOLOGÍA (TIMELINE)
   ========================================================================= */

// Timeline Step 1: Línea temporal con tarjetas ubicadas en años
export const TimelineStep1Diagram: React.FC = () => (
  <SvgContainer title="Línea temporal con tarjetas organizadas por año de publicación">
    {/* Eje temporal */}
    <line x1="40" y1="120" x2="480" y2="120" stroke="#6C3745" strokeWidth="4" strokeDasharray="6,4" />
    <line x1="40" y1="120" x2="480" y2="120" stroke="#D4783D" strokeWidth="2" />
    <circle cx="40" cy="120" r="5" fill="#FD995C" />
    <polygon points="480,116 492,120 480,124" fill="#FD995C" />

    {/* Etiquetas de años */}
    <text x="50" y="145" fill="#D29884" fontSize="12" fontWeight="700">2012</text>
    <text x="180" y="145" fill="#D29884" fontSize="12" fontWeight="700">2018</text>
    <text x="320" y="145" fill="#D29884" fontSize="12" fontWeight="700">2022</text>
    <text x="440" y="145" fill="#FD995C" fontSize="12" fontWeight="700">2025</text>

    {/* Tarjetas en hitos */}
    {/* Hito 1 */}
    <g transform="translate(40, 35)">
      <rect width="90" height="65" rx="6" fill="#24121d" stroke="#D29884" strokeWidth="1.5" />
      <rect x="6" y="6" width="30" height="12" rx="3" fill="#6C3745" />
      <text x="10" y="15" fill="#fff" fontSize="8" fontWeight="bold">MTC01</text>
      <text x="50" y="15" fill="#FD995C" fontSize="9" fontWeight="bold">2012</text>
      <text x="8" y="32" fill="#fff" fontSize="8">Modelado inicial</text>
      <text x="8" y="44" fill="#D29884" fontSize="7">Pantoja (Simul)</text>
    </g>

    {/* Hito 2 */}
    <g transform="translate(170, 35)">
      <rect width="90" height="65" rx="6" fill="#24121d" stroke="#D4783D" strokeWidth="1.5" />
      <rect x="6" y="6" width="30" height="12" rx="3" fill="#B82C39" />
      <text x="10" y="15" fill="#fff" fontSize="8" fontWeight="bold">MTC09</text>
      <text x="50" y="15" fill="#FD995C" fontSize="9" fontWeight="bold">2018</text>
      <text x="8" y="32" fill="#fff" fontSize="8">Chasis antivuelco</text>
      <text x="8" y="44" fill="#D29884" fontSize="7">Kumar (Diseño)</text>
    </g>

    {/* Hito 3 */}
    <g transform="translate(310, 35)">
      <rect width="90" height="65" rx="6" fill="#24121d" stroke="#FD995C" strokeWidth="1.5" />
      <rect x="6" y="6" width="30" height="12" rx="3" fill="#6C3745" />
      <text x="10" y="15" fill="#fff" fontSize="8" fontWeight="bold">MTC22</text>
      <text x="50" y="15" fill="#FD995C" fontSize="9" fontWeight="bold">2022</text>
      <text x="8" y="32" fill="#fff" fontSize="8">Tren motriz híbrido</text>
      <text x="8" y="44" fill="#D29884" fontSize="7">García (Pruebas)</text>
    </g>

    {/* Hito 4 */}
    <g transform="translate(420, 35)">
      <rect width="90" height="65" rx="6" fill="#2a1422" stroke="#FD995C" strokeWidth="2" filter="url(#glow)" />
      <rect x="6" y="6" width="30" height="12" rx="3" fill="#B82C39" />
      <text x="10" y="15" fill="#fff" fontSize="8" fontWeight="bold">MTC49</text>
      <text x="50" y="15" fill="#FD995C" fontSize="9" fontWeight="bold">2025</text>
      <text x="8" y="32" fill="#fff" fontSize="8">Telemetría IoT</text>
      <text x="8" y="44" fill="#D29884" fontSize="7">Ramírez (Ruta)</text>
    </g>

    {/* Conectores hacia la línea de tiempo */}
    <line x1="85" y1="100" x2="85" y2="120" stroke="#D29884" strokeWidth="2" />
    <line x1="215" y1="100" x2="215" y2="120" stroke="#D4783D" strokeWidth="2" />
    <line x1="355" y1="100" x2="355" y2="120" stroke="#FD995C" strokeWidth="2" />
    <line x1="465" y1="100" x2="465" y2="120" stroke="#FD995C" strokeWidth="2" />

    {/* Pie explicativo */}
    <text x="260" y="195" textAnchor="middle" fill="#fcebe6" fontSize="12" fontWeight="600">
      Evolución Histórica: de la simulación conceptual (2012) a la frontera tecnológica (2025)
    </text>
  </SvgContainer>
);

// Timeline Step 2: Tarjeta académica con año y datos destacados
export const TimelineStep2Diagram: React.FC = () => (
  <SvgContainer title="Estructura de la tarjeta académica con año e indicadores">
    {/* Tarjeta principal detallada */}
    <g transform="translate(140, 20)">
      <rect width="240" height="165" rx="8" fill="#1f1019" stroke="#D4783D" strokeWidth="2" />
      {/* Cabecera */}
      <rect x="12" y="12" width="55" height="18" rx="4" fill="#B82C39" />
      <text x="18" y="25" fill="#ffffff" fontSize="11" fontWeight="bold">MTC09</text>

      {/* Insignia del año resaltada con resplandor */}
      <rect x="155" y="10" width="70" height="22" rx="5" fill="#FD995C" filter="url(#glow)" />
      <text x="162" y="25" fill="#140a10" fontSize="12" fontWeight="900">AÑO 2018</text>

      {/* Título de la investigación */}
      <text x="14" y="55" fill="#ffffff" fontSize="12" fontWeight="bold">Estabilidad Dinámica Antivuelco</text>
      <text x="14" y="70" fill="#D29884" fontSize="10">Kumar, S. · Journal of Heavy Vehicle Systems</text>

      {/* Mini imagen simulada */}
      <rect x="14" y="80" width="85" height="50" rx="4" fill="#2d1723" stroke="#6C3745" />
      <path d="M24 115 L45 95 L65 110 L85 90" stroke="#FD995C" strokeWidth="2" fill="none" />
      <circle cx="65" cy="110" r="3" fill="#D4783D" />

      {/* Especificaciones clave */}
      <text x="110" y="93" fill="#FD995C" fontSize="9" fontWeight="bold">METODOLOGÍA:</text>
      <text x="110" y="105" fill="#fcebe6" fontSize="9">Simulación multicuerpo y giro</text>
      <text x="110" y="118" fill="#FD995C" fontSize="9" fontWeight="bold">CALIDAD / CUARTIL:</text>
      <text x="110" y="129" fill="#15803d" fontSize="9" fontWeight="bold">Scopus Q1 · H-Index 42</text>

      {/* Barra de pie */}
      <rect x="0" y="145" width="240" height="20" rx="0 0 8 8" fill="#2c1421" />
      <text x="120" y="159" textAnchor="middle" fill="#D29884" fontSize="9">
        Haz clic en ↻ para voltear y ver la cita BibTeX completa
      </text>
    </g>

    {/* Flecha señalando el año */}
    <g transform="translate(425, 25)">
      <path d="M-20 8 L-5 8" stroke="#FD995C" strokeWidth="2" />
      <text x="0" y="12" fill="#FD995C" fontSize="11" fontWeight="bold">Dato Clave</text>
      <text x="0" y="26" fill="#D29884" fontSize="9">Para ubicar en</text>
      <text x="0" y="38" fill="#D29884" fontSize="9">el puente temporal</text>
    </g>
  </SvgContainer>
);

// Timeline Step 3: Arrastre o clic para colocar en ranuras
export const TimelineStep3Diagram: React.FC = () => (
  <SvgContainer title="Mecánica de arrastre y clic hacia los hitos del puente">
    {/* Bandeja inferior (pool de cartas) */}
    <rect x="40" y="130" width="440" height="75" rx="8" fill="#1b0e17" stroke="#3d1d2b" />
    <text x="55" y="148" fill="#D29884" fontSize="10" fontWeight="bold">BANDEJA DE CARTAS DISPONIBLES</text>

    {/* Cartas en bandeja */}
    <rect x="55" y="155" width="60" height="42" rx="4" fill="#281420" stroke="#6C3745" />
    <text x="62" y="172" fill="#fff" fontSize="8" fontWeight="bold">MTC01</text>
    <text x="62" y="185" fill="#FD995C" fontSize="9">2012</text>

    {/* Carta seleccionada en vuelo/arrastre */}
    <g transform="translate(200, 75)">
      <rect width="90" height="55" rx="6" fill="#2d1524" stroke="#FD995C" strokeWidth="2" filter="url(#glow)" />
      <text x="10" y="18" fill="#fff" fontSize="10" fontWeight="bold">MTC06</text>
      <text x="50" y="18" fill="#FD995C" fontSize="10" fontWeight="bold">2017</text>
      <text x="10" y="35" fill="#D29884" fontSize="8">Diseño Estructural</text>
      <text x="10" y="47" fill="#fff" fontSize="7">Batería extraíble</text>
    </g>

    {/* Flecha de arrastre punteada */}
    <path d="M 160 165 C 170 120, 210 110, 240 70" stroke="#FD995C" strokeWidth="2.5" strokeDasharray="5,4" fill="none" />
    <path d="M 290 70 C 330 60, 360 45, 380 40" stroke="#FD995C" strokeWidth="2.5" strokeDasharray="5,4" fill="none" />

    {/* Hito destino en la parte superior */}
    <g transform="translate(360, 15)">
      <rect width="110" height="70" rx="6" fill="#1f1019" stroke="#FD995C" strokeWidth="2" strokeDasharray="4,3" />
      <text x="55" y="30" textAnchor="middle" fill="#FD995C" fontSize="11" fontWeight="bold">Hito 2 (Vacío)</text>
      <text x="55" y="48" textAnchor="middle" fill="#D29884" fontSize="9">Suelta aquí o haz clic</text>
      <text x="55" y="60" textAnchor="middle" fill="#fcebe6" fontSize="8">para colocar automáticamente</text>
    </g>

    {/* Hito 1 ya ocupado */}
    <g transform="translate(60, 15)">
      <rect width="110" height="70" rx="6" fill="#24121d" stroke="#6C3745" />
      <text x="55" y="25" textAnchor="middle" fill="#D29884" fontSize="10">Hito 1 · 2012</text>
      <rect x="25" y="32" width="60" height="30" rx="4" fill="#140a10" />
      <text x="55" y="50" textAnchor="middle" fill="#15803d" fontSize="9" fontWeight="bold">✓ Colocado</text>
    </g>

    {/* Indicador de acción */}
    <text x="260" y="200" textAnchor="middle" fill="#FD995C" fontSize="11" fontWeight="600">
      Arrastra al espacio deseado o haz clic para ubicar en el primer hito libre
    </text>
  </SvgContainer>
);

// Timeline Step 4: Validación y detección de anacronismos
export const TimelineStep4Diagram: React.FC = () => (
  <SvgContainer title="Validación del puente y comparación de secuencia correcta vs anacronismo">
    {/* Botón Validar Puente */}
    <g transform="translate(190, 15)">
      <rect width="140" height="28" rx="6" fill="url(#gradCrimsonPlum)" stroke="#FD995C" strokeWidth="1" filter="url(#glow)" />
      <text x="70" y="19" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold">Validar Puente ⚡</text>
    </g>

    {/* Comparación lado a lado */}
    {/* Caso Error / Anacronismo */}
    <g transform="translate(30, 55)">
      <rect width="215" height="120" rx="8" fill="#200d14" stroke="#B82C39" strokeWidth="2" />
      <rect x="10" y="8" width="195" height="22" rx="4" fill="#3a121c" />
      <text x="107" y="23" textAnchor="middle" fill="#ff707a" fontSize="10" fontWeight="bold">⚠️ ANACRONISMO DETECTADO</text>

      {/* Tarjetas desordenadas */}
      <rect x="15" y="40" width="55" height="40" rx="4" fill="#2d121c" stroke="#6C3745" />
      <text x="42" y="58" textAnchor="middle" fill="#fff" fontSize="9">MTC18</text>
      <text x="42" y="72" textAnchor="middle" fill="#ff999f" fontSize="10" fontWeight="bold">2023</text>

      <text x="82" y="65" textAnchor="middle" fill="#ff707a" fontSize="14" fontWeight="bold">➔</text>

      <rect x="95" y="40" width="55" height="40" rx="4" fill="#2d121c" stroke="#B82C39" strokeWidth="1.5" />
      <text x="122" y="58" textAnchor="middle" fill="#fff" fontSize="9">MTC04</text>
      <text x="122" y="72" textAnchor="middle" fill="#ff999f" fontSize="10" fontWeight="bold">2016 ❌</text>

      <text x="107" y="100" textAnchor="middle" fill="#ff999f" fontSize="9">2023 no puede preceder a 2016</text>
      <text x="107" y="112" textAnchor="middle" fill="#D29884" fontSize="8">Reordena las tarjetas cronológicamente</text>
    </g>

    {/* Caso Éxito / Secuencia Correcta */}
    <g transform="translate(275, 55)">
      <rect width="215" height="120" rx="8" fill="#0d1f14" stroke="#15803d" strokeWidth="2" />
      <rect x="10" y="8" width="195" height="22" rx="4" fill="#14301e" />
      <text x="107" y="23" textAnchor="middle" fill="#4ade80" fontSize="10" fontWeight="bold">✨ PUENTE COHERENTE (ÉXITO)</text>

      {/* Tarjetas ordenadas */}
      <rect x="15" y="40" width="55" height="40" rx="4" fill="#13261a" stroke="#15803d" />
      <text x="42" y="58" textAnchor="middle" fill="#fff" fontSize="9">MTC04</text>
      <text x="42" y="72" textAnchor="middle" fill="#4ade80" fontSize="10" fontWeight="bold">2016</text>

      <text x="82" y="65" textAnchor="middle" fill="#4ade80" fontSize="14" fontWeight="bold">➔</text>

      <rect x="95" y="40" width="55" height="40" rx="4" fill="#13261a" stroke="#15803d" />
      <text x="122" y="58" textAnchor="middle" fill="#fff" fontSize="9">MTC18</text>
      <text x="122" y="72" textAnchor="middle" fill="#4ade80" fontSize="10" fontWeight="bold">2023 ✓</text>

      <text x="107" y="100" textAnchor="middle" fill="#4ade80" fontSize="9">Línea temporal validada con éxito</text>
      <text x="107" y="112" textAnchor="middle" fill="#d1fae5" fontSize="8">Narrativa histórica actualizada en borrador</text>
    </g>

    <text x="260" y="198" textAnchor="middle" fill="#D29884" fontSize="11">
      El sistema garantiza rigor epistemológico comprobando cada intervalo temporal
    </text>
  </SvgContainer>
);

// Timeline Step 5: Ayuda pedagógica y transferencia a la síntesis
export const TimelineStep5Diagram: React.FC = () => (
  <SvgContainer title="Auto-ordenación pedagógica y actualización de la síntesis académica">
    {/* Botón Ayuda Pedagógica */}
    <g transform="translate(40, 25)">
      <rect width="180" height="35" rx="6" fill="#23121c" stroke="#D4783D" strokeWidth="1.5" />
      <text x="90" y="42" textAnchor="middle" fill="#FD995C" fontSize="11" fontWeight="bold">
        Ayuda Pedagógica (Auto-ordenar)
      </text>
      <text x="90" y="54" textAnchor="middle" fill="#D29884" fontSize="8">
        Alineación automática de hitos
      </text>
    </g>

    {/* Flecha conectora */}
    <path d="M 230 42 L 290 42" stroke="#FD995C" strokeWidth="3" markerEnd="url(#arrow)" />
    <polygon points="290,38 300,42 290,46" fill="#FD995C" />

    {/* Documento Borrador de Tesis */}
    <g transform="translate(310, 20)">
      <rect width="170" height="175" rx="6" fill="#fff8f5" stroke="#D29884" strokeWidth="1.5" />
      <rect x="15" y="15" width="140" height="10" rx="2" fill="#B82C39" />
      <text x="85" y="23" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold">ESTADO DEL ARTE VIVO</text>

      <text x="15" y="45" fill="#241219" fontSize="9" fontWeight="bold">1. Evolución Histórica:</text>
      <rect x="15" y="52" width="140" height="4" rx="2" fill="#e7d5cc" />
      <rect x="15" y="60" width="120" height="4" rx="2" fill="#e7d5cc" />

      <text x="15" y="78" fill="#B82C39" fontSize="8" fontWeight="bold">[Pantoja et al., 2012]</text>
      <text x="15" y="88" fill="#555" fontSize="7">Inicia el modelado cinemático...</text>

      <text x="15" y="104" fill="#B82C39" fontSize="8" fontWeight="bold">[Kumar & Singh, 2018]</text>
      <text x="15" y="114" fill="#555" fontSize="7">Optimiza el antivuelco...</text>

      <text x="15" y="130" fill="#B82C39" fontSize="8" fontWeight="bold">[Ramírez et al., 2025]</text>
      <text x="15" y="140" fill="#555" fontSize="7">Implementa telemetría real...</text>

      <rect x="15" y="152" width="140" height="15" rx="3" fill="#2a1422" />
      <text x="85" y="162" textAnchor="middle" fill="#FD995C" fontSize="8" fontWeight="bold">Exportable a Markdown, BibTeX, PDF</text>
    </g>

    {/* Descripción abajo */}
    <g transform="translate(40, 80)">
      <rect width="250" height="100" rx="6" fill="#1d0e18" stroke="#3d1d2b" />
      <text x="15" y="22" fill="#FD995C" fontSize="10" fontWeight="bold">¿Cómo impacta en tu investigación?</text>
      <text x="15" y="40" fill="#fcebe6" fontSize="9">1. Cada hito validado genera un párrafo</text>
      <text x="15" y="52" fill="#fcebe6" fontSize="9">   estructurado con citas académicas.</text>
      <text x="15" y="68" fill="#fcebe6" fontSize="9">2. Demuestra la progresión tecnológica</text>
      <text x="15" y="80" fill="#fcebe6" fontSize="9">   sin lagunas temporales ni anacronismos.</text>
    </g>
  </SvgContainer>
);

/* =========================================================================
   2. DIAGRAMAS PARA LA MATRIZ DE ENFOQUES (MATRIX)
   ========================================================================= */

// Matrix Step 1: Cuadrícula epistemológica
export const MatrixStep1Diagram: React.FC = () => (
  <SvgContainer title="Estructura de la Matriz de Enfoques epistemológica">
    {/* Cabecera de la matriz */}
    <rect x="40" y="15" width="440" height="25" rx="4" fill="#23121c" stroke="#6C3745" />
    <text x="60" y="32" fill="#FD995C" fontSize="11" fontWeight="bold">MATRIZ EPISTEMOLÓGICA · CLASIFICACIÓN MULTIDIMENSIONAL</text>

    {/* 4 Cuadrantes */}
    <g transform="translate(40, 50)">
      {/* Cuadrante 1 */}
      <rect x="0" y="0" width="210" height="70" rx="6" fill="#1e0f19" stroke="#6C3745" strokeWidth="1.5" />
      <rect x="8" y="8" width="24" height="24" rx="4" fill="#3a1626" />
      <text x="14" y="24" fill="#FD995C" fontSize="14">💻</text>
      <text x="38" y="22" fill="#fff" fontSize="11" fontWeight="bold">Simulación y Modelado</text>
      <text x="12" y="44" fill="#D29884" fontSize="8">Modelos dinámicos, algoritmos y CAE</text>
      <text x="12" y="58" fill="#FD995C" fontSize="8">MTC01, MTC09, MTC36...</text>

      {/* Cuadrante 2 */}
      <rect x="230" y="0" width="210" height="70" rx="6" fill="#1e0f19" stroke="#6C3745" strokeWidth="1.5" />
      <rect x="238" y="8" width="24" height="24" rx="4" fill="#3a1626" />
      <text x="244" y="24" fill="#FD995C" fontSize="14">⚙️</text>
      <text x="268" y="22" fill="#fff" fontSize="11" fontWeight="bold">Diseño y Prototipado</text>
      <text x="242" y="44" fill="#D29884" fontSize="8">Chasis mecánico y baterías funcionales</text>
      <text x="242" y="58" fill="#FD995C" fontSize="8">MTC06, MTC14, MTC43...</text>

      {/* Cuadrante 3 */}
      <rect x="0" y="80" width="210" height="70" rx="6" fill="#1e0f19" stroke="#6C3745" strokeWidth="1.5" />
      <rect x="8" y="88" width="24" height="24" rx="4" fill="#3a1626" />
      <text x="14" y="104" fill="#FD995C" fontSize="14">🔬</text>
      <text x="38" y="102" fill="#fff" fontSize="11" fontWeight="bold">Pruebas Experimentales</text>
      <text x="12" y="124" fill="#D29884" fontSize="8">Bancos dinamométricos y ensayos en ruta</text>
      <text x="12" y="138" fill="#FD995C" fontSize="8">MTC18, MTC22, MTC31...</text>

      {/* Cuadrante 4 */}
      <rect x="230" y="80" width="210" height="70" rx="6" fill="#1e0f19" stroke="#6C3745" strokeWidth="1.5" />
      <rect x="238" y="88" width="24" height="24" rx="4" fill="#3a1626" />
      <text x="244" y="104" fill="#FD995C" fontSize="14">📊</text>
      <text x="268" y="102" fill="#fff" fontSize="11" fontWeight="bold">Estudios Empíricos y Políticas</text>
      <text x="242" y="124" fill="#D29884" fontSize="8">Encuestas, adopción y marcos legales</text>
      <text x="242" y="138" fill="#FD995C" fontSize="8">MTC02, MTC29, MTC49...</text>
    </g>

    <text x="260" y="212" textAnchor="middle" fill="#fcebe6" fontSize="10">
      Distribuye las tarjetas para mapear la cobertura epistemológica de tu estado del arte
    </text>
  </SvgContainer>
);

// Matrix Step 2: Criterios habilitados (selector único)
export const MatrixStep2Diagram: React.FC = () => (
  <SvgContainer title="Selector de criterios de análisis en la Matriz">
    {/* Barra de selector */}
    <g transform="translate(40, 20)">
      <rect width="440" height="40" rx="6" fill="#20101a" stroke="#6C3745" />
      <text x="20" y="25" fill="#D29884" fontSize="11" fontWeight="bold">Criterio Activo:</text>

      {/* Píldora 1: Activa */}
      <rect x="120" y="8" width="130" height="24" rx="12" fill="#FD995C" filter="url(#glow)" />
      <text x="185" y="24" textAnchor="middle" fill="#140a10" fontSize="10" fontWeight="bold">
        ✓ Categoría Temática
      </text>

      {/* Píldora 2 */}
      <rect x="260" y="8" width="100" height="24" rx="12" fill="#2b1422" stroke="#6C3745" />
      <text x="310" y="24" textAnchor="middle" fill="#D29884" fontSize="10">
        Metodología
      </text>

      {/* Píldora 3 */}
      <rect x="370" y="8" width="100" height="24" rx="12" fill="#2b1422" stroke="#6C3745" />
      <text x="420" y="24" textAnchor="middle" fill="#D29884" fontSize="10">
        Cuartiles Q1-Q4
      </text>
    </g>

    {/* Explicación de los 3 criterios */}
    <g transform="translate(40, 75)">
      {/* Caja 1 */}
      <rect x="0" y="0" width="140" height="110" rx="6" fill="#1a0c16" stroke="#D4783D" strokeWidth="1.5" />
      <text x="70" y="20" textAnchor="middle" fill="#FD995C" fontSize="10" fontWeight="bold">1. CATEGORÍA</text>
      <text x="12" y="40" fill="#fff" fontSize="8">• Chasis y ergonomía</text>
      <text x="12" y="55" fill="#fff" fontSize="8">• Batería y propulsión</text>
      <text x="12" y="70" fill="#fff" fontSize="8">• Logística y reparto</text>
      <text x="12" y="85" fill="#fff" fontSize="8">• Inclusión y normas</text>
      <text x="70" y="102" textAnchor="middle" fill="#FD995C" fontSize="7" fontWeight="bold">6 Cuadrantes oficiales</text>

      {/* Caja 2 */}
      <rect x="150" y="0" width="140" height="110" rx="6" fill="#1a0c16" stroke="#6C3745" />
      <text x="220" y="20" textAnchor="middle" fill="#D29884" fontSize="10" fontWeight="bold">2. METODOLOGÍA</text>
      <text x="162" y="40" fill="#fff" fontSize="8">• Simulación CAE</text>
      <text x="162" y="55" fill="#fff" fontSize="8">• Prototipo físico</text>
      <text x="162" y="70" fill="#fff" fontSize="8">• Ensayos de ruta</text>
      <text x="162" y="85" fill="#fff" fontSize="8">• Estudios empíricos</text>
      <text x="220" y="102" textAnchor="middle" fill="#D29884" fontSize="7">4 Cuadrantes técnicos</text>

      {/* Caja 3 */}
      <rect x="300" y="0" width="140" height="110" rx="6" fill="#1a0c16" stroke="#6C3745" />
      <text x="370" y="20" textAnchor="middle" fill="#D29884" fontSize="10" fontWeight="bold">3. CALIDAD BIBLIO</text>
      <text x="312" y="40" fill="#fff" fontSize="8">• Alto Impacto (Q1/Q2)</text>
      <text x="312" y="55" fill="#fff" fontSize="8">• Impacto Medio (Q3/Q4)</text>
      <text x="312" y="70" fill="#fff" fontSize="8">• Fuentes Técnicas</text>
      <text x="312" y="85" fill="#fff" fontSize="8">  (NQ / Proceedings)</text>
      <text x="370" y="102" textAnchor="middle" fill="#D29884" fontSize="7">3 Cuadrantes Scopus</text>
    </g>

    <text x="260" y="205" textAnchor="middle" fill="#D29884" fontSize="10">
      * Solo un criterio está activo simultáneamente para mantener coherencia en la clasificación
    </text>
  </SvgContainer>
);

// Matrix Step 3: Arrastre o selección de tarjeta al cuadrante
export const MatrixStep3Diagram: React.FC = () => (
  <SvgContainer title="Arrastre de tarjeta hacia el cuadrante correspondiente">
    {/* Cuadrante receptor */}
    <g transform="translate(180, 20)">
      <rect width="300" height="95" rx="8" fill="#291222" stroke="#FD995C" strokeWidth="2" strokeDasharray="5,3" filter="url(#glow)" />
      <text x="20" y="25" fill="#FD995C" fontSize="11" fontWeight="bold">⚡ Propulsión, Batería y Energía</text>
      <text x="20" y="42" fill="#fcebe6" fontSize="9">Zona receptora activa para tarjetas de tren motriz</text>
      <rect x="20" y="55" width="260" height="28" rx="4" fill="#180b14" />
      <text x="150" y="73" textAnchor="middle" fill="#FD995C" fontSize="10">Suelta la tarjeta aquí</text>
    </g>

    {/* Tarjeta arrastrada */}
    <g transform="translate(40, 60)">
      <rect width="110" height="70" rx="6" fill="#2d1525" stroke="#FD995C" strokeWidth="2" filter="url(#glow)" />
      <rect x="6" y="6" width="35" height="14" rx="3" fill="#B82C39" />
      <text x="10" y="17" fill="#fff" fontSize="9" fontWeight="bold">MTC43</text>
      <text x="10" y="36" fill="#fff" fontSize="9" fontWeight="bold">Batería LiFePO4</text>
      <text x="10" y="50" fill="#D29884" fontSize="8">Gestión térmica</text>
      <text x="10" y="62" fill="#FD995C" fontSize="8">Q1 · Elsevier</text>
    </g>

    {/* Flecha de movimiento */}
    <path d="M 155 95 C 190 95, 200 80, 220 70" stroke="#FD995C" strokeWidth="3" strokeDasharray="6,4" fill="none" />
    <polygon points="220,65 230,70 220,75" fill="#FD995C" />

    {/* Bandeja inferior */}
    <rect x="40" y="145" width="440" height="55" rx="6" fill="#180b13" stroke="#3d1d2b" />
    <text x="55" y="162" fill="#D29884" fontSize="9" fontWeight="bold">TARJETAS PENDIENTES DE CLASIFICAR</text>
    <rect x="55" y="170" width="50" height="24" rx="3" fill="#24121d" stroke="#6C3745" />
    <text x="65" y="186" fill="#fff" fontSize="8">MTC02</text>
    <rect x="115" y="170" width="50" height="24" rx="3" fill="#24121d" stroke="#6C3745" />
    <text x="125" y="186" fill="#fff" fontSize="8">MTC16</text>
    <rect x="175" y="170" width="50" height="24" rx="3" fill="#24121d" stroke="#6C3745" />
    <text x="185" y="186" fill="#fff" fontSize="8">MTC31</text>
  </SvgContainer>
);

// Matrix Step 4: Puntuación y justificación epistemológica
export const MatrixStep4Diagram: React.FC = () => (
  <SvgContainer title="Feedback de acierto (+100 puntos) y justificación de clasificación">
    {/* Panel Puntuación */}
    <g transform="translate(40, 25)">
      <rect width="180" height="155" rx="8" fill="#132418" stroke="#15803d" strokeWidth="2" />
      <text x="90" y="30" textAnchor="middle" fill="#4ade80" fontSize="11" fontWeight="bold">
        CLASIFICACIÓN ACERTADA
      </text>
      <rect x="40" y="45" width="100" height="40" rx="8" fill="#163821" filter="url(#glow)" />
      <text x="90" y="72" textAnchor="middle" fill="#4ade80" fontSize="20" fontWeight="900">
        +100 PTS
      </text>
      <text x="90" y="110" textAnchor="middle" fill="#d1fae5" fontSize="10">
        ¡Excelente discernimiento!
      </text>
      <text x="90" y="125" textAnchor="middle" fill="#d1fae5" fontSize="9">
        Tarjeta asignada con rigor
      </text>
      <text x="90" y="140" textAnchor="middle" fill="#4ade80" fontSize="9" fontWeight="bold">
        al cuadrante correcto
      </text>
    </g>

    {/* Panel Justificación de error */}
    <g transform="translate(240, 25)">
      <rect width="240" height="155" rx="8" fill="#241018" stroke="#B82C39" strokeWidth="2" />
      <text x="120" y="25" textAnchor="middle" fill="#ff707a" fontSize="10" fontWeight="bold">
        ⚠️ EN CASO DE CLASIFICACIÓN ERRÓNEA
      </text>
      <rect x="12" y="35" width="216" height="105" rx="6" fill="#190a10" stroke="#6C3745" />
      <text x="20" y="55" fill="#ff999f" fontSize="9" fontWeight="bold">Alerta Epistemológica:</text>
      <text x="20" y="72" fill="#ffffff" fontSize="9">"Chasis Tubular" (MTC06) no pertenece</text>
      <text x="20" y="85" fill="#ffffff" fontSize="9">a Simulación Numérica, sino a:</text>
      <text x="20" y="103" fill="#FD995C" fontSize="10" fontWeight="bold">➔ "Diseño y Prototipado Físico"</text>
      <text x="20" y="122" fill="#D29884" fontSize="8">El sistema explica el porqué antes de corregir</text>
    </g>

    <text x="260" y="205" textAnchor="middle" fill="#D29884" fontSize="10">
      Cada acierto o error refuerza el dominio conceptual del investigador
    </text>
  </SvgContainer>
);

// Matrix Step 5: Clasificar todo y tabla comparativa
export const MatrixStep5Diagram: React.FC = () => (
  <SvgContainer title="Herramienta Clasificar Todo y construcción de la tabla comparativa de síntesis">
    {/* Botón Clasificar Todo */}
    <g transform="translate(40, 25)">
      <rect width="180" height="35" rx="6" fill="#23121c" stroke="#D4783D" strokeWidth="1.5" />
      <text x="90" y="42" textAnchor="middle" fill="#FD995C" fontSize="11" fontWeight="bold">
        Clasificar Todo (Demostración)
      </text>
      <text x="90" y="54" textAnchor="middle" fill="#D29884" fontSize="8">
        Mapeo integral de 16 investigaciones
      </text>
    </g>

    {/* Flecha conectora */}
    <path d="M 230 42 L 285 42" stroke="#FD995C" strokeWidth="3" />
    <polygon points="285,38 295,42 285,46" fill="#FD995C" />

    {/* Tabla comparativa de la síntesis */}
    <g transform="translate(300, 20)">
      <rect width="180" height="175" rx="6" fill="#fff8f5" stroke="#D29884" strokeWidth="1.5" />
      <rect x="10" y="12" width="160" height="18" rx="3" fill="#6C3745" />
      <text x="90" y="25" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold">
        TABLA COMPARATIVA DE ENFOQUES
      </text>

      {/* Filas */}
      <rect x="10" y="38" width="160" height="24" fill="#fcf3ee" stroke="#f0dfd5" />
      <text x="15" y="50" fill="#241219" fontSize="8" fontWeight="bold">MTC01 · Pantoja</text>
      <rect x="120" y="42" width="45" height="14" rx="2" fill="#15803d" />
      <text x="142" y="52" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="bold">Q1 · Simul</text>

      <rect x="10" y="65" width="160" height="24" fill="#ffffff" stroke="#f0dfd5" />
      <text x="15" y="77" fill="#241219" fontSize="8" fontWeight="bold">MTC06 · Kumar</text>
      <rect x="120" y="69" width="45" height="14" rx="2" fill="#D4783D" />
      <text x="142" y="79" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="bold">Q2 · Protot</text>

      <rect x="10" y="92" width="160" height="24" fill="#fcf3ee" stroke="#f0dfd5" />
      <text x="15" y="104" fill="#241219" fontSize="8" fontWeight="bold">MTC22 · García</text>
      <rect x="120" y="96" width="45" height="14" rx="2" fill="#b45309" />
      <text x="142" y="106" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="bold">Q3 · Ensayos</text>

      <rect x="10" y="119" width="160" height="24" fill="#ffffff" stroke="#f0dfd5" />
      <text x="15" y="131" fill="#241219" fontSize="8" fontWeight="bold">MTC49 · Ramírez</text>
      <rect x="120" y="123" width="45" height="14" rx="2" fill="#15803d" />
      <text x="142" y="133" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="bold">Q1 · Empírico</text>

      <text x="90" y="160" textAnchor="middle" fill="#B82C39" fontSize="7" fontWeight="bold">
        Matriz transferida a la síntesis académica
      </text>
    </g>

    {/* Cuadro de aviso */}
    <g transform="translate(40, 80)">
      <rect width="240" height="100" rx="6" fill="#1d0e18" stroke="#3d1d2b" />
      <text x="15" y="22" fill="#FD995C" fontSize="10" fontWeight="bold">Uso crítico de la herramienta:</text>
      <text x="15" y="40" fill="#fcebe6" fontSize="9">"Clasificar Todo" es un recurso didáctico</text>
      <text x="15" y="52" fill="#fcebe6" fontSize="9">para apreciar la matriz consolidada.</text>
      <text x="15" y="68" fill="#D29884" fontSize="9">No reemplaza el ejercicio de lectura</text>
      <text x="15" y="80" fill="#D29884" fontSize="9">crítica de cada artículo por el tesista.</text>
    </g>
  </SvgContainer>
);

/* =========================================================================
   3. DIAGRAMAS PARA CAZADORES DE VACÍOS (GAP HUNTER)
   ========================================================================= */

// GapHunter Step 1: Qué es una brecha de investigación
export const GapHunterStep1Diagram: React.FC = () => (
  <SvgContainer title="Definición de brecha de investigación entre antecedentes">
    {/* Tarjeta A */}
    <g transform="translate(40, 40)">
      <rect width="130" height="90" rx="6" fill="#24121e" stroke="#B82C39" strokeWidth="1.5" />
      <text x="12" y="22" fill="#fff" fontSize="10" fontWeight="bold">Estudio A (Chasis)</text>
      <text x="12" y="38" fill="#FD995C" fontSize="8" fontWeight="bold">Aporte:</text>
      <text x="12" y="50" fill="#fcebe6" fontSize="8">Optimización de peso</text>
      <text x="12" y="68" fill="#ff707a" fontSize="8" fontWeight="bold">Limitación:</text>
      <text x="12" y="80" fill="#ff999f" fontSize="7">Solo pruebas estáticas</text>
    </g>

    {/* Tarjeta B */}
    <g transform="translate(350, 40)">
      <rect width="130" height="90" rx="6" fill="#24121e" stroke="#D4783D" strokeWidth="1.5" />
      <text x="12" y="22" fill="#fff" fontSize="10" fontWeight="bold">Estudio B (Logística)</text>
      <text x="12" y="38" fill="#FD995C" fontSize="8" fontWeight="bold">Aporte:</text>
      <text x="12" y="50" fill="#fcebe6" fontSize="8">Rutas de última milla</text>
      <text x="12" y="68" fill="#ff707a" fontSize="8" fontWeight="bold">Limitación:</text>
      <text x="12" y="80" fill="#ff999f" fontSize="7">No evalúa baches ni fatiga</text>
    </g>

    {/* Vacío central */}
    <g transform="translate(200, 30)">
      <circle cx="60" cy="55" r="45" fill="#1b0814" stroke="#FD995C" strokeWidth="2.5" filter="url(#glow)" />
      <text x="60" y="50" textAnchor="middle" fill="#FD995C" fontSize="26" fontWeight="900">?</text>
      <text x="60" y="70" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">VACÍO CIENTÍFICO</text>
      <text x="60" y="82" textAnchor="middle" fill="#D29884" fontSize="7">(Research Gap)</text>
    </g>

    {/* Flechas convergentes */}
    <path d="M 175 85 L 210 85" stroke="#ff707a" strokeWidth="2" strokeDasharray="4,3" />
    <polygon points="210,81 218,85 210,89" fill="#ff707a" />

    <path d="M 345 85 L 310 85" stroke="#ff707a" strokeWidth="2" strokeDasharray="4,3" />
    <polygon points="310,81 302,85 310,89" fill="#ff707a" />

    {/* Texto inferior */}
    <rect x="40" y="150" width="440" height="50" rx="6" fill="#180b13" stroke="#3d1d2b" />
    <text x="260" y="170" textAnchor="middle" fill="#FD995C" fontSize="11" fontWeight="bold">
      La brecha surge donde las limitaciones de la literatura se entrecruzan
    </text>
    <text x="260" y="186" textAnchor="middle" fill="#fcebe6" fontSize="9">
      El sistema genera una hipótesis relacional que justifica la necesidad de tu propia tesis
    </text>
  </SvgContainer>
);

// GapHunter Step 2: Exploración de nodos de la constelación
export const GapHunterStep2Diagram: React.FC = () => (
  <SvgContainer title="Constelación espacial orbital de investigaciones">
    {/* Órbita elíptica */}
    <ellipse cx="260" cy="110" rx="190" ry="70" fill="none" stroke="#3d1d2b" strokeWidth="1.5" strokeDasharray="6,4" />

    {/* Sol / Foco central */}
    <circle cx="260" cy="110" r="14" fill="#B82C39" filter="url(#glow)" />
    <text x="260" y="114" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold">MTC</text>

    {/* Nodos distribuidos en órbita */}
    <g transform="translate(100, 70)">
      <circle cx="20" cy="20" r="20" fill="#25121e" stroke="#FD995C" strokeWidth="1.5" />
      <text x="20" y="24" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="bold">MTC06</text>
    </g>

    <g transform="translate(240, 20)">
      <circle cx="20" cy="20" r="20" fill="#25121e" stroke="#6C3745" strokeWidth="1.5" />
      <text x="20" y="24" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="bold">MTC43</text>
    </g>

    <g transform="translate(380, 70)">
      <circle cx="20" cy="20" r="20" fill="#25121e" stroke="#6C3745" strokeWidth="1.5" />
      <text x="20" y="24" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="bold">MTC49</text>
    </g>

    <g transform="translate(320, 140)">
      <circle cx="20" cy="20" r="20" fill="#25121e" stroke="#6C3745" strokeWidth="1.5" />
      <text x="20" y="24" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="bold">MTC22</text>
    </g>

    <g transform="translate(160, 140)">
      <circle cx="20" cy="20" r="20" fill="#25121e" stroke="#6C3745" strokeWidth="1.5" />
      <text x="20" y="24" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="bold">MTC02</text>
    </g>

    {/* Ficha flotante al hacer hover o clic */}
    <g transform="translate(20, 10)">
      <rect width="130" height="60" rx="5" fill="#1b0a14" stroke="#FD995C" strokeWidth="1.5" />
      <text x="8" y="16" fill="#FD995C" fontSize="9" fontWeight="bold">MTC06 · Kumar (2017)</text>
      <text x="8" y="28" fill="#fff" fontSize="8">Chasis y baterías</text>
      <text x="8" y="42" fill="#D29884" fontSize="7">Limitación declarada:</text>
      <text x="8" y="52" fill="#fcebe6" fontSize="7">Sin telemetría de fatiga</text>
    </g>

    <text x="260" y="205" textAnchor="middle" fill="#D29884" fontSize="10">
      Cada nodo orbital es una publicación indexada: haz clic para seleccionarla
    </text>
  </SvgContainer>
);

// GapHunter Step 3: Conexión de 2 o 3 tarjetas
export const GapHunterStep3Diagram: React.FC = () => (
  <SvgContainer title="Selección de 2 a 3 nodos en la constelación">
    {/* Tres nodos seleccionados con halo */}
    {/* Nodo 1 */}
    <g transform="translate(80, 50)">
      <circle cx="35" cy="35" r="32" fill="#2b1323" stroke="#FD995C" strokeWidth="2.5" filter="url(#glow)" />
      <text x="35" y="32" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="bold">MTC06</text>
      <text x="35" y="46" textAnchor="middle" fill="#FD995C" fontSize="9">Chasis</text>
      <circle cx="55" cy="15" r="8" fill="#15803d" />
      <text x="55" y="19" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="bold">✓</text>
    </g>

    {/* Nodo 2 */}
    <g transform="translate(370, 50)">
      <circle cx="35" cy="35" r="32" fill="#2b1323" stroke="#FD995C" strokeWidth="2.5" filter="url(#glow)" />
      <text x="35" y="32" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="bold">MTC43</text>
      <text x="35" y="46" textAnchor="middle" fill="#FD995C" fontSize="9">Batería</text>
      <circle cx="55" cy="15" r="8" fill="#15803d" />
      <text x="55" y="19" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="bold">✓</text>
    </g>

    {/* Nodo 3 */}
    <g transform="translate(225, 120)">
      <circle cx="35" cy="35" r="32" fill="#2b1323" stroke="#FD995C" strokeWidth="2.5" filter="url(#glow)" />
      <text x="35" y="32" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="bold">MTC49</text>
      <text x="35" y="46" textAnchor="middle" fill="#FD995C" fontSize="9">IoT / Ruta</text>
      <circle cx="55" cy="15" r="8" fill="#15803d" />
      <text x="55" y="19" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="bold">✓</text>
    </g>

    {/* Líneas tenues de relación */}
    <line x1="145" y1="85" x2="370" y2="85" stroke="#FD995C" strokeWidth="1.5" strokeDasharray="4,4" />
    <line x1="115" y1="115" x2="225" y2="155" stroke="#FD995C" strokeWidth="1.5" strokeDasharray="4,4" />
    <line x1="405" y1="115" x2="295" y2="155" stroke="#FD995C" strokeWidth="1.5" strokeDasharray="4,4" />

    {/* Contador de selección */}
    <g transform="translate(195, 20)">
      <rect width="130" height="26" rx="13" fill="#28111e" stroke="#FD995C" strokeWidth="1.5" />
      <text x="65" y="17" textAnchor="middle" fill="#FD995C" fontSize="10" fontWeight="bold">
        Nodos Activos: (3/3)
      </text>
    </g>

    <text x="260" y="205" textAnchor="middle" fill="#fcebe6" fontSize="10">
      Selecciona entre 2 y 3 artículos para cruzarlos; al superar 3, el más antiguo se desmarca
    </text>
  </SvgContainer>
);

// GapHunter Step 4: Proyección del haz digital luminoso
export const GapHunterStep4Diagram: React.FC = () => (
  <SvgContainer title="Proyección del haz digital luminoso conectando los nodos">
    {/* Nodos */}
    <circle cx="100" cy="110" r="28" fill="#2d1324" stroke="#FD995C" strokeWidth="2" />
    <text x="100" y="114" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">MTC06</text>

    <circle cx="420" cy="110" r="28" fill="#2d1324" stroke="#FD995C" strokeWidth="2" />
    <text x="420" y="114" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">MTC43</text>

    {/* Haz digital láser con resplandor */}
    <line x1="128" y1="110" x2="392" y2="110" stroke="#FD995C" strokeWidth="8" strokeOpacity="0.4" filter="url(#glow)" />
    <line x1="128" y1="110" x2="392" y2="110" stroke="url(#gradBeam)" strokeWidth="3.5" />

    {/* Partículas de energía */}
    <circle cx="210" cy="110" r="4" fill="#ffffff" filter="url(#glow)" />
    <circle cx="260" cy="110" r="5" fill="#FD995C" filter="url(#glow)" />
    <circle cx="310" cy="110" r="4" fill="#ffffff" filter="url(#glow)" />

    {/* Botón Trazar Haz */}
    <g transform="translate(150, 20)">
      <rect width="220" height="36" rx="18" fill="url(#gradCrimsonPlum)" stroke="#FD995C" strokeWidth="1.5" filter="url(#glow)" />
      <text x="110" y="23" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="bold">
        Trazar Haz Digital y Revelar Vacío ⚡
      </text>
    </g>

    {/* Impacto del análisis */}
    <g transform="translate(160, 140)">
      <rect width="200" height="45" rx="6" fill="#1f0c18" stroke="#D4783D" strokeWidth="1" />
      <text x="100" y="20" textAnchor="middle" fill="#FD995C" fontSize="10" fontWeight="bold">
        Síntesis Relacional Activada
      </text>
      <text x="100" y="34" textAnchor="middle" fill="#d29884" fontSize="8">
        Cruzando limitaciones estructurales y energéticas...
      </text>
    </g>

    <text x="260" y="208" textAnchor="middle" fill="#D29884" fontSize="10">
      El haz emite una frecuencia acústica procedural y dispara el descubrimiento
    </text>
  </SvgContainer>
);

// GapHunter Step 5: Brecha descubierta transferida a la síntesis
export const GapHunterStep5Diagram: React.FC = () => (
  <SvgContainer title="Brecha descubierta y su incorporación en la síntesis académica">
    {/* Tarjeta de la Brecha Descubierta */}
    <g transform="translate(40, 20)">
      <rect width="220" height="155" rx="8" fill="#24111d" stroke="#FD995C" strokeWidth="2" filter="url(#glow)" />
      <rect x="10" y="10" width="200" height="22" rx="4" fill="#B82C39" />
      <text x="110" y="24" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="bold">
        ⚡ VACÍO DE INVESTIGACIÓN DESCUBIERTO
      </text>

      <text x="12" y="48" fill="#FD995C" fontSize="9" fontWeight="bold">TÍTULO:</text>
      <text x="12" y="60" fill="#fff" fontSize="8">Desacoplamiento Estructural-Batería</text>

      <text x="12" y="78" fill="#D29884" fontSize="8" fontWeight="bold">DESCRIPCIÓN:</text>
      <text x="12" y="90" fill="#fcebe6" fontSize="7">MTC06 optimiza el chasis pero advierte</text>
      <text x="12" y="100" fill="#fcebe6" fontSize="7">"sin ensayos de vibración en ruta", mientras</text>
      <text x="12" y="110" fill="#fcebe6" fontSize="7">MTC43 modela batería sin fatiga mecánica.</text>

      <rect x="10" y="122" width="200" height="24" rx="4" fill="#381525" />
      <text x="110" y="137" textAnchor="middle" fill="#4ade80" fontSize="8" fontWeight="bold">
        ✓ Justificación añadida a la Tesis
      </text>
    </g>

    {/* Flecha hacia borrador */}
    <path d="M 270 95 L 300 95" stroke="#FD995C" strokeWidth="3" />
    <polygon points="300,91 310,95 300,99" fill="#FD995C" />

    {/* Borrador de Tesis */}
    <g transform="translate(320, 20)">
      <rect width="160" height="155" rx="6" fill="#fff8f5" stroke="#D29884" strokeWidth="1.5" />
      <rect x="10" y="12" width="140" height="15" rx="3" fill="#6C3745" />
      <text x="80" y="23" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold">
        BORRADOR DE TESIS
      </text>

      <text x="10" y="45" fill="#B82C39" fontSize="9" fontWeight="bold">Capítulo 2: Justificación</text>
      <text x="10" y="60" fill="#333" fontSize="8" fontWeight="bold">2.1 Brechas en la Literatura:</text>
      <text x="10" y="75" fill="#555" fontSize="7">A partir del contraste entre</text>
      <text x="10" y="85" fill="#555" fontSize="7">Kumar (2017) y García (2022),</text>
      <text x="10" y="95" fill="#555" fontSize="7">se evidencia la necesidad de</text>
      <text x="10" y="105" fill="#555" fontSize="7">diseñar un soporte de celda con</text>
      <text x="10" y="115" fill="#555" fontSize="7">amortiguamiento elastomérico...</text>

      <rect x="10" y="130" width="140" height="16" rx="3" fill="#15803d" />
      <text x="80" y="141" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="bold">
        Base sólida para marco teórico
      </text>
    </g>

    <text x="260" y="205" textAnchor="middle" fill="#D29884" fontSize="10">
      Cada vacío descubierto se consolida directamente en las secciones exportables
    </text>
  </SvgContainer>
);

/* =========================================================================
   4. DIAGRAMAS PARA COMBATES DE VALIDACIÓN (COMBAT)
   ========================================================================= */

// Combat Step 1: Qué es un combate de validación
export const CombatStep1Diagram: React.FC = () => (
  <SvgContainer title="Esquema de combate conceptual entre dos investigaciones">
    {/* Esquina Azul: Hito Base */}
    <g transform="translate(40, 30)">
      <rect width="160" height="130" rx="8" fill="#162232" stroke="#2563eb" strokeWidth="2" />
      <rect x="10" y="10" width="140" height="20" rx="4" fill="#1e3a8a" />
      <text x="80" y="24" textAnchor="middle" fill="#93c5fd" fontSize="9" fontWeight="bold">
        🔵 ANTECEDENTE BASE
      </text>
      <text x="15" y="48" fill="#fff" fontSize="10" fontWeight="bold">MTC22 · García (2022)</text>
      <text x="15" y="62" fill="#93c5fd" fontSize="8">Tren Motriz Híbrido</text>
      <rect x="15" y="70" width="130" height="40" rx="4" fill="#0f172a" />
      <text x="20" y="85" fill="#cbd5e1" fontSize="7">Enfoque: Banco de pruebas</text>
      <text x="20" y="98" fill="#ff999f" fontSize="7">Límite: Sin regeneración</text>
    </g>

    {/* Emblema VS central */}
    <g transform="translate(230, 65)">
      <circle cx="30" cy="30" r="28" fill="#2d1222" stroke="#FD995C" strokeWidth="2" filter="url(#glow)" />
      <text x="30" y="38" textAnchor="middle" fill="#FD995C" fontSize="22" fontWeight="900">VS</text>
    </g>

    {/* Esquina Roja: Antecedente Desafiante */}
    <g transform="translate(320, 30)">
      <rect width="160" height="130" rx="8" fill="#26131c" stroke="#B82C39" strokeWidth="2" />
      <rect x="10" y="10" width="140" height="20" rx="4" fill="#6C3745" />
      <text x="80" y="24" textAnchor="middle" fill="#ff999f" fontSize="9" fontWeight="bold">
        🔴 ANTECEDENTE RETADOR
      </text>
      <text x="15" y="48" fill="#fff" fontSize="10" fontWeight="bold">MTC23 · Chen (2023)</text>
      <text x="15" y="62" fill="#ff999f" fontSize="8">Frenado Regenerativo</text>
      <rect x="15" y="70" width="130" height="40" rx="4" fill="#1b0812" />
      <text x="20" y="85" fill="#fcebe6" fontSize="7">Enfoque: Control vectorial</text>
      <text x="20" y="98" fill="#4ade80" fontSize="7">Aporte: Recupera 18% kWh</text>
    </g>

    <text x="260" y="195" textAnchor="middle" fill="#FD995C" fontSize="11" fontWeight="600">
      Enfrenta dos estudios para discernir si el retador es novedad, complemento o redundancia
    </text>
  </SvgContainer>
);

// Combat Step 2: Selección de investigaciones en esquinas
export const CombatStep2Diagram: React.FC = () => (
  <SvgContainer title="Selectores de esquina para elegir investigaciones">
    {/* Selector Izquierdo */}
    <g transform="translate(40, 30)">
      <text x="0" y="15" fill="#93c5fd" fontSize="10" fontWeight="bold">1. Seleccionar Antecedente Base:</text>
      <rect x="0" y="25" width="200" height="35" rx="6" fill="#190e15" stroke="#6C3745" />
      <text x="12" y="46" fill="#ffffff" fontSize="10">MTC22: García (2022)...</text>
      <text x="180" y="46" fill="#FD995C" fontSize="10">▼</text>
    </g>

    {/* Selector Derecho */}
    <g transform="translate(280, 30)">
      <text x="0" y="15" fill="#ff999f" fontSize="10" fontWeight="bold">2. Seleccionar Antecedente Retador:</text>
      <rect x="0" y="25" width="200" height="35" rx="6" fill="#190e15" stroke="#6C3745" />
      <text x="12" y="46" fill="#ffffff" fontSize="10">MTC23: Chen (2023)...</text>
      <text x="180" y="46" fill="#FD995C" fontSize="10">▼</text>
    </g>

    {/* Fichas técnicas desplegadas */}
    <g transform="translate(40, 85)">
      <rect width="200" height="85" rx="6" fill="#1a1424" stroke="#2563eb" strokeWidth="1" />
      <text x="10" y="20" fill="#93c5fd" fontSize="9" fontWeight="bold">Ficha Técnica Base:</text>
      <text x="10" y="36" fill="#fff" fontSize="8">• Metodología: Pruebas Dinamométricas</text>
      <text x="10" y="50" fill="#fff" fontSize="8">• Categoría: Propulsión y Energía</text>
      <text x="10" y="64" fill="#fff" fontSize="8">• Calidad: Scopus Q1 · H-Index 38</text>
    </g>

    <g transform="translate(280, 85)">
      <rect width="200" height="85" rx="6" fill="#24141d" stroke="#B82C39" strokeWidth="1" />
      <text x="10" y="20" fill="#ff999f" fontSize="9" fontWeight="bold">Ficha Técnica Retador:</text>
      <text x="10" y="36" fill="#fff" fontSize="8">• Metodología: Algoritmo de Control</text>
      <text x="10" y="50" fill="#fff" fontSize="8">• Categoría: Propulsión y Batería</text>
      <text x="10" y="64" fill="#fff" fontSize="8">• Calidad: Scopus Q2 · H-Index 24</text>
    </g>

    <text x="260" y="200" textAnchor="middle" fill="#D29884" fontSize="10">
      Compara ambos marcos antes de calcular el solapamiento o emitir tu veredicto
    </text>
  </SvgContainer>
);

// Combat Step 3: Barra de solapamiento conceptual (heurística)
export const CombatStep3Diagram: React.FC = () => (
  <SvgContainer title="Indicador de solapamiento conceptual orientativo">
    {/* Panel central de solapamiento */}
    <g transform="translate(60, 25)">
      <rect width="400" height="135" rx="8" fill="#1f1019" stroke="#6C3745" strokeWidth="1.5" />
      <text x="200" y="25" textAnchor="middle" fill="#fcebe6" fontSize="11" fontWeight="bold">
        SOLAPAMIENTO CONCEPTUAL (HEURÍSTICA ORIENTATIVA)
      </text>

      {/* Barra de progreso */}
      <rect x="30" y="45" width="340" height="20" rx="10" fill="#2d1522" stroke="#3d1d2b" />
      {/* Relleno al 70% */}
      <rect x="30" y="45" width="238" height="20" rx="10" fill="url(#gradBeam)" filter="url(#glow)" />
      <text x="150" y="59" fill="#140a10" fontSize="11" fontWeight="900">70% SOLAPAMIENTO</text>

      {/* Explicación de la fórmula en el código */}
      <g transform="translate(30, 75)">
        <text x="0" y="16" fill="#FD995C" fontSize="9" fontWeight="bold">Fórmula de cálculo heurístico del sistema:</text>
        <text x="0" y="30" fill="#D29884" fontSize="8">• Base inicial: 30%</text>
        <text x="0" y="42" fill="#D29884" fontSize="8">• Misma categoría temática: +40%</text>
        <text x="170" y="30" fill="#D29884" fontSize="8">• Misma clase metodológica: +20%</text>
        <text x="170" y="42" fill="#D29884" fontSize="8">• Máximo acotado por sistema: 95%</text>
      </g>
    </g>

    {/* Nota epistemológica */}
    <text x="260" y="185" textAnchor="middle" fill="#ff707a" fontSize="10" fontWeight="bold">
      ⚠️ Nota: Es una métrica heurística interna de apoyo, no un indicador bibliométrico universal
    </text>
    <text x="260" y="200" textAnchor="middle" fill="#D29884" fontSize="9">
      El investigador humano determina el veredicto final valorando el contexto del artículo
    </text>
  </SvgContainer>
);

// Combat Step 4: Los tres veredictos posibles
export const CombatStep4Diagram: React.FC = () => (
  <SvgContainer title="Opciones de veredicto crítico: Hito, Complementaria o Redundante">
    {/* Tres botones de veredicto */}
    {/* Veredicto 1: Hito Novedoso */}
    <g transform="translate(30, 25)">
      <rect width="140" height="135" rx="8" fill="#2b111e" stroke="#B82C39" strokeWidth="2" />
      <rect x="10" y="10" width="120" height="26" rx="4" fill="url(#gradCrimsonPlum)" />
      <text x="70" y="27" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">
        🏆 Hito Novedoso
      </text>
      <text x="12" y="55" fill="#FD995C" fontSize="8" fontWeight="bold">CRITERIO:</text>
      <text x="12" y="70" fill="#fcebe6" fontSize="8">El retador introduce un</text>
      <text x="12" y="82" fill="#fcebe6" fontSize="8">avance cualitativo</text>
      <text x="12" y="94" fill="#fcebe6" fontSize="8">sustancial frente al</text>
      <text x="12" y="106" fill="#fcebe6" fontSize="8">antecedente base.</text>
      <text x="70" y="125" textAnchor="middle" fill="#4ade80" fontSize="8" fontWeight="bold">Aporte Disruptivo</text>
    </g>

    {/* Veredicto 2: Extensión Complementaria */}
    <g transform="translate(190, 25)">
      <rect width="140" height="135" rx="8" fill="#241517" stroke="#D4783D" strokeWidth="2" />
      <rect x="10" y="10" width="120" height="26" rx="4" fill="url(#gradPeachCopper)" />
      <text x="70" y="27" textAnchor="middle" fill="#140a10" fontSize="10" fontWeight="bold">
        🔗 Complementaria
      </text>
      <text x="12" y="55" fill="#FD995C" fontSize="8" fontWeight="bold">CRITERIO:</text>
      <text x="12" y="70" fill="#fcebe6" fontSize="8">Profundiza en la idea</text>
      <text x="12" y="82" fill="#fcebe6" fontSize="8">mitigando una limitación</text>
      <text x="12" y="94" fill="#fcebe6" fontSize="8">declarada por el</text>
      <text x="12" y="106" fill="#fcebe6" fontSize="8">artículo previo.</text>
      <text x="70" y="125" textAnchor="middle" fill="#FD995C" fontSize="8" fontWeight="bold">Sinergia Teórica</text>
    </g>

    {/* Veredicto 3: Evidencia Redundante */}
    <g transform="translate(350, 25)">
      <rect width="140" height="135" rx="8" fill="#241018" stroke="#6C3745" strokeWidth="2" />
      <rect x="10" y="10" width="120" height="26" rx="4" fill="#3d1827" stroke="#6C3745" />
      <text x="70" y="27" textAnchor="middle" fill="#ff707a" fontSize="10" fontWeight="bold">
        ⚠️ Redundante
      </text>
      <text x="12" y="55" fill="#ff707a" fontSize="8" fontWeight="bold">CRITERIO:</text>
      <text x="12" y="70" fill="#fcebe6" fontSize="8">Metodología idéntica,</text>
      <text x="12" y="82" fill="#fcebe6" fontSize="8">mismos hallazgos y</text>
      <text x="12" y="94" fill="#fcebe6" fontSize="8">sin novedad real</text>
      <text x="12" y="106" fill="#fcebe6" fontSize="8">para el estado del arte.</text>
      <text x="70" y="125" textAnchor="middle" fill="#ff707a" fontSize="8" fontWeight="bold">Reiteración</text>
    </g>

    <text x="260" y="195" textAnchor="middle" fill="#D29884" fontSize="10">
      Cada veredicto registra un análisis epistemológico exhaustivo en la sesión
    </text>
  </SvgContainer>
);

// Combat Step 5: Historial de veredictos y Duelo Aleatorio
export const CombatStep5Diagram: React.FC = () => (
  <SvgContainer title="Historial de veredictos y botón de duelo aleatorio">
    {/* Botón Duelo Aleatorio */}
    <g transform="translate(40, 25)">
      <rect width="160" height="35" rx="6" fill="#23121c" stroke="#D4783D" strokeWidth="1.5" />
      <text x="80" y="42" textAnchor="middle" fill="#FD995C" fontSize="11" fontWeight="bold">
        Duelo Aleatorio 🎲
      </text>
      <text x="80" y="53" textAnchor="middle" fill="#D29884" fontSize="8">
        Explora cruces inesperados
      </text>
    </g>

    {/* Historial de veredictos en combate */}
    <g transform="translate(230, 20)">
      <rect width="250" height="160" rx="8" fill="#1b0c16" stroke="#6C3745" strokeWidth="1.5" />
      <rect x="10" y="10" width="230" height="18" rx="3" fill="#3a1626" />
      <text x="125" y="23" textAnchor="middle" fill="#FD995C" fontSize="9" fontWeight="bold">
        HISTORIAL DE VEREDICTOS EMITIDOS
      </text>

      {/* Registro 1 */}
      <rect x="10" y="35" width="230" height="35" rx="4" fill="#24111d" />
      <text x="15" y="48" fill="#4ade80" fontSize="8" fontWeight="bold">🏆 Hito Novedoso · MTC23 vs MTC22</text>
      <text x="15" y="60" fill="#D29884" fontSize="7">Chen introduce control vectorial con validación...</text>

      {/* Registro 2 */}
      <rect x="10" y="75" width="230" height="35" rx="4" fill="#24111d" />
      <text x="15" y="88" fill="#FD995C" fontSize="8" fontWeight="bold">🔗 Extensión · MTC14 vs MTC06</text>
      <text x="15" y="100" fill="#D29884" fontSize="7">Mitiga la limitación de peso integrando aluminio...</text>

      {/* Registro 3 */}
      <rect x="10" y="115" width="230" height="35" rx="4" fill="#24111d" />
      <text x="15" y="128" fill="#ff707a" fontSize="8" fontWeight="bold">⚠️ Redundante · MTC36 vs MTC09</text>
      <text x="15" y="140" fill="#D29884" fontSize="7">Solapamiento del 90%: análisis numérico análogo...</text>
    </g>

    {/* Cuadro informativo */}
    <g transform="translate(40, 75)">
      <rect width="160" height="105" rx="6" fill="#1d0e18" stroke="#3d1d2b" />
      <text x="12" y="20" fill="#FD995C" fontSize="9" fontWeight="bold">Aporte al Estado del Arte:</text>
      <text x="12" y="36" fill="#fcebe6" fontSize="8">Los combates depuran tu</text>
      <text x="12" y="48" fill="#fcebe6" fontSize="8">bibliografía, descartando</text>
      <text x="12" y="60" fill="#fcebe6" fontSize="8">citas redundantes y</text>
      <text x="12" y="72" fill="#fcebe6" fontSize="8">destacando las verdaderas</text>
      <text x="12" y="84" fill="#fcebe6" fontSize="8">contribuciones pioneras.</text>
    </g>

    <text x="260" y="205" textAnchor="middle" fill="#D29884" fontSize="10">
      Todos los veredictos se guardan en la sesión y se reflejan en el borrador exportable
    </text>
  </SvgContainer>
);
