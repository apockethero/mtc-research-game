import React, { useState } from 'react';
import { useSession } from '../../context/SessionContext';
import { useEvaluationSession } from '../../hooks/useEvaluationSession';
import {
  K1_QUESTIONS,
  K2_QUESTIONS,
  K4_EVALUATION_RUBRIC,
  K4_GUIDED_SENTENCE_STARTERS,
  exportEvaluationJSON,
  exportEvaluationCSV,
  calculateObjectiveScores
} from '../../services/evaluationScoring';
import {
  AcademicRole,
  EducationLevel,
  DisciplinaryArea,
  DeviceType,
  EvaluationStage,
  EvaluationMode
} from '../../types/evaluation';
import { EvaluationVisualCard } from './EvaluationVisualCard';
import { soundEngine } from '../../services/soundEngine';

export const EvaluationView: React.FC = () => {
  const { deck, setActiveTab } = useSession();
  const {
    session,
    setEvaluationMode,
    updateConsent,
    updateProfile,
    updateK1,
    updateK2,
    updateK3,
    updateK4,
    updateK5K6,
    updateComments,
    recordHintUsed,
    setStage,
    completeEvaluation,
    retryCloudSubmission,
    resetEvaluation
  } = useEvaluationSession();

  const [confirmDeleteModal, setConfirmDeleteModal] = useState<boolean>(false);
  const [validationAlert, setValidationAlert] = useState<string | null>(null);

  const isGuided = session.evaluationMode === 'guiado';

  const stagesList: { id: EvaluationStage; label: string; short: string }[] = [
    { id: 'stage_0_consent', label: '0. Inicio y Modo', short: '0' },
    { id: 'stage_a_profile', label: 'A. Perfil', short: 'A' },
    { id: 'stage_b_k1', label: 'B. K1: Comprender ideas', short: 'K1' },
    { id: 'stage_c_k2', label: 'C. K2: Comprobar datos', short: 'K2' },
    { id: 'stage_d_k3', label: 'D. K3: Comparar estudios', short: 'K3' },
    { id: 'stage_e_k4', label: 'E. K4: Conectar ideas', short: 'K4' },
    { id: 'stage_f_k5_k6', label: 'F. K5/K6: Uso y Esfuerzo', short: 'K5/6' },
    { id: 'stage_g_comments', label: 'G. Sugerencias', short: 'G' },
    { id: 'stage_review', label: 'Revisión', short: 'Rev' }
  ];

  const currentIdx = stagesList.findIndex(s => s.id === session.currentStage);
  const progressPercent = Math.min(Math.round(((currentIdx + 1) / stagesList.length) * 100), 100);

  const handleNextStage = (next: EvaluationStage) => {
    setValidationAlert(null);
    soundEngine.playFlip();
    setStage(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevStage = (prev: EvaluationStage) => {
    setValidationAlert(null);
    soundEngine.playDrop();
    setStage(prev);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Renderizador de escalas Likert de 5 puntos
  const renderLikertRow = (
    label: string,
    value: number | undefined,
    onChange: (val: number) => void,
    leftLabel = isGuided ? 'Nada de acuerdo (1)' : 'Totalmente en desacuerdo (1)',
    rightLabel = isGuided ? 'Muy de acuerdo (5)' : 'Totalmente de acuerdo (5)'
  ) => (
    <div className="eval-likert-row">
      <div className="eval-likert-label">{label}</div>
      <div className="eval-likert-controls-bar">
        <span className="eval-likert-anchor">{leftLabel}</span>
        <div className="eval-likert-btn-group">
          {[1, 2, 3, 4, 5].map(num => (
            <button
              key={num}
              type="button"
              className={`cyber-btn ${value === num ? 'cyber-btn-primary' : 'cyber-btn-outline'}`}
              style={{ minWidth: '38px', height: '38px', padding: 0, fontSize: '13px', fontWeight: 700 }}
              onClick={() => onChange(num)}
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            className={`cyber-btn ${value === 0 ? 'cyber-btn-secondary' : 'cyber-btn-outline'}`}
            style={{ fontSize: '11px', padding: '0 10px', height: '38px' }}
            onClick={() => onChange(0)}
            title="No puedo valorar este aspecto o no sé"
          >
            No sé
          </button>
        </div>
        <span className="eval-likert-anchor right">{rightLabel}</span>
      </div>
    </div>
  );

  return (
    <div className="view-panel active eval-view-panel">
      <div className="game-wrapper" style={{ maxWidth: '1040px', margin: '0 auto' }}>
        {/* CABECERA DEL INSTRUMENTO SEPARADA VISUALMENTE */}
        <div className="eval-header-card">
          <div className="eval-header-meta-bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span className="eval-version-badge">
                INSTRUMENTO DE VALIDACIÓN CIENTÍFICA · VERSIÓN 1.1.0
              </span>
              <span
                style={{
                  background: isGuided ? 'var(--c-copper)' : 'var(--c-plum)',
                  color: '#fff',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontSize: '10px',
                  fontWeight: 800
                }}
              >
                {isGuided ? '🌟 MODO GUIADO' : '🔬 MODO INVESTIGACIÓN'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="hud-stats-pill eval-session-pill">
                <span>ID Sesión:</span> <b>{session.sessionId}</b>
              </div>
              {session.currentStage !== 'stage_complete' && (
                <button
                  className="cyber-btn cyber-btn-outline"
                  style={{ fontSize: '11px', padding: '4px 10px' }}
                  onClick={() => setConfirmDeleteModal(true)}
                  title="Reiniciar o borrar datos locales de esta evaluación"
                >
                  Reiniciar
                </button>
              )}
            </div>
          </div>

          <div className="eval-header-title-box">
            <h2>Evaluación Científica del Sistema MTC</h2>
            <p>
              {isGuided
                ? 'Actividad visual y sencilla para aprender a interpretar investigaciones sobre triciclos eléctricos ligeros.'
                : 'Instrumento piloto para recolectar datos empíricos sobre la comprensión, trazabilidad y utilidad del sistema de tarjetas de revisión.'}
            </p>
          </div>
        </div>

        {/* BARRA DE PROGRESO DE ETAPAS EN PANEL ELEVADO */}
        {session.currentStage !== 'stage_complete' && (
          <div className="eval-progress-card">
            <div className="eval-progress-meta">
              <span>Etapa actual: <b style={{ color: '#fff' }}>{stagesList[currentIdx]?.label}</b></span>
              <span>
                Progreso: <b style={{ color: 'var(--c-peach)' }}>{progressPercent}%</b> · Tiempo estimado: <b>{isGuided ? '~8-10 min' : '~12-15 min'}</b>
              </span>
            </div>
            <div className="eval-progress-bar-track">
              <div
                className="eval-progress-bar-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* ALERTA DE VALIDACIÓN */}
        {validationAlert && (
          <div style={{ background: 'rgba(184, 44, 57, 0.25)', border: '1px solid var(--c-crimson)', color: '#ff999f', padding: '10px 14px', borderRadius: '6px', marginBottom: '16px', fontSize: '13px' }}>
            ⚠️ {validationAlert}
          </div>
        )}

        {/* =========================================================================
            ETAPA 0: INFORMACIÓN, MODALIDAD Y CONSENTIMIENTO
            ========================================================================= */}
        {session.currentStage === 'stage_0_consent' && (
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ color: 'var(--c-peach)', marginTop: 0 }}>0. Inicio: Elige tu Modalidad y Consentimiento</h3>
            <p style={{ fontSize: '13.5px', lineHeight: 1.6, color: '#fcebe6' }}>
              Bienvenido/a a la evaluación de <b>MTC Research Game</b>. Para ofrecerte la mejor experiencia según tu formación, elige la modalidad que prefieras:
            </p>

            {/* Selector de Modalidades */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginBottom: '20px' }}>
              {/* Opción 1: Modo Guiado */}
              <div
                onClick={() => setEvaluationMode('guiado')}
                style={{
                  cursor: 'pointer',
                  padding: '16px',
                  borderRadius: '10px',
                  border: isGuided ? '2px solid var(--c-peach)' : '1px solid #3d1b2b',
                  background: isGuided ? 'rgba(253, 153, 92, 0.12)' : '#190d16',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <b style={{ color: 'var(--c-peach)', fontSize: '15px' }}>🌟 Modo Guiado</b>
                  {isGuided && <span style={{ color: '#4ade80', fontSize: '12px', fontWeight: 800 }}>✓ Seleccionado</span>}
                </div>
                <p style={{ margin: '0 0 8px 0', fontSize: '12.5px', color: '#fcebe6', lineHeight: 1.5 }}>
                  Lenguaje cotidiano y directo, ayudas visuales paso a paso, pistas explicativas de términos difíciles y frases guía para sintetizar.
                </p>
                <div style={{ fontSize: '11px', color: 'var(--c-rose)' }}>
                  Recomendado para: <b>Estudiantes de colegio, jóvenes y personas sin formación académica previa</b>. Tiempo: <b>~8-10 min</b>.
                </div>
              </div>

              {/* Opción 2: Modo Investigación */}
              <div
                onClick={() => setEvaluationMode('investigacion')}
                style={{
                  cursor: 'pointer',
                  padding: '16px',
                  borderRadius: '10px',
                  border: !isGuided ? '2px solid var(--c-peach)' : '1px solid #3d1b2b',
                  background: !isGuided ? 'rgba(253, 153, 92, 0.12)' : '#190d16',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <b style={{ color: 'var(--c-peach)', fontSize: '15px' }}>🔬 Modo de Investigación</b>
                  {!isGuided && <span style={{ color: '#4ade80', fontSize: '12px', fontWeight: 800 }}>✓ Seleccionado</span>}
                </div>
                <p style={{ margin: '0 0 8px 0', fontSize: '12.5px', color: '#fcebe6', lineHeight: 1.5 }}>
                  Preguntas metodológicas completas, comprobación de metadatos bibliométricos (DOI, cuartiles Scopus) y redacción académica formal.
                </p>
                <div style={{ fontSize: '11px', color: 'var(--c-rose)' }}>
                  Recomendado para: <b>Estudiantes universitarios, tesistas, docentes e investigadores</b>. Tiempo: <b>~12-15 min</b>.
                </div>
              </div>
            </div>

            {/* Condiciones del Consentimiento */}
            <div className="eval-info-box" style={{ padding: '16px', borderRadius: '8px', marginBottom: '18px', fontSize: '12.5px' }}>
              <h4 style={{ color: 'var(--c-copper)', margin: '0 0 8px 0', fontSize: '13px', fontWeight: 800 }}>Términos y Salvaguardas Éticas:</h4>
              <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li><b>Finalidad:</b> Estudio exploratorio para evaluar si las tarjetas ayudan a entender el estado del arte.</li>
                <li><b>Participación Libre:</b> Es voluntaria y puedes retirarte en cualquier momento sin penalización.</li>
                <li><b>Privacidad:</b> No solicitamos tu nombre, teléfono, DNI ni email. Las respuestas se asocian al código aleatorio <code>{session.sessionId}</code>.</li>
                <li><b>Almacenamiento Local:</b> Las respuestas se guardan en tu propio navegador. No se envían a servidores externos automáticamente.</li>
                <li><b>Salvaguarda para Menores de Edad:</b> Si este instrumento se utiliza en un estudio formal con niños o adolescentes, se deben gestionar previamente las autorizaciones del colegio y el consentimiento de padres o tutores legales.</li>
              </ul>
            </div>

            <label className="eval-consent-checkbox-label">
              <input
                type="checkbox"
                checked={session.consentGiven}
                onChange={(e) => updateConsent(e.target.checked)}
                style={{ marginTop: '3px', transform: 'scale(1.2)' }}
              />
              <span className="eval-consent-text">
                <b>He leído la información y acepto participar</b> en esta evaluación en <b>{isGuided ? 'Modo Guiado' : 'Modo de Investigación'}</b>.
              </span>
            </label>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className="cyber-btn cyber-btn-primary"
                disabled={!session.consentGiven}
                onClick={() => handleNextStage('stage_a_profile')}
              >
                Comenzar Evaluación en {isGuided ? 'Modo Guiado 🌟' : 'Modo Investigación 🔬'} →
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            ETAPA A: PERFIL DEL PARTICIPANTE
            ========================================================================= */}
        {session.currentStage === 'stage_a_profile' && (
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 className="eval-stage-title">Etapa A. Cuéntanos sobre ti (Perfil)</h3>
            <p className="eval-stage-desc">
              {isGuided
                ? 'Indica tu nivel de estudios o rol general para entender cómo se adaptan las tarjetas a diferentes personas. No pedimos datos personales.'
                : 'Por favor, indica tu contexto formativo y nivel de experiencia técnica para contextualizar la evaluación.'}
            </p>

            <div className="form-grid" style={{ marginBottom: '16px' }}>
              <div className="form-group">
                <label>Tu Rol o Actividad Principal:</label>
                <select
                  className="cyber-select full-width"
                  value={session.profile.academicRole || ''}
                  onChange={(e) => updateProfile({ academicRole: e.target.value as AcademicRole })}
                >
                  <option value="">-- Seleccionar --</option>
                  <option value="estudiante_colegio">Estudiante de Colegio / Secundaria</option>
                  <option value="estudiante_pregrado">Estudiante Universitario (Pregrado)</option>
                  <option value="estudiante_posgrado">Estudiante de Posgrado (Maestría / Doctorado)</option>
                  <option value="docente_investigador">Docente / Investigador Académico</option>
                  <option value="profesional_industria">Profesional / Técnico de la Industria</option>
                  <option value="publico_general">Público General / Aficionado a la Tecnología</option>
                  <option value="otro">Otro</option>
                  <option value="prefiero_no_responder">Prefiero no responder</option>
                </select>
                {session.profile.academicRole === 'otro' && (
                  <input
                    type="text"
                    className="cyber-input"
                    style={{ marginTop: '8px' }}
                    placeholder="Especifica tu actividad"
                    value={session.profile.academicRoleOther || ''}
                    onChange={(e) => updateProfile({ academicRoleOther: e.target.value })}
                  />
                )}
              </div>

              <div className="form-group">
                <label>Nivel de Formación:</label>
                <select
                  className="cyber-select full-width"
                  value={session.profile.educationLevel || ''}
                  onChange={(e) => updateProfile({ educationLevel: e.target.value as EducationLevel })}
                >
                  <option value="">-- Seleccionar --</option>
                  <option value="primaria_secundaria">Secundaria o Básica en curso o terminada</option>
                  <option value="tecnico_tecnologo">Técnico / Tecnólogo</option>
                  <option value="pregrado">Pregrado Universitario</option>
                  <option value="maestria">Maestría / Especialización</option>
                  <option value="doctorado">Doctorado / Posdoctorado</option>
                  <option value="otro">Otro</option>
                  <option value="prefiero_no_responder">Prefiero no responder</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '18px' }}>
              <label>Área o Interés Principal:</label>
              <select
                className="cyber-select full-width"
                value={session.profile.disciplinaryArea || ''}
                onChange={(e) => updateProfile({ disciplinaryArea: e.target.value as DisciplinaryArea })}
              >
                <option value="">-- Seleccionar --</option>
                <option value="mecanica_automotriz">Ingeniería Mecánica / Automotriz / Transporte</option>
                <option value="electrica_electronica">Electricidad / Electrónica / Energías Limpias</option>
                <option value="sistemas_computacion_ia">Sistemas / Computación / Tecnología Digital</option>
                <option value="transporte_logistica">Movilidad Urbana / Tránsito / Logística</option>
                <option value="ciencias_ambientales_sostenibilidad">Medio Ambiente / Ecología / Sostenibilidad</option>
                <option value="educacion_ciencias_sociales">Educación / Ciencias Sociales</option>
                <option value="sin_formacion_especifica">Sin área específica / Interés general</option>
                <option value="otra">Otra</option>
                <option value="prefiero_no_responder">Prefiero no responder</option>
              </select>
            </div>

            {renderLikertRow(
              isGuided
                ? '¿Qué tanta experiencia previa tienes leyendo artículos de investigación o estados del arte?'
                : 'Familiaridad previa con la redacción o lectura de estados del arte (literature reviews):',
              session.profile.priorFamiliarityStateOfArt,
              (val) => updateProfile({ priorFamiliarityStateOfArt: val }),
              'Ninguna experiencia (1)',
              'Mucha experiencia (5)'
            )}

            {renderLikertRow(
              isGuided
                ? '¿Qué tanto conocías antes sobre vehículos o triciclos eléctricos?'
                : 'Familiaridad previa con vehículos utilitarios eléctricos o triciclos motorizados:',
              session.profile.priorFamiliarityElectricTricycles,
              (val) => updateProfile({ priorFamiliarityElectricTricycles: val }),
              'Casi nada (1)',
              'Conozco bastante (5)'
            )}

            <div className="form-group" style={{ marginTop: '14px' }}>
              <label>Tipo de Dispositivo Utilizado:</label>
              <select
                className="cyber-select"
                value={session.profile.deviceType || 'escritorio_laptop'}
                onChange={(e) => updateProfile({ deviceType: e.target.value as DeviceType })}
              >
                <option value="escritorio_laptop">Computador de Escritorio / Portátil</option>
                <option value="tablet">Tablet</option>
                <option value="movil">Teléfono Móvil</option>
              </select>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between' }}>
              <button className="cyber-btn cyber-btn-outline" onClick={() => handlePrevStage('stage_0_consent')}>
                ← Anterior
              </button>
              <button
                className="cyber-btn cyber-btn-primary"
                onClick={() => {
                  if (!session.profile.academicRole || !session.profile.educationLevel || !session.profile.disciplinaryArea) {
                    setValidationAlert('Por favor selecciona tu rol, nivel y área principal antes de continuar.');
                    return;
                  }
                  handleNextStage('stage_b_k1');
                }}
              >
                Siguiente (K1: Comprender las ideas) →
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            ETAPA B: K1 COMPRENDER LAS IDEAS
            ========================================================================= */}
        {session.currentStage === 'stage_b_k1' && (
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <h3 className="eval-stage-title" style={{ margin: 0 }}>
                Etapa B. K1: Comprender las ideas
              </h3>
              <span className="eval-stage-tag">
                Criterio Metodológico K1
              </span>
            </div>
            <p className="eval-stage-lead">
              {isGuided
                ? 'Objetivo: Vamos a ver si puedes entender qué propone cada estudio observando sus esquemas técnicos, qué pruebas hicieron y qué límites tienen.'
                : 'Objetivo: Evaluar la comprensión conceptual, la distinción de evidencia y el reconocimiento de aportes y limitaciones metodológicas.'}
            </p>

            {/* B1: Aporte principal con soporte visual MTC09 */}
            <div className="eval-question-card">
              <div className="eval-question-prompt">
                1. {isGuided ? K1_QUESTIONS.q1CoreContribution.promptGuided : K1_QUESTIONS.q1CoreContribution.promptResearch}
              </div>

              {/* Tarjeta visual técnica enmascarada */}
              <EvaluationVisualCard
                cardId="MTC09"
                customTitle="Esquema Técnico de Estudio MTC09"
                altText={K1_QUESTIONS.q1CoreContribution.visualAlt}
                hintId={K1_QUESTIONS.q1CoreContribution.hintId}
                hintText={K1_QUESTIONS.q1CoreContribution.hintText}
                onHintUsed={(hId) => recordHintUsed(hId, 'k1_q1')}
                wasHintUsed={Boolean(session.wasAssistedByQuestion?.['k1_q1'])}
                maskAnswers={true}
              />

              <div className="eval-options-list">
                {(isGuided ? K1_QUESTIONS.q1CoreContribution.optionsGuided : K1_QUESTIONS.q1CoreContribution.optionsResearch).map((opt) => (
                  <label key={opt.id} className="eval-option-row">
                    <input
                      type="radio"
                      name="q1Core"
                      checked={session.k1Responses.q1CoreContribution === opt.id}
                      onChange={() => updateK1({ q1CoreContribution: opt.id })}
                    />
                    <span>{opt.text}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* B2: Tipos de Evidencia */}
            <div className="eval-question-card">
              <div className="eval-question-prompt">
                2. {isGuided ? K1_QUESTIONS.q2EvidenceTypes.promptGuided : K1_QUESTIONS.q2EvidenceTypes.promptResearch}
              </div>
              <p style={{ fontSize: '13px', color: 'var(--c-rose)', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                {isGuided
                  ? 'Cada investigación usó un método distinto: computadora (simulación), taller (prototipo) o mediciones en ruta (experimento).'
                  : 'Distingue simulación numérica, prototipado físico y pruebas experimentales en banco/ruta.'}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                {K1_QUESTIONS.q2EvidenceTypes.items.map((item) => (
                  <div key={item.cardId} className="eval-card-item-box">
                    <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--c-copper)', marginBottom: '8px' }}>
                      {item.authorYear}
                    </div>

                    <EvaluationVisualCard
                      cardId={item.cardId}
                      customTitle={`Ilustración ${item.cardId}`}
                      altText={item.visualAlt}
                      maskAnswers={true}
                      hintId={K1_QUESTIONS.q2EvidenceTypes.hintId}
                      hintText={K1_QUESTIONS.q2EvidenceTypes.hintText}
                      onHintUsed={(hId) => recordHintUsed(hId, 'k1_q2')}
                      wasHintUsed={Boolean(session.wasAssistedByQuestion?.['k1_q2'])}
                    />

                    <select
                      className="cyber-select full-width"
                      value={
                        item.cardId === 'MTC01'
                          ? session.k1Responses.q2EvidenceTypes?.mtc01Type || ''
                          : item.cardId === 'MTC18'
                          ? session.k1Responses.q2EvidenceTypes?.mtc18Type || ''
                          : session.k1Responses.q2EvidenceTypes?.mtc22Type || ''
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        const prev = session.k1Responses.q2EvidenceTypes || { mtc01Type: '', mtc18Type: '', mtc22Type: '' };
                        if (item.cardId === 'MTC01') updateK1({ q2EvidenceTypes: { ...prev, mtc01Type: val } });
                        if (item.cardId === 'MTC18') updateK1({ q2EvidenceTypes: { ...prev, mtc18Type: val } });
                        if (item.cardId === 'MTC22') updateK1({ q2EvidenceTypes: { ...prev, mtc22Type: val } });
                      }}
                    >
                      <option value="">-- Seleccionar Cómo se Hizo --</option>
                      {(isGuided ? item.optionsGuided : item.optionsResearch).map(o => (
                        <option key={o.id} value={o.id}>{o.text}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* B3: Limitación metodológica con soporte visual MTC06 */}
            <div className="eval-question-card">
              <div className="eval-question-prompt">
                3. {isGuided ? K1_QUESTIONS.q3MethodologicalLimitation.promptGuided : K1_QUESTIONS.q3MethodologicalLimitation.promptResearch}
              </div>

              <EvaluationVisualCard
                cardId="MTC06"
                customTitle="Esquema Técnico de Estudio MTC06"
                altText={K1_QUESTIONS.q3MethodologicalLimitation.visualAlt}
                hintId={K1_QUESTIONS.q3MethodologicalLimitation.hintId}
                hintText={K1_QUESTIONS.q3MethodologicalLimitation.hintText}
                onHintUsed={(hId) => recordHintUsed(hId, 'k1_q3')}
                wasHintUsed={Boolean(session.wasAssistedByQuestion?.['k1_q3'])}
                maskAnswers={true}
              />

              <div className="eval-options-list">
                {(isGuided ? K1_QUESTIONS.q3MethodologicalLimitation.optionsGuided : K1_QUESTIONS.q3MethodologicalLimitation.optionsResearch).map((opt) => (
                  <label key={opt.id} className="eval-option-row">
                    <input
                      type="radio"
                      name="q3Limit"
                      checked={session.k1Responses.q3MethodologicalLimitation === opt.id}
                      onChange={() => updateK1({ q3MethodologicalLimitation: opt.id })}
                    />
                    <span>{opt.text}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* B4: Resultado vs Hipótesis */}
            <div className="eval-question-card">
              <div className="eval-question-prompt">
                4. {isGuided ? K1_QUESTIONS.q4TechnicalResultVsHypothesis.promptGuided : K1_QUESTIONS.q4TechnicalResultVsHypothesis.promptResearch}
              </div>

              {K1_QUESTIONS.q4TechnicalResultVsHypothesis.hintText && (
                <div style={{ marginBottom: '12px' }}>
                  <button
                    type="button"
                    className="cyber-btn cyber-btn-outline"
                    style={{ fontSize: '11px', padding: '4px 10px', color: 'var(--c-peach)' }}
                    onClick={() => recordHintUsed(K1_QUESTIONS.q4TechnicalResultVsHypothesis.hintId, 'k1_q4')}
                  >
                    💡 Pista: ¿Cómo distinguir un dato medido de una suposición?
                  </button>
                  {session.wasAssistedByQuestion?.['k1_q4'] && (
                    <div className="eval-hint-box">
                      {K1_QUESTIONS.q4TechnicalResultVsHypothesis.hintText}
                    </div>
                  )}
                </div>
              )}

              <div className="eval-options-list">
                {(isGuided ? K1_QUESTIONS.q4TechnicalResultVsHypothesis.optionsGuided : K1_QUESTIONS.q4TechnicalResultVsHypothesis.optionsResearch).map((opt) => (
                  <label key={opt.id} className="eval-option-row">
                    <input
                      type="radio"
                      name="q4Result"
                      checked={session.k1Responses.q4TechnicalResultVsHypothesis === opt.id}
                      onChange={() => updateK1({ q4TechnicalResultVsHypothesis: opt.id })}
                    />
                    <span>{opt.text}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="eval-stage-nav-bar">
              <button className="cyber-btn cyber-btn-outline" onClick={() => handlePrevStage('stage_a_profile')}>
                ← Anterior
              </button>
              <button
                className="cyber-btn cyber-btn-primary"
                onClick={() => {
                  if (
                    !session.k1Responses.q1CoreContribution ||
                    !session.k1Responses.q3MethodologicalLimitation ||
                    !session.k1Responses.q4TechnicalResultVsHypothesis
                  ) {
                    setValidationAlert('Por favor responde las preguntas de comprensión (o marca "No estoy seguro/a") antes de continuar.');
                    return;
                  }
                  handleNextStage('stage_c_k2');
                }}
              >
                Siguiente (K2: Comprobar la información) →
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            ETAPA C: K2 COMPROBAR LA INFORMACIÓN (TRAZABILIDAD)
            ========================================================================= */}
        {session.currentStage === 'stage_c_k2' && (
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <h3 className="eval-stage-title" style={{ margin: 0 }}>
                Etapa C. K2: Comprobar la información
              </h3>
              <span className="eval-stage-tag">
                Criterio Metodológico K2
              </span>
            </div>
            <p className="eval-stage-lead">
              {isGuided
                ? 'Objetivo: Vamos a comprobar si puedes ubicar de dónde sale un estudio científico y qué hacer cuando un dato de calidad todavía no está confirmado.'
                : 'Objetivo: Evaluar la localización e interpretación de metadatos de fuentes primarias, persistencia DOI y tratamiento de indicadores pendientes o ausentes.'}
            </p>

            {/* C1: Localizar metadatos MTC43 */}
            <div className="eval-question-card">
              <div className="eval-question-prompt">
                1. {isGuided ? K2_QUESTIONS.q1LocateMetadata.promptGuided : K2_QUESTIONS.q1LocateMetadata.promptResearch}
              </div>

              {/* Ficha técnica visible para comprobar */}
              <EvaluationVisualCard
                cardId="MTC43"
                customTitle="Ficha de Trazabilidad MTC43"
                altText={K2_QUESTIONS.q1LocateMetadata.visualAlt}
                showMetadata={true}
                maskAnswers={false}
                hintId={K2_QUESTIONS.q1LocateMetadata.hintId}
                hintText={K2_QUESTIONS.q1LocateMetadata.hintText}
                onHintUsed={(hId) => recordHintUsed(hId, 'k2_q1')}
                wasHintUsed={Boolean(session.wasAssistedByQuestion?.['k2_q1'])}
              />

              <div className="form-grid" style={{ marginTop: '14px', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--c-peach)', display: 'block', marginBottom: '6px' }}>
                    {isGuided ? 'Identificador digital (DOI):' : 'DOI de la fuente primaria:'}
                  </label>
                  <input
                    type="text"
                    className="cyber-input"
                    placeholder="ej. 10.1016/j.est.2023.107892"
                    value={session.k2Responses.q1LocateMetadata?.doi || ''}
                    onChange={(e) => {
                      const prev = session.k2Responses.q1LocateMetadata || { doi: '', year: '', docType: '' };
                      updateK2({ q1LocateMetadata: { ...prev, doi: e.target.value } });
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--c-peach)', display: 'block', marginBottom: '6px' }}>
                    Año de Publicación:
                  </label>
                  <input
                    type="text"
                    className="cyber-input"
                    placeholder="ej. 2023"
                    value={session.k2Responses.q1LocateMetadata?.year || ''}
                    onChange={(e) => {
                      const prev = session.k2Responses.q1LocateMetadata || { doi: '', year: '', docType: '' };
                      updateK2({ q1LocateMetadata: { ...prev, year: e.target.value } });
                    }}
                  />
                </div>
              </div>
              <div style={{ marginTop: '14px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--c-peach)', display: 'block', marginBottom: '6px' }}>
                  Tipo de Documento:
                </label>
                <select
                  className="cyber-select full-width"
                  value={session.k2Responses.q1LocateMetadata?.docType || ''}
                  onChange={(e) => {
                    const prev = session.k2Responses.q1LocateMetadata || { doi: '', year: '', docType: '' };
                    updateK2({ q1LocateMetadata: { ...prev, docType: e.target.value } });
                  }}
                >
                  <option value="">-- Seleccionar --</option>
                  <option value="articulo_revista">Artículo en Revista Especializada (Journal)</option>
                  <option value="conferencia">Artículo de Congreso o Conferencia</option>
                  <option value="capitulo_libro">Capítulo de Libro</option>
                  <option value="no_estoy_seguro">No estoy seguro/a</option>
                </select>
              </div>
            </div>

            {/* C2: Indicadores ausentes o pendientes */}
            <div className="eval-question-card">
              <div className="eval-question-prompt">
                2. {isGuided ? K2_QUESTIONS.q2MissingOrPendingIndicatorInterpretation.promptGuided : K2_QUESTIONS.q2MissingOrPendingIndicatorInterpretation.promptResearch}
              </div>

              {K2_QUESTIONS.q2MissingOrPendingIndicatorInterpretation.hintText && (
                <div style={{ marginBottom: '12px' }}>
                  <button
                    type="button"
                    className="cyber-btn cyber-btn-outline"
                    style={{ fontSize: '11px', padding: '4px 10px', color: 'var(--c-peach)' }}
                    onClick={() => recordHintUsed(K2_QUESTIONS.q2MissingOrPendingIndicatorInterpretation.hintId, 'k2_q2')}
                  >
                    💡 Pista: ¿Qué pasa cuando falta un dato de calidad?
                  </button>
                  {session.wasAssistedByQuestion?.['k2_q2'] && (
                    <div className="eval-hint-box">
                      {K2_QUESTIONS.q2MissingOrPendingIndicatorInterpretation.hintText}
                    </div>
                  )}
                </div>
              )}

              <div className="eval-options-list">
                {(isGuided ? K2_QUESTIONS.q2MissingOrPendingIndicatorInterpretation.optionsGuided : K2_QUESTIONS.q2MissingOrPendingIndicatorInterpretation.optionsResearch).map((opt) => (
                  <label key={opt.id} className="eval-option-row">
                    <input
                      type="radio"
                      name="q2Pending"
                      checked={session.k2Responses.q2MissingOrPendingIndicatorInterpretation === opt.id}
                      onChange={() => updateK2({ q2MissingOrPendingIndicatorInterpretation: opt.id })}
                    />
                    <span>{opt.text}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* C3: Trazabilidad vs Citas secundarias */}
            <div className="eval-question-card">
              <div className="eval-question-prompt">
                3. {isGuided ? K2_QUESTIONS.q3TraceabilityVsSecondaryCitation.promptGuided : K2_QUESTIONS.q3TraceabilityVsSecondaryCitation.promptResearch}
              </div>

              {K2_QUESTIONS.q3TraceabilityVsSecondaryCitation.hintText && (
                <div style={{ marginBottom: '12px' }}>
                  <button
                    type="button"
                    className="cyber-btn cyber-btn-outline"
                    style={{ fontSize: '11px', padding: '4px 10px', color: 'var(--c-peach)' }}
                    onClick={() => recordHintUsed(K2_QUESTIONS.q3TraceabilityVsSecondaryCitation.hintId, 'k2_q3')}
                  >
                    💡 Pista: ¿Por qué ir directo a la fuente original?
                  </button>
                  {session.wasAssistedByQuestion?.['k2_q3'] && (
                    <div className="eval-hint-box">
                      {K2_QUESTIONS.q3TraceabilityVsSecondaryCitation.hintText}
                    </div>
                  )}
                </div>
              )}

              <div className="eval-options-list">
                {(isGuided ? K2_QUESTIONS.q3TraceabilityVsSecondaryCitation.optionsGuided : K2_QUESTIONS.q3TraceabilityVsSecondaryCitation.optionsResearch).map((opt) => (
                  <label key={opt.id} className="eval-option-row">
                    <input
                      type="radio"
                      name="q3Audit"
                      checked={session.k2Responses.q3TraceabilityVsSecondaryCitation === opt.id}
                      onChange={() => updateK2({ q3TraceabilityVsSecondaryCitation: opt.id })}
                    />
                    <span>{opt.text}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="eval-stage-nav-bar">
              <button className="cyber-btn cyber-btn-outline" onClick={() => handlePrevStage('stage_b_k1')}>
                ← Anterior
              </button>
              <button
                className="cyber-btn cyber-btn-primary"
                onClick={() => {
                  if (
                    !session.k2Responses.q2MissingOrPendingIndicatorInterpretation ||
                    !session.k2Responses.q3TraceabilityVsSecondaryCitation
                  ) {
                    setValidationAlert('Por favor responde las preguntas sobre comprobación de datos antes de continuar.');
                    return;
                  }
                  handleNextStage('stage_d_k3');
                }}
              >
                Siguiente (K3: Comparar dos estudios) →
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            ETAPA D: K3 COMPARAR DOS ESTUDIOS (SIDE-BY-SIDE)
            ========================================================================= */}
        {session.currentStage === 'stage_d_k3' && (
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <h3 className="eval-stage-title" style={{ margin: 0 }}>
                Etapa D. K3: Comparar dos estudios
              </h3>
              <span className="eval-stage-tag">
                Criterio Metodológico K3
              </span>
            </div>
            <p className="eval-stage-lead">
              {isGuided
                ? 'Objetivo: Vamos a poner dos investigaciones frente a frente. Elige dos tarjetas para compararlas lado a lado y describe qué hace cada una.'
                : 'Objetivo: Contrastar dos antecedentes del corpus, evaluar diferencias de método, contexto o limitaciones y registrar el nivel de confianza analítica.'}
            </p>

            {/* Comparador Lado a Lado (Side-by-Side) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '18px' }}>
              {/* Tarjeta 1 */}
              <div className="eval-info-box" style={{ padding: '14px', borderRadius: '8px' }}>
                <label style={{ fontSize: '12px', color: 'var(--c-copper)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                  Investigación A (Base):
                </label>
                <select
                  className="cyber-select full-width"
                  style={{ marginBottom: '10px' }}
                  value={session.k3Responses.selectedCardIds?.[0] || 'MTC06'}
                  onChange={(e) => {
                    const ids = [...(session.k3Responses.selectedCardIds || ['MTC06', 'MTC09'])];
                    ids[0] = e.target.value;
                    updateK3({ selectedCardIds: ids as [string, string] });
                  }}
                >
                  {deck.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.id} · {c.firstAuthor} ({c.year}) - {c.title.slice(0, 32)}...
                    </option>
                  ))}
                </select>

                <EvaluationVisualCard
                  cardId={session.k3Responses.selectedCardIds?.[0] || 'MTC06'}
                  altText={`Ilustración de la investigación ${session.k3Responses.selectedCardIds?.[0] || 'MTC06'}`}
                  maskAnswers={false}
                />
              </div>

              {/* Tarjeta 2 */}
              <div className="eval-info-box" style={{ padding: '14px', borderRadius: '8px' }}>
                <label style={{ fontSize: '12px', color: 'var(--c-copper)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                  Investigación B (Contraste):
                </label>
                <select
                  className="cyber-select full-width"
                  style={{ marginBottom: '10px' }}
                  value={session.k3Responses.selectedCardIds?.[1] || 'MTC09'}
                  onChange={(e) => {
                    const ids = [...(session.k3Responses.selectedCardIds || ['MTC06', 'MTC09'])];
                    ids[1] = e.target.value;
                    updateK3({ selectedCardIds: ids as [string, string] });
                  }}
                >
                  {deck.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.id} · {c.firstAuthor} ({c.year}) - {c.title.slice(0, 32)}...
                    </option>
                  ))}
                </select>

                <EvaluationVisualCard
                  cardId={session.k3Responses.selectedCardIds?.[1] || 'MTC09'}
                  altText={`Ilustración de la investigación ${session.k3Responses.selectedCardIds?.[1] || 'MTC09'}`}
                  maskAnswers={false}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label>{isGuided ? '¿Qué aspecto quieres comparar entre ambas?' : 'Criterio Principal de Comparación:'}</label>
              <select
                className="cyber-select full-width"
                value={session.k3Responses.comparisonCriterion || 'metodologia'}
                onChange={(e) => updateK3({ comparisonCriterion: e.target.value as any })}
              >
                <option value="metodologia">
                  {isGuided ? 'Cómo hicieron el trabajo (Simulación en computadora vs Construcción física)' : 'Metodología (ej. Simulación CAE vs Ensayos Físicos)'}
                </option>
                <option value="contribucion">
                  {isGuided ? 'Qué inventó o resolvió cada una (Aporte técnico)' : 'Contribución Técnica (Aporte de diseño o algoritmo)'}
                </option>
                <option value="alcance_aplicacion">
                  {isGuided ? 'Para qué se usa (Reparto de carga vs Transporte de personas)' : 'Alcance de Aplicación (Carga urbana vs Pasajeros)'}
                </option>
                <option value="limitaciones">
                  {isGuided ? 'Qué le faltó probar a cada una (Límites y vacíos)' : 'Limitaciones Reportadas (Vacíos metodológicos cruzados)'}
                </option>
                <option value="otro">Otro criterio</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label>{isGuided ? '¿En qué se diferencian principalmente?' : 'Diferencias Metodológicas o de Hallazgos:'}</label>
              <textarea
                className="cyber-input"
                rows={3}
                placeholder={
                  isGuided
                    ? 'Por ejemplo: la primera tarjeta probó un chasis de acero en computadora, mientras que la segunda diseñó un mecanismo de inclinación para que no se vuelque...'
                    : 'Explica qué diferencias metodológicas o empíricas esenciales existen entre ambos antecedentes...'
                }
                value={session.k3Responses.differencesText || ''}
                onChange={(e) => updateK3({ differencesText: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label>{isGuided ? '¿En qué se parecen o qué tienen en común?' : 'Similitudes o Puntos de Convergencia:'}</label>
              <textarea
                className="cyber-input"
                rows={2}
                placeholder={
                  isGuided
                    ? 'Por ejemplo: ambas buscan que el triciclo sea más seguro para circular en la ciudad...'
                    : 'Menciona qué elementos teóricos o empíricos comparten...'
                }
                value={session.k3Responses.similaritiesText || ''}
                onChange={(e) => updateK3({ similaritiesText: e.target.value })}
              />
            </div>

            {renderLikertRow(
              isGuided ? '¿Qué tan seguro/a te sientes de tu comparación?' : 'Nivel de confianza analítica en tu comparación:',
              session.k3Responses.confidenceLevel,
              (val) => updateK3({ confidenceLevel: val }),
              'Poco seguro/a (1)',
              'Muy seguro/a (5)'
            )}

            <div className="eval-stage-nav-bar">
              <button className="cyber-btn cyber-btn-outline" onClick={() => handlePrevStage('stage_c_k2')}>
                ← Anterior
              </button>
              <button
                className="cyber-btn cyber-btn-primary"
                onClick={() => {
                  if (!session.k3Responses.differencesText?.trim()) {
                    setValidationAlert('Por favor escribe en qué se diferencian las dos investigaciones.');
                    return;
                  }
                  handleNextStage('stage_e_k4');
                }}
              >
                Siguiente (K4: Conectar las ideas) →
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            ETAPA E: K4 CONECTAR LAS IDEAS (SÍNTESIS Y TRANSFERENCIA)
            ========================================================================= */}
        {session.currentStage === 'stage_e_k4' && (
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <h3 className="eval-stage-title" style={{ margin: 0 }}>
                Etapa E. K4: Conectar las ideas
              </h3>
              <span className="eval-stage-tag">
                Criterio Metodológico K4
              </span>
            </div>
            <p className="eval-stage-lead">
              {isGuided
                ? 'Objetivo: Une tres investigaciones para contar una historia completa y explica la idea principal con tus propias palabras a alguien que no conoce el tema.'
                : 'Objetivo: Evaluar la capacidad de sintetizar aportes cruzados entre al menos tres antecedentes y realizar una transferencia divulgativa rigurosa.'}
            </p>

            <div className="form-group" style={{ marginBottom: '18px' }}>
              <label>{isGuided ? 'Elige 3 investigaciones para conectarlas:' : 'Tarjetas Conectadas para la Síntesis (Mínimo 3):'}</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                {[0, 1, 2].map(idx => (
                  <select
                    key={idx}
                    className="cyber-select"
                    value={session.k4Responses.selectedCardIds?.[idx] || ['MTC01', 'MTC06', 'MTC43'][idx]}
                    onChange={(e) => {
                      const next = [...(session.k4Responses.selectedCardIds || ['MTC01', 'MTC06', 'MTC43'])];
                      next[idx] = e.target.value;
                      updateK4({ selectedCardIds: next });
                    }}
                  >
                    {deck.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.id} · {c.firstAuthor} ({c.year}) - {c.title.slice(0, 24)}...
                      </option>
                    ))}
                  </select>
                ))}
              </div>
            </div>

            {/* Síntesis integradora */}
            <div className="form-group" style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ margin: 0 }}>
                  {isGuided ? '1. ¿Cómo se conectan o complementan estos 3 estudios?' : '1. Síntesis Integradora de Vacíos y Aportes:'}
                </label>
              </div>

              {/* En Modo Guiado: Píldoras de frases incompletas (Sentence Starters) */}
              {isGuided && (
                <div style={{ marginBottom: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '11px', color: 'var(--c-peach)', alignSelf: 'center' }}>Frases de inicio:</span>
                  {K4_GUIDED_SENTENCE_STARTERS.synthesis.map((starter, sIdx) => (
                    <button
                      key={sIdx}
                      type="button"
                      className="cyber-btn cyber-btn-outline"
                      style={{ fontSize: '11px', padding: '3px 8px' }}
                      onClick={() => {
                        updateK4({
                          synthesisSentenceStarter: starter,
                          synthesisText: session.k4Responses.synthesisText ? `${starter} ${session.k4Responses.synthesisText}` : `${starter} `
                        });
                      }}
                    >
                      "{starter.slice(0, 28)}..."
                    </button>
                  ))}
                </div>
              )}

              <textarea
                className="cyber-input"
                rows={3}
                placeholder={
                  isGuided
                    ? 'Escribe cómo lo que hace uno ayuda a resolver lo que al otro le faltó...'
                    : 'Redacta un párrafo conectando cómo los aportes y limitaciones de las tarjetas seleccionadas justifican una nueva investigación...'
                }
                value={session.k4Responses.synthesisText || ''}
                onChange={(e) => updateK4({ synthesisText: e.target.value })}
              />
            </div>

            {/* Tarea de transferencia */}
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ margin: 0 }}>
                  {isGuided ? '2. ¿Cómo se lo explicarías a otra persona de forma sencilla?' : '2. Tarea de Transferencia hacia Público no Especializado:'}
                </label>
              </div>

              {isGuided && (
                <div style={{ marginBottom: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '11px', color: 'var(--c-peach)', alignSelf: 'center' }}>Frases de inicio:</span>
                  {K4_GUIDED_SENTENCE_STARTERS.transfer.map((starter, sIdx) => (
                    <button
                      key={sIdx}
                      type="button"
                      className="cyber-btn cyber-btn-outline"
                      style={{ fontSize: '11px', padding: '3px 8px' }}
                      onClick={() => {
                        updateK4({
                          transferSentenceStarter: starter,
                          transferExplanationText: session.k4Responses.transferExplanationText
                            ? `${starter} ${session.k4Responses.transferExplanationText}`
                            : `${starter} `
                        });
                      }}
                    >
                      "{starter.slice(0, 30)}..."
                    </button>
                  ))}
                </div>
              )}

              <textarea
                className="cyber-input"
                rows={3}
                placeholder={
                  isGuided
                    ? 'Imagínate que le explicas a un chofer o a un vecino por qué los ingenieros deben resolver este problema...'
                    : '¿Cómo le explicarías a un transportista o ciudadano no técnico por qué es importante resolver los desafíos técnicos identificados?'
                }
                value={session.k4Responses.transferExplanationText || ''}
                onChange={(e) => updateK4({ transferExplanationText: e.target.value })}
              />
            </div>

            {/* Rúbrica de evaluación de 7 criterios */}
            <div className="eval-question-card eval-codebook-card">
              <h4 style={{ color: 'var(--c-copper)', margin: '0 0 6px 0', fontSize: '13.5px', fontWeight: 800 }}>
                📋 Rúbrica de 7 Criterios para Revisión por Pares
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--c-rose)', margin: '0 0 14px 0', lineHeight: 1.5 }}>
                Tus respuestas abiertas se conservan íntegras para que un evaluador humano las valore de forma transparente con esta pauta:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', fontSize: '11.5px' }}>
                {K4_EVALUATION_RUBRIC.map(crit => (
                  <div key={crit.criterionId} className="eval-codebook-item">
                    <b className="eval-codebook-title">{crit.name}</b>
                    <p className="eval-codebook-desc">{crit.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="eval-stage-nav-bar">
              <button className="cyber-btn cyber-btn-outline" onClick={() => handlePrevStage('stage_d_k3')}>
                ← Anterior
              </button>
              <button
                className="cyber-btn cyber-btn-primary"
                onClick={() => {
                  if (!session.k4Responses.synthesisText?.trim() || !session.k4Responses.transferExplanationText?.trim()) {
                    setValidationAlert('Por favor completa tanto la conexión de ideas como la explicación sencilla.');
                    return;
                  }
                  handleNextStage('stage_f_k5_k6');
                }}
              >
                Siguiente (K5/K6: Uso y Esfuerzo) →
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            ETAPA F: K5 FACILIDAD DE USO Y K6 ESFUERZO / DIFICULTAD
            ========================================================================= */}
        {session.currentStage === 'stage_f_k5_k6' && (
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <h3 className="eval-stage-title" style={{ margin: 0 }}>
                Etapa F. K5: Facilidad de uso y K6: Esfuerzo y dificultad
              </h3>
              <span className="eval-stage-tag">
                Criterios K5 y K6
              </span>
            </div>
            <p className="eval-stage-lead">
              {isGuided
                ? 'Objetivo: Cuéntanos qué tan fácil te pareció la herramienta y cuánto esfuerzo mental sentiste al usarla. Elige del 1 al 5 o marca "No sé".'
                : 'Objetivo: Evaluar dimensiones de usabilidad percibida (K5) y demanda cognitiva (K6) de manera diferenciada en escala Likert.'}
            </p>

            <h4 style={{ color: 'var(--c-peach)', fontSize: '14px', margin: '14px 0 8px' }}>
              {isGuided ? '1. Facilidad y Claridad (K5):' : '1. Usabilidad del Sistema (K5):'}
            </h4>
            {renderLikertRow(
              isGuided ? '¿Las tarjetas fueron claras y fáciles de leer?' : 'Claridad y legibilidad de las tarjetas de revisión:',
              session.k5k6Responses.cardsClarity,
              (val) => updateK5K6({ cardsClarity: val })
            )}
            {renderLikertRow(
              isGuided ? '¿Fue fácil moverse entre las pantallas y juegos?' : 'Facilidad de navegación entre minijuegos y vistas:',
              session.k5k6Responses.navigationEase,
              (val) => updateK5K6({ navigationEase: val })
            )}
            {renderLikertRow(
              isGuided ? '¿Te resultó sencillo comparar dos tarjetas con las ilustraciones?' : 'Facilidad para comparar investigaciones visualmente:',
              session.k5k6Responses.comparisonEase,
              (val) => updateK5K6({ comparisonEase: val })
            )}

            <h4 style={{ color: 'var(--c-peach)', fontSize: '14px', margin: '18px 0 8px' }}>
              {isGuided ? '2. ¿Para qué te sirvió la herramienta?' : '2. Utilidad Percibida:'}
            </h4>
            {renderLikertRow(
              isGuided ? '¿Te ayudó a entender mejor la historia de los triciclos eléctricos?' : 'Utilidad para comprender la evolución del estado del arte:',
              session.k5k6Responses.utilityStateOfArt,
              (val) => updateK5K6({ utilityStateOfArt: val })
            )}
            {renderLikertRow(
              isGuided ? '¿Sería útil para enseñar este tema en colegios o universidades?' : 'Utilidad como herramienta didáctica en docencia:',
              session.k5k6Responses.utilityTeaching,
              (val) => updateK5K6({ utilityTeaching: val })
            )}
            {renderLikertRow(
              isGuided ? '¿Sería útil para proyectos de ingeniería o tesis reales?' : 'Utilidad para estructurar una investigación formal:',
              session.k5k6Responses.utilityResearch,
              (val) => updateK5K6({ utilityResearch: val })
            )}
            {renderLikertRow(
              isGuided ? '¿Sientes mayor seguridad para hablar de este tema con otra persona?' : 'Confianza adquirida para explicar el tema:',
              session.k5k6Responses.confidenceExplaining,
              (val) => updateK5K6({ confidenceExplaining: val })
            )}

            <h4 style={{ color: 'var(--c-peach)', fontSize: '14px', margin: '18px 0 8px' }}>
              {isGuided ? '3. Esfuerzo Mental y Dificultad (K6):' : '3. Demanda Cognitiva y Carga de Trabajo (K6):'}
            </h4>
            {renderLikertRow(
              isGuided ? '¿Cuánto esfuerzo mental o concentración te exigió esta actividad?' : 'Esfuerzo mental requerido para operar el sistema de tarjetas:',
              session.k5k6Responses.perceivedMentalEffort,
              (val) => updateK5K6({ perceivedMentalEffort: val }),
              isGuided ? 'Muy poco esfuerzo (1)' : 'Esfuerzo muy bajo (1)',
              isGuided ? 'Muchísimo esfuerzo (5)' : 'Esfuerzo mental extremo (5)'
            )}
            {renderLikertRow(
              isGuided ? '¿Qué tan difícil sentiste unir y resumir las tres investigaciones?' : 'Dificultad percibida para sintetizar la información del corpus:',
              session.k5k6Responses.synthesisDifficulty,
              (val) => updateK5K6({ synthesisDifficulty: val }),
              isGuided ? 'Muy fácil (1)' : 'Muy fácil de sintetizar (1)',
              isGuided ? 'Muy difícil (5)' : 'Extremadamente difícil (5)'
            )}

            <h4 style={{ color: 'var(--c-peach)', fontSize: '14px', margin: '18px 0 8px' }}>4. Intención de Uso:</h4>
            {renderLikertRow(
              isGuided ? '¿Te gustaría volver a jugar o usar esta herramienta en el futuro?' : 'Intención de volver a utilizar MTC Research Game en futuros proyectos:',
              session.k5k6Responses.intentionToReuse,
              (val) => updateK5K6({ intentionToReuse: val }),
              isGuided ? 'No me gustaría (1)' : 'No volvería a usarlo (1)',
              isGuided ? 'Sí, me encantaría (5)' : 'Definitivamente sí (5)'
            )}

            <div className="eval-stage-nav-bar">
              <button className="cyber-btn cyber-btn-outline" onClick={() => handlePrevStage('stage_e_k4')}>
                ← Anterior
              </button>
              <button className="cyber-btn cyber-btn-primary" onClick={() => handleNextStage('stage_g_comments')}>
                Siguiente (Sugerencias) →
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            ETAPA G: SUGERENCIAS Y COMENTARIOS
            ========================================================================= */}
        {session.currentStage === 'stage_g_comments' && (
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ color: 'var(--c-peach)', marginTop: 0 }}>Etapa G. Sugerencias y Comentarios (Opcional)</h3>
            <p style={{ fontSize: '13px', color: 'var(--c-rose)', marginBottom: '18px' }}>
              {isGuided
                ? 'Tus ideas nos ayudan a hacer la herramienta más divertida y clara. Puedes escribir lo que quieras o dejar campos en blanco.'
                : 'Tus comentarios cualitativos permitirán perfeccionar la ruta metodológica y el grafo de relaciones. Puedes omitir cualquier pregunta.'}
            </p>

            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label>{isGuided ? '¿Qué fue lo que más te gustó o más te ayudó a aprender?' : '¿Qué aspecto de la aplicación te ayudó más a comprender el estado del arte?'}</label>
              <textarea
                className="cyber-input"
                rows={2}
                value={session.qualitativeComments.whatHelpedMost || ''}
                onChange={(e) => updateComments({ whatHelpedMost: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label>{isGuided ? '¿Hubo algo confuso, aburrido o difícil de entender?' : '¿Qué elemento resultó confuso, difícil o poco claro?'}</label>
              <textarea
                className="cyber-input"
                rows={2}
                value={session.qualitativeComments.whatWasConfusing || ''}
                onChange={(e) => updateComments({ whatWasConfusing: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label>{isGuided ? '¿Qué dibujo, dato o explicación sentiste que faltó?' : '¿Qué información adicional sentiste que faltó en las tarjetas?'}</label>
              <textarea
                className="cyber-input"
                rows={2}
                value={session.qualitativeComments.missingInformationInCards || ''}
                onChange={(e) => updateComments({ missingInformationInCards: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label>{isGuided ? '¿Cómo te gustaría que usemos esto en tu colegio, barrio o trabajo?' : '¿Qué utilidad concreta tendría esta herramienta en tu propio contexto profesional o docente?'}</label>
              <textarea
                className="cyber-input"
                rows={2}
                value={session.qualitativeComments.professionalUtilityContext || ''}
                onChange={(e) => updateComments({ professionalUtilityContext: e.target.value })}
              />
            </div>

            <div className="eval-stage-nav-bar">
              <button className="cyber-btn cyber-btn-outline" onClick={() => handlePrevStage('stage_f_k5_k6')}>
                ← Anterior
              </button>
              <button className="cyber-btn cyber-btn-primary" onClick={() => handleNextStage('stage_review')}>
                Revisar Respuestas y Finalizar →
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            PANTALLA DE REVISIÓN
            ========================================================================= */}
        {session.currentStage === 'stage_review' && (
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ color: 'var(--c-peach)', marginTop: 0 }}>Revisión Final de tu Evaluación</h3>
            <p style={{ fontSize: '13px', color: 'var(--c-rose)', marginBottom: '18px' }}>
              Comprueba el resumen de tus respuestas antes de registrar la sesión:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginBottom: '20px' }}>
              <div className="eval-stat-grid-item">
                <b style={{ color: 'var(--c-copper)', fontSize: '12px' }}>Modalidad Seleccionada:</b>
                <div className="eval-stat-grid-val">
                  {isGuided ? '🌟 Modo Guiado' : '🔬 Modo de Investigación'}
                </div>
              </div>

              <div className="eval-stat-grid-item">
                <b style={{ color: 'var(--c-copper)', fontSize: '12px' }}>Pistas / Ayudas Consultadas:</b>
                <div style={{ fontSize: '13px', color: session.hintsUsed?.length > 0 ? '#15803d' : 'var(--text-secondary)', marginTop: '4px', fontWeight: 700 }}>
                  {session.hintsUsed?.length || 0} pistas utilizadas
                </div>
              </div>

              <div className="eval-stat-grid-item">
                <b style={{ color: 'var(--c-copper)', fontSize: '12px' }}>B. K1: Comprender las ideas:</b>
                <div className="eval-stat-grid-val">
                  4 de 4 tareas objetivas registradas
                </div>
              </div>

              <div className="eval-stat-grid-item">
                <b style={{ color: 'var(--c-copper)', fontSize: '12px' }}>C. K2: Comprobar la información:</b>
                <div className="eval-stat-grid-val">
                  Metadatos y preguntas de verificación completadas
                </div>
              </div>

              <div className="eval-stat-grid-item">
                <b style={{ color: 'var(--c-copper)', fontSize: '12px' }}>D. K3: Comparar dos estudios:</b>
                <div className="eval-stat-grid-val">
                  Contraste entre {(session.k3Responses.selectedCardIds || []).join(' y ')}
                </div>
              </div>

              <div className="eval-stat-grid-item">
                <b style={{ color: 'var(--c-copper)', fontSize: '12px' }}>E. K4: Conectar las ideas:</b>
                <div className="eval-stat-grid-val">
                  Síntesis de {(session.k4Responses.selectedCardIds || []).join(', ')}
                </div>
              </div>
            </div>

            <div className="eval-alert-banner">
              <b style={{ color: 'var(--c-copper)', fontSize: '13px' }}>⚡ Confirmación de Registro y Transmisión Central</b>
              <p>
                Al pulsar el botón a continuación, se calcularán las puntuaciones objetivas reproducibles correspondientes a tu modalidad. La aplicación guardará tus respuestas de forma segura en este dispositivo e intentará transmitirlas al servidor central de investigación (si está configurado y hay conexión a internet).
              </p>
            </div>

            <div className="eval-stage-nav-bar">
              <button className="cyber-btn cyber-btn-outline" onClick={() => handlePrevStage('stage_g_comments')}>
                ← Modificar Respuestas
              </button>
              <button
                className="cyber-btn cyber-btn-primary"
                onClick={() => {
                  soundEngine.playVictory();
                  completeEvaluation();
                }}
              >
                Confirmar y Registrar Evaluación ⚡
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            PANTALLA FINAL: CONFIRMACIÓN Y EXPORTACIÓN
            ========================================================================= */}
        {session.currentStage === 'stage_complete' && (
          <div className="glass-panel" style={{ padding: '28px', textAlign: 'center' }}>
            <div style={{ fontSize: '44px', marginBottom: '8px' }}>🎉</div>
            <h3 className="eval-stage-title" style={{ margin: '0 0 8px 0' }}>¡Evaluación Completada con Éxito!</h3>
            <p className="eval-stage-lead" style={{ maxWidth: '640px', margin: '0 auto 20px' }}>
              Muchas gracias por tu tiempo y dedicación. Tus respuestas han sido procesadas en <b>{isGuided ? 'Modo Guiado' : 'Modo de Investigación'}</b> con el código anónimo <b>{session.sessionId}</b>.
            </p>

            {/* Estado de Sincronización en la Nube */}
            <div style={{ maxWidth: '680px', margin: '0 auto 24px', textAlign: 'left' }}>
              {session.cloudSubmissionStatus === 'synced' && (
                <div className="eval-cloud-status-card synced" style={{ background: 'rgba(21, 128, 61, 0.08)', border: '1.5px solid #15803d', borderRadius: '10px', padding: '14px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '24px' }}>☁️✅</span>
                    <div>
                      <b style={{ color: '#15803d', fontSize: '13.5px', display: 'block' }}>
                        Registrado exitosamente en la base de datos central de investigación
                      </b>
                      <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                        Confirmación del servidor: {session.cloudSubmissionTimestamp ? new Date(session.cloudSubmissionTimestamp).toLocaleString('es-ES') : 'Confirmado'}
                        {session.clientSubmissionId && ` · Token: ${session.clientSubmissionId.slice(0, 24)}...`}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {session.cloudSubmissionStatus === 'submitting' && (
                <div className="eval-cloud-status-card submitting" style={{ background: 'rgba(212, 120, 61, 0.08)', border: '1.5px solid var(--c-copper)', borderRadius: '10px', padding: '14px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '24px' }}>⏳</span>
                    <div>
                      <b style={{ color: 'var(--c-copper)', fontSize: '13.5px', display: 'block' }}>
                        Transmitiendo evaluación a la base de datos central...
                      </b>
                      <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                        Validando respuestas y registrando sesión. Por favor espera unos segundos.
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {session.cloudSubmissionStatus === 'failed' && (
                <div className="eval-cloud-status-card failed" style={{ background: 'rgba(184, 44, 57, 0.08)', border: '1.5px solid var(--c-crimson)', borderRadius: '10px', padding: '14px 18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flex: '1', minWidth: '240px' }}>
                      <span style={{ fontSize: '24px' }}>⚠️</span>
                      <div>
                        <b style={{ color: 'var(--c-crimson)', fontSize: '13.5px', display: 'block' }}>
                          Guardado en este equipo (No recibido aún por el servidor central)
                        </b>
                        <p style={{ margin: '3px 0 0 0', fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
                          {session.cloudSubmissionError || 'No se pudo conectar con el servidor central de investigación.'} Tus datos <b>NO se han perdido</b>: se encuentran seguros en la memoria de este navegador.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="cyber-btn cyber-btn-primary"
                      style={{ fontSize: '11.5px', padding: '8px 14px', whiteSpace: 'nowrap' }}
                      onClick={() => retryCloudSubmission()}
                    >
                      🔄 Reintentar Envío a la Nube
                    </button>
                  </div>
                </div>
              )}

              {(!session.cloudSubmissionStatus || session.cloudSubmissionStatus === 'idle' || session.cloudSubmissionStatus === 'unconfigured' || session.cloudSubmissionStatus === 'offline_saved') && (
                <div className="eval-cloud-status-card unconfigured" style={{ background: 'rgba(40, 20, 32, 0.4)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '22px' }}>💾</span>
                    <div>
                      <b style={{ color: 'var(--c-copper)', fontSize: '13px', display: 'block' }}>
                        Almacenado localmente en este navegador
                      </b>
                      <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                        El servidor central no está configurado en este entorno de prueba o estás trabajando sin conexión. Puedes descargar tu archivo JSON o CSV para conservarlo o remitirlo al equipo de investigación.
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Resumen de puntuaciones objetivas */}
            {session.objectiveScores && (
              <div className="eval-results-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', borderBottom: '1px solid rgba(108, 55, 69, 0.2)', paddingBottom: '6px' }}>
                  <h4 style={{ color: 'var(--c-copper)', margin: 0, fontSize: '14px', fontWeight: 800 }}>
                    📊 Resumen de Respuestas Objetivas:
                  </h4>
                  <span style={{ fontSize: '11px', background: 'rgba(184, 44, 57, 0.1)', color: 'var(--c-crimson)', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                    Modalidad: {session.objectiveScores.modeScored === 'guiado' ? '🌟 Guiado' : '🔬 Investigación'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                  <span className="eval-results-row-lbl">K1: Comprender las ideas:</span>
                  <b style={{ color: 'var(--c-copper)' }}>{session.objectiveScores.k1Score} / {session.objectiveScores.k1Max} pts</b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                  <span className="eval-results-row-lbl">K2: Comprobar la información:</span>
                  <b style={{ color: 'var(--c-copper)' }}>{session.objectiveScores.k2Score} / {session.objectiveScores.k2Max} pts</b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', borderTop: '1px dashed rgba(108, 55, 69, 0.25)', paddingTop: '8px' }}>
                  <span className="eval-results-row-lbl" style={{ fontWeight: 700 }}>Total Objetivo Replicable:</span>
                  <b style={{ color: '#15803d', fontSize: '15px' }}>
                    {session.objectiveScores.totalObjectiveScore} / {session.objectiveScores.totalObjectiveMax} pts ({session.objectiveScores.percentage}%)
                  </b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '12px', color: 'var(--c-rose)' }}>
                  <span>Pistas / Ayudas utilizadas:</span>
                  <b>{session.hintsUsed?.length || 0} pistas</b>
                </div>
                <p style={{ margin: '10px 0 0 0', fontSize: '11px', color: 'var(--c-rose)', fontStyle: 'italic' }}>
                  * Las comparaciones (K3) y conexiones (K4) se guardan íntegras en los archivos exportados para su valoración humana con la rúbrica de 7 criterios.
                </p>
              </div>
            )}

            {/* Botones de Exportación */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '24px' }}>
              <button
                className="cyber-btn cyber-btn-primary"
                onClick={() => exportEvaluationJSON(session)}
                title="Exportar archivo JSON estructurado con codebook completo"
              >
                📥 Exportar Evaluación en JSON
              </button>
              <button
                className="cyber-btn cyber-btn-secondary"
                onClick={() => exportEvaluationCSV(session)}
                title="Exportar archivo CSV tabular compatible con Excel y R"
              >
                📊 Exportar Evaluación en CSV
              </button>
              <button
                className="cyber-btn cyber-btn-outline"
                onClick={() => setActiveTab('synthesis')}
              >
                Ver Estado del Arte Vivo 📝
              </button>
            </div>

            {/* Barra de continuidad hacia la última etapa */}
            <div className="activity-continuity-bar" style={{ marginTop: '24px', marginBottom: '24px' }}>
              <div className="continuity-info">
                <span className="continuity-step-tag">Etapa 06 de 07 · Validación Empírica</span>
                <span className="continuity-desc">
                  Has completado el instrumento científico. El paso final del recorrido es revisar y exportar tu borrador académico y matriz consolidada.
                </span>
              </div>
              <button
                type="button"
                className="cyber-btn cyber-btn-primary continuity-next-btn"
                onClick={() => setActiveTab('synthesis')}
              >
                <span>Siguiente paso: Estado del Arte Vivo</span>
                <span className="continuity-arrow">→</span>
              </button>
            </div>

            <div style={{ borderTop: '1px solid #2d1421', paddingTop: '16px' }}>
              <button
                className="cyber-btn cyber-btn-outline"
                style={{ fontSize: '11px', color: '#ff999f', borderColor: 'rgba(255, 153, 159, 0.4)' }}
                onClick={() => setConfirmDeleteModal(true)}
              >
                🗑️ Eliminar Datos Locales de esta Evaluación
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            MODAL DE CONFIRMACIÓN PARA BORRAR DATOS LOCALES
            ========================================================================= */}
        {confirmDeleteModal && (
          <div className="modal-overlay" role="dialog" aria-modal="true">
            <div className="glass-panel eval-danger-modal">
              <h3>⚠️ ¿Eliminar datos locales de la evaluación?</h3>
              <p>
                Esta acción eliminará de forma irreversible las respuestas guardadas localmente en este navegador para la sesión <b>{session.sessionId}</b>. Si deseas conservarlas, descárgalas en JSON o CSV antes de continuar.
              </p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button className="cyber-btn cyber-btn-outline" onClick={() => setConfirmDeleteModal(false)}>
                  Cancelar
                </button>
                <button
                  className="cyber-btn"
                  style={{ background: 'var(--c-crimson)', color: '#fff', borderColor: 'var(--c-crimson)' }}
                  onClick={() => {
                    resetEvaluation();
                    setConfirmDeleteModal(false);
                    soundEngine.playDrop();
                  }}
                >
                  Sí, Eliminar Definitivamente
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
