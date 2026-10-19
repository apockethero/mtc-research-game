import React, { useState } from 'react';
import { useSession } from '../../context/SessionContext';
import { useEvaluationSession } from '../../hooks/useEvaluationSession';
import {
  K1_QUESTIONS,
  K2_QUESTIONS,
  K4_EVALUATION_RUBRIC,
  exportEvaluationJSON,
  exportEvaluationCSV,
  calculateObjectiveScores
} from '../../services/evaluationScoring';
import {
  AcademicRole,
  EducationLevel,
  DisciplinaryArea,
  DeviceType,
  EvaluationStage
} from '../../types/evaluation';
import { soundEngine } from '../../services/soundEngine';

export const EvaluationView: React.FC = () => {
  const { deck, setActiveTab } = useSession();
  const {
    session,
    updateConsent,
    updateProfile,
    updateK1,
    updateK2,
    updateK3,
    updateK4,
    updateK5K6,
    updateComments,
    setStage,
    completeEvaluation,
    resetEvaluation
  } = useEvaluationSession();

  const [confirmDeleteModal, setConfirmDeleteModal] = useState<boolean>(false);
  const [validationAlert, setValidationAlert] = useState<string | null>(null);

  const stagesList: { id: EvaluationStage; label: string; short: string }[] = [
    { id: 'stage_0_consent', label: '0. Consentimiento', short: '0' },
    { id: 'stage_a_profile', label: 'A. Perfil', short: 'A' },
    { id: 'stage_b_k1', label: 'B. Comprensión (K1)', short: 'B' },
    { id: 'stage_c_k2', label: 'C. Trazabilidad (K2)', short: 'C' },
    { id: 'stage_d_k3', label: 'D. Comparación (K3)', short: 'D' },
    { id: 'stage_e_k4', label: 'E. Síntesis (K4)', short: 'E' },
    { id: 'stage_f_k5_k6', label: 'F. Usabilidad & Carga', short: 'F' },
    { id: 'stage_g_comments', label: 'G. Comentarios', short: 'G' },
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
    leftLabel = 'Totalmente en desacuerdo (1)',
    rightLabel = 'Totalmente de acuerdo (5)'
  ) => (
    <div className="eval-likert-row" style={{ marginBottom: '14px', background: '#180d15', padding: '12px', borderRadius: '8px', border: '1px solid #331725' }}>
      <div style={{ fontSize: '13px', fontWeight: 600, color: '#fcebe6', marginBottom: '8px' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '11px', color: 'var(--c-rose)', minWidth: '120px' }}>{leftLabel}</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[1, 2, 3, 4, 5].map(num => (
            <button
              key={num}
              type="button"
              className={`cyber-btn ${value === num ? 'cyber-btn-primary' : 'cyber-btn-outline'}`}
              style={{ minWidth: '36px', height: '36px', padding: 0, fontSize: '13px', fontWeight: 700 }}
              onClick={() => onChange(num)}
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            className={`cyber-btn ${value === 0 ? 'cyber-btn-secondary' : 'cyber-btn-outline'}`}
            style={{ fontSize: '11px', padding: '0 8px', height: '36px' }}
            onClick={() => onChange(0)}
            title="No puedo valorar este aspecto"
          >
            N/V
          </button>
        </div>
        <span style={{ fontSize: '11px', color: 'var(--c-rose)', minWidth: '120px', textAlign: 'right' }}>{rightLabel}</span>
      </div>
    </div>
  );

  return (
    <div className="view-panel active eval-view-panel">
      <div className="game-wrapper" style={{ maxWidth: '960px', margin: '0 auto' }}>
        {/* CABECERA DEL INSTRUMENTO */}
        <div className="game-header-bar" style={{ marginBottom: '16px' }}>
          <div>
            <div className="game-tag" style={{ color: 'var(--c-peach)' }}>
              INSTRUMENTO DE VALIDACIÓN CIENTÍFICA · VERSIÓN EXPERIMENTAL 1.0.0
            </div>
            <h2 style={{ margin: '4px 0 6px', color: '#fff' }}>Evaluación Científica del Sistema MTC</h2>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--c-rose)' }}>
              Instrumento piloto para recolectar datos empíricos sobre la comprensión, trazabilidad y utilidad del sistema de tarjetas de revisión.
            </p>
          </div>
          <div className="game-actions" style={{ alignItems: 'flex-end' }}>
            <div className="hud-stats-pill" style={{ background: '#20101b', border: '1px solid var(--border-color)' }}>
              <span>ID Sesión:</span> <b>{session.sessionId}</b>
            </div>
            {session.currentStage !== 'stage_complete' && (
              <button
                className="cyber-btn cyber-btn-outline"
                style={{ fontSize: '11px', padding: '4px 8px' }}
                onClick={() => setConfirmDeleteModal(true)}
                title="Reiniciar o borrar datos locales de esta evaluación"
              >
                Reiniciar
              </button>
            )}
          </div>
        </div>

        {/* BARRA DE PROGRESO DE ETAPAS */}
        {session.currentStage !== 'stage_complete' && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px', color: 'var(--c-rose)' }}>
              <span>Etapa actual: <b>{stagesList[currentIdx]?.label}</b></span>
              <span>Progreso: <b>{progressPercent}%</b></span>
            </div>
            <div style={{ height: '6px', background: '#25121e', borderRadius: '3px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${progressPercent}%`,
                  background: 'linear-gradient(90deg, var(--c-crimson), var(--c-copper), var(--c-peach))',
                  transition: 'width 0.3s ease'
                }}
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
            ETAPA 0: INFORMACIÓN Y CONSENTIMIENTO
            ========================================================================= */}
        {session.currentStage === 'stage_0_consent' && (
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ color: 'var(--c-peach)', marginTop: 0 }}>0. Información y Consentimiento Informado</h3>
            <p style={{ fontSize: '13.5px', lineHeight: 1.6, color: '#fcebe6' }}>
              Te invitamos a participar de manera voluntaria en la evaluación exploratoria del sistema de tarjetas de revisión científica <b>MTC (Motor-Tricycle Cards)</b>. El propósito de este estudio es valorar si el modelo conceptual y relacional facilita la comprensión, comparación y síntesis de estados del arte especializados en vehículos eléctricos ligeros.
            </p>

            <div style={{ background: '#190d16', padding: '16px', borderRadius: '8px', border: '1px solid #3d1b2a', marginBottom: '18px', fontSize: '12.5px', color: '#fcebe6' }}>
              <h4 style={{ color: 'var(--c-rose)', margin: '0 0 8px 0', fontSize: '13px' }}>Términos de la Participación Exploratoria:</h4>
              <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li><b>Finalidad:</b> Uso académico y exploratorio para comprobar la usabilidad y rigor del sistema piloto.</li>
                <li><b>Carácter Voluntario:</b> Puedes suspender tu participación o abandonar la evaluación en cualquier momento sin ninguna consecuencia.</li>
                <li><b>Almacenamiento Local:</b> Las respuestas se guardan provisionalmente en el almacenamiento local de tu navegador (<code>localStorage</code>) para permitir pausas. No se transfieren a servidores externos sin tu consentimiento de exportación.</li>
                <li><b>Protección de Identidad:</b> No se solicita tu nombre, número de documento, dirección ni correo electrónico. Cada sesión utiliza un identificador aleatorio unívoco (<code>{session.sessionId}</code>).</li>
                <li><b>Resultados Agregados:</b> Los análisis de respuestas se realizarán de manera agregada y con citas cualitativas anonimizadas.</li>
                <li><b>Estado Experimental:</b> Este instrumento es una versión preliminar sujeta a retroalimentación y no constituye una prueba psicométrica formal certificada.</li>
              </ul>
            </div>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', background: '#22111d', padding: '14px', borderRadius: '8px', border: session.consentGiven ? '1px solid var(--c-peach)' : '1px solid #4a2133' }}>
              <input
                type="checkbox"
                checked={session.consentGiven}
                onChange={(e) => updateConsent(e.target.checked)}
                style={{ marginTop: '3px', transform: 'scale(1.2)' }}
              />
              <span style={{ fontSize: '13px', color: '#fff' }}>
                <b>He leído y comprendido las condiciones informadas</b>, y acepto libre y voluntariamente participar en esta evaluación exploratoria de MTC Research Game.
              </span>
            </label>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className="cyber-btn cyber-btn-primary"
                disabled={!session.consentGiven}
                onClick={() => handleNextStage('stage_a_profile')}
              >
                Comenzar Cuestionario →
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            ETAPA A: PERFIL Y FAMILIARIDAD PREVIA
            ========================================================================= */}
        {session.currentStage === 'stage_a_profile' && (
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ color: 'var(--c-peach)', marginTop: 0 }}>Etapa A. Perfil del Participante y Familiaridad Previa</h3>
            <p style={{ fontSize: '13px', color: 'var(--c-rose)', marginBottom: '18px' }}>
              Por favor, indica tu contexto formativo y nivel de experiencia. No se requieren datos personales de identificación directa.
            </p>

            <div className="form-grid" style={{ marginBottom: '16px' }}>
              <div className="form-group">
                <label>Rol Académico o Profesional:</label>
                <select
                  className="cyber-select full-width"
                  value={session.profile.academicRole || ''}
                  onChange={(e) => updateProfile({ academicRole: e.target.value as AcademicRole })}
                >
                  <option value="">-- Seleccionar --</option>
                  <option value="estudiante_pregrado">Estudiante de Pregrado</option>
                  <option value="estudiante_posgrado">Estudiante de Posgrado (Maestría / Doctorado)</option>
                  <option value="docente_investigador">Docente / Investigador Académico</option>
                  <option value="profesional_industria">Profesional de la Industria / Ingeniero</option>
                  <option value="otro">Otro</option>
                  <option value="prefiero_no_responder">Prefiero no responder</option>
                </select>
                {session.profile.academicRole === 'otro' && (
                  <input
                    type="text"
                    className="cyber-input"
                    style={{ marginTop: '8px' }}
                    placeholder="Especifica tu rol"
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
              <label>Área Disciplinar:</label>
              <select
                className="cyber-select full-width"
                value={session.profile.disciplinaryArea || ''}
                onChange={(e) => updateProfile({ disciplinaryArea: e.target.value as DisciplinaryArea })}
              >
                <option value="">-- Seleccionar --</option>
                <option value="mecanica_automotriz">Ingeniería Mecánica / Automotriz / Transporte</option>
                <option value="electrica_electronica">Ingeniería Eléctrica / Electrónica / Potencia</option>
                <option value="sistemas_computacion_ia">Sistemas / Computación / Ciencia de Datos / IA</option>
                <option value="transporte_logistica">Movilidad Urbana / Logística / Planificación</option>
                <option value="ciencias_ambientales_sostenibilidad">Ciencias Ambientales / Sostenibilidad</option>
                <option value="otra">Otra</option>
                <option value="prefiero_no_responder">Prefiero no responder</option>
              </select>
            </div>

            {renderLikertRow(
              'Familiaridad previa con la redacción o lectura de estados del arte (literature reviews):',
              session.profile.priorFamiliarityStateOfArt,
              (val) => updateProfile({ priorFamiliarityStateOfArt: val }),
              'Nula (1)',
              'Experta (5)'
            )}

            {renderLikertRow(
              'Familiaridad previa con vehículos utilitarios eléctricos o triciclos motorizados:',
              session.profile.priorFamiliarityElectricTricycles,
              (val) => updateProfile({ priorFamiliarityElectricTricycles: val }),
              'Nula (1)',
              'Muy alta (5)'
            )}

            <div className="form-group" style={{ marginTop: '14px' }}>
              <label>Tipo de Dispositivo Utilizado en esta Sesión:</label>
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
                    setValidationAlert('Por favor selecciona tu rol, nivel de formación y área disciplinar antes de continuar.');
                    return;
                  }
                  handleNextStage('stage_b_k1');
                }}
              >
                Siguiente (K1: Comprensión) →
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            ETAPA B: K1 COMPRENSIÓN CONCEPTUAL
            ========================================================================= */}
        {session.currentStage === 'stage_b_k1' && (
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ color: 'var(--c-peach)', marginTop: 0 }}>Etapa B. Criterio K1: Comprensión Conceptual del Estado del Arte</h3>
            <p style={{ fontSize: '13px', color: 'var(--c-rose)', marginBottom: '18px' }}>
              Responde a las siguientes preguntas objetivas diseñadas a partir de las tarjetas y metadatos reales del corpus MTC.
            </p>

            {/* B1: Aporte principal */}
            <div style={{ background: '#190d16', padding: '16px', borderRadius: '8px', marginBottom: '18px', border: '1px solid #381827' }}>
              <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#fff', marginBottom: '10px' }}>
                1. {K1_QUESTIONS.q1CoreContribution.prompt}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {K1_QUESTIONS.q1CoreContribution.options.map((opt) => (
                  <label key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px', color: '#fcebe6' }}>
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
            <div style={{ background: '#190d16', padding: '16px', borderRadius: '8px', marginBottom: '18px', border: '1px solid #381827' }}>
              <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#fff', marginBottom: '10px' }}>
                2. {K1_QUESTIONS.q2EvidenceTypes.prompt}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                {K1_QUESTIONS.q2EvidenceTypes.items.map((item) => (
                  <div key={item.cardId} style={{ background: '#22111d', padding: '10px', borderRadius: '6px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--c-peach)', marginBottom: '4px' }}>
                      {item.cardId}: {item.authorYear}
                    </div>
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
                      <option value="">-- Seleccionar Enfoque --</option>
                      {item.options.map(o => (
                        <option key={o.id} value={o.id}>{o.text}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* B3: Limitación metodológica */}
            <div style={{ background: '#190d16', padding: '16px', borderRadius: '8px', marginBottom: '18px', border: '1px solid #381827' }}>
              <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#fff', marginBottom: '10px' }}>
                3. {K1_QUESTIONS.q3MethodologicalLimitation.prompt}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {K1_QUESTIONS.q3MethodologicalLimitation.options.map((opt) => (
                  <label key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px', color: '#fcebe6' }}>
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
            <div style={{ background: '#190d16', padding: '16px', borderRadius: '8px', marginBottom: '18px', border: '1px solid #381827' }}>
              <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#fff', marginBottom: '10px' }}>
                4. {K1_QUESTIONS.q4TechnicalResultVsHypothesis.prompt}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {K1_QUESTIONS.q4TechnicalResultVsHypothesis.options.map((opt) => (
                  <label key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px', color: '#fcebe6' }}>
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

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between' }}>
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
                    setValidationAlert('Por favor responde las 4 preguntas de comprensión antes de continuar.');
                    return;
                  }
                  handleNextStage('stage_c_k2');
                }}
              >
                Siguiente (K2: Trazabilidad) →
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            ETAPA C: K2 TRAZABILIDAD BIBLIOMÉTRICA
            ========================================================================= */}
        {session.currentStage === 'stage_c_k2' && (
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ color: 'var(--c-peach)', marginTop: 0 }}>Etapa C. Criterio K2: Trazabilidad y Verificación Bibliográfica</h3>
            <p style={{ fontSize: '13px', color: 'var(--c-rose)', marginBottom: '18px' }}>
              La trazabilidad científica evalúa la capacidad de verificar metadatos de fuentes primarias y entender el significado de indicadores disponibles o pendientes.
            </p>

            {/* C1: Localizar metadatos */}
            <div style={{ background: '#190d16', padding: '16px', borderRadius: '8px', marginBottom: '18px', border: '1px solid #381827' }}>
              <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#fff', marginBottom: '8px' }}>
                1. {K2_QUESTIONS.q1LocateMetadata.prompt}
              </div>
              <p style={{ fontSize: '12px', color: 'var(--c-rose)', margin: '0 0 12px 0' }}>
                Puedes apoyarte en la pestaña "Mazo Completo" o en los datos de MTC43 del piloto.
              </p>
              <div className="form-grid">
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--c-rose)' }}>DOI o Identificador:</label>
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
                  <label style={{ fontSize: '12px', color: 'var(--c-rose)' }}>Año de Publicación:</label>
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
              <div style={{ marginTop: '10px' }}>
                <label style={{ fontSize: '12px', color: 'var(--c-rose)' }}>Tipo Documental Primario:</label>
                <select
                  className="cyber-select full-width"
                  value={session.k2Responses.q1LocateMetadata?.docType || ''}
                  onChange={(e) => {
                    const prev = session.k2Responses.q1LocateMetadata || { doi: '', year: '', docType: '' };
                    updateK2({ q1LocateMetadata: { ...prev, docType: e.target.value } });
                  }}
                >
                  <option value="">-- Seleccionar --</option>
                  <option value="articulo_revista">Artículo en Revista Indexada (Journal Article)</option>
                  <option value="conferencia">Acta de Conferencia (Conference Proceedings)</option>
                  <option value="capitulo_libro">Capítulo de Libro Técnico</option>
                  <option value="informe_tecnico">Informe Técnico no Indexado</option>
                </select>
              </div>
            </div>

            {/* C2: Indicadores ausentes/pendientes */}
            <div style={{ background: '#190d16', padding: '16px', borderRadius: '8px', marginBottom: '18px', border: '1px solid #381827' }}>
              <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#fff', marginBottom: '10px' }}>
                2. {K2_QUESTIONS.q2MissingOrPendingIndicatorInterpretation.prompt}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {K2_QUESTIONS.q2MissingOrPendingIndicatorInterpretation.options.map((opt) => (
                  <label key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px', color: '#fcebe6' }}>
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
            <div style={{ background: '#190d16', padding: '16px', borderRadius: '8px', marginBottom: '18px', border: '1px solid #381827' }}>
              <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#fff', marginBottom: '10px' }}>
                3. {K2_QUESTIONS.q3TraceabilityVsSecondaryCitation.prompt}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {K2_QUESTIONS.q3TraceabilityVsSecondaryCitation.options.map((opt) => (
                  <label key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px', color: '#fcebe6' }}>
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

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between' }}>
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
                    setValidationAlert('Por favor responde las preguntas sobre indicadores ausentes y auditabilidad de fuentes.');
                    return;
                  }
                  handleNextStage('stage_d_k3');
                }}
              >
                Siguiente (K3: Comparación) →
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            ETAPA D: K3 COMPARACIÓN ENTRE INVESTIGACIONES
            ========================================================================= */}
        {session.currentStage === 'stage_d_k3' && (
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ color: 'var(--c-peach)', marginTop: 0 }}>Etapa D. Criterio K3: Comparación Crítica entre Investigaciones</h3>
            <p style={{ fontSize: '13px', color: 'var(--c-rose)', marginBottom: '18px' }}>
              Selecciona al menos dos tarjetas del corpus y contrasta sus enfoques, métodos y limitaciones.
            </p>

            <div className="form-grid" style={{ marginBottom: '16px' }}>
              <div>
                <label>Tarjeta Referencial (Base):</label>
                <select
                  className="cyber-select full-width"
                  value={session.k3Responses.selectedCardIds?.[0] || 'MTC06'}
                  onChange={(e) => {
                    const ids = [...(session.k3Responses.selectedCardIds || ['MTC06', 'MTC09'])];
                    ids[0] = e.target.value;
                    updateK3({ selectedCardIds: ids as [string, string] });
                  }}
                >
                  {deck.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.id} · {c.firstAuthor} ({c.year}) - {c.title.slice(0, 36)}...
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Tarjeta de Contraste (Desafiante):</label>
                <select
                  className="cyber-select full-width"
                  value={session.k3Responses.selectedCardIds?.[1] || 'MTC09'}
                  onChange={(e) => {
                    const ids = [...(session.k3Responses.selectedCardIds || ['MTC06', 'MTC09'])];
                    ids[1] = e.target.value;
                    updateK3({ selectedCardIds: ids as [string, string] });
                  }}
                >
                  {deck.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.id} · {c.firstAuthor} ({c.year}) - {c.title.slice(0, 36)}...
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label>Criterio Principal de Comparación:</label>
              <select
                className="cyber-select full-width"
                value={session.k3Responses.comparisonCriterion || 'metodologia'}
                onChange={(e) => updateK3({ comparisonCriterion: e.target.value as any })}
              >
                <option value="metodologia">Metodología (ej. Simulación CAE vs Ensayos Físicos)</option>
                <option value="contribucion">Contribución Técnica (Aporte de diseño o algoritmo)</option>
                <option value="alcance_aplicacion">Alcance de Aplicación (Carga urbana vs Pasajeros)</option>
                <option value="limitaciones">Limitaciones Reportadas (Vacíos metodológicos cruzados)</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label>Diferencias Metodológicas o de Hallazgos:</label>
              <textarea
                className="cyber-input"
                rows={3}
                placeholder="Explica qué diferencias esenciales existen entre ambos antecedentes respecto al criterio seleccionado..."
                value={session.k3Responses.differencesText || ''}
                onChange={(e) => updateK3({ differencesText: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label>Similitudes o Puntos de Convergencia:</label>
              <textarea
                className="cyber-input"
                rows={2}
                placeholder="Menciona qué elementos teóricos o empíricos comparten..."
                value={session.k3Responses.similaritiesText || ''}
                onChange={(e) => updateK3({ similaritiesText: e.target.value })}
              />
            </div>

            {renderLikertRow(
              '¿Qué nivel de confianza tienes en tu comparación?',
              session.k3Responses.confidenceLevel,
              (val) => updateK3({ confidenceLevel: val }),
              'Muy baja confianza (1)',
              'Muy alta confianza (5)'
            )}

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between' }}>
              <button className="cyber-btn cyber-btn-outline" onClick={() => handlePrevStage('stage_c_k2')}>
                ← Anterior
              </button>
              <button
                className="cyber-btn cyber-btn-primary"
                onClick={() => {
                  if (!session.k3Responses.differencesText?.trim()) {
                    setValidationAlert('Por favor redacta las diferencias metodológicas o de hallazgos entre las tarjetas seleccionadas.');
                    return;
                  }
                  handleNextStage('stage_e_k4');
                }}
              >
                Siguiente (K4: Síntesis) →
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            ETAPA E: K4 SÍNTESIS Y TRANSFERENCIA
            ========================================================================= */}
        {session.currentStage === 'stage_e_k4' && (
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ color: 'var(--c-peach)', marginTop: 0 }}>Etapa E. Criterio K4: Síntesis y Transferencia Académica</h3>
            <p style={{ fontSize: '13px', color: 'var(--c-rose)', marginBottom: '18px' }}>
              Conecta al menos tres investigaciones del corpus para formular una síntesis argumentativa y realiza una tarea de transferencia hacia público no especializado.
            </p>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label>Tarjetas Conectadas para la Síntesis (Mínimo 3):</label>
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
                        {c.id} · {c.firstAuthor} ({c.year})
                      </option>
                    ))}
                  </select>
                ))}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label>Síntesis Integradora de Vacíos y Aportes:</label>
              <textarea
                className="cyber-input"
                rows={4}
                placeholder="Redacta un párrafo conectando cómo los aportes y limitaciones de las tarjetas seleccionadas justifican una nueva investigación..."
                value={session.k4Responses.synthesisText || ''}
                onChange={(e) => updateK4({ synthesisText: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '18px' }}>
              <label>Tarea de Transferencia: Explicación para una Persona no Especializada:</label>
              <textarea
                className="cyber-input"
                rows={3}
                placeholder="¿Cómo le explicarías a un transportista o ciudadano común por qué es importante resolver los desafíos técnicos identificados en estos artículos?"
                value={session.k4Responses.transferExplanationText || ''}
                onChange={(e) => updateK4({ transferExplanationText: e.target.value })}
              />
            </div>

            {/* Rúbrica de evaluación transparente para revisión por pares */}
            <div style={{ background: '#190d16', padding: '14px', borderRadius: '8px', border: '1px solid #381827', marginBottom: '18px' }}>
              <h4 style={{ color: 'var(--c-peach)', margin: '0 0 6px 0', fontSize: '13px' }}>
                📋 Rúbrica de Evaluación Auditable (Para Revisión Posterior por Pares)
              </h4>
              <p style={{ fontSize: '11.5px', color: 'var(--c-rose)', margin: '0 0 10px 0' }}>
                Tus respuestas abiertas no reciben puntajes artificiales opacos; se evalúan mediante esta matriz de 7 dimensiones:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px', fontSize: '11px' }}>
                {K4_EVALUATION_RUBRIC.map(crit => (
                  <div key={crit.criterionId} style={{ background: '#22111d', padding: '8px', borderRadius: '4px' }}>
                    <b style={{ color: '#fff' }}>{crit.name}</b>
                    <p style={{ margin: '2px 0 0 0', color: '#fcebe6', opacity: 0.85 }}>{crit.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between' }}>
              <button className="cyber-btn cyber-btn-outline" onClick={() => handlePrevStage('stage_d_k3')}>
                ← Anterior
              </button>
              <button
                className="cyber-btn cyber-btn-primary"
                onClick={() => {
                  if (!session.k4Responses.synthesisText?.trim() || !session.k4Responses.transferExplanationText?.trim()) {
                    setValidationAlert('Por favor completa tanto la síntesis integradora como la explicación de transferencia.');
                    return;
                  }
                  handleNextStage('stage_f_k5_k6');
                }}
              >
                Siguiente (K5/K6: Usabilidad & Carga) →
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            ETAPA F: K5 USABILIDAD Y K6 DEMANDA COGNITIVA
            ========================================================================= */}
        {session.currentStage === 'stage_f_k5_k6' && (
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ color: 'var(--c-peach)', marginTop: 0 }}>Etapa F. Criterios K5 (Usabilidad / Utilidad) y K6 (Demanda Cognitiva)</h3>
            <p style={{ fontSize: '13px', color: 'var(--c-rose)', marginBottom: '18px' }}>
              Evalúa tu experiencia con la herramienta en escala de 1 a 5 (o marca N/V si no puedes valorar ese aspecto). Nota que el esfuerzo mental se evalúa por separado de la utilidad.
            </p>

            <h4 style={{ color: 'var(--c-peach)', fontSize: '14px', margin: '14px 0 8px' }}>1. Usabilidad del Sistema (K5):</h4>
            {renderLikertRow('Claridad y legibilidad de las tarjetas de revisión:', session.k5k6Responses.cardsClarity, (val) => updateK5K6({ cardsClarity: val }))}
            {renderLikertRow('Facilidad de navegación entre minijuegos y vistas:', session.k5k6Responses.navigationEase, (val) => updateK5K6({ navigationEase: val }))}
            {renderLikertRow('Facilidad para comparar investigaciones visualmente:', session.k5k6Responses.comparisonEase, (val) => updateK5K6({ comparisonEase: val }))}

            <h4 style={{ color: 'var(--c-peach)', fontSize: '14px', margin: '18px 0 8px' }}>2. Utilidad Percibida:</h4>
            {renderLikertRow('Utilidad para comprender la evolución del estado del arte:', session.k5k6Responses.utilityStateOfArt, (val) => updateK5K6({ utilityStateOfArt: val }))}
            {renderLikertRow('Utilidad como herramienta didáctica en docencia universitaria:', session.k5k6Responses.utilityTeaching, (val) => updateK5K6({ utilityTeaching: val }))}
            {renderLikertRow('Utilidad para estructurar una tesis de investigación real:', session.k5k6Responses.utilityResearch, (val) => updateK5K6({ utilityResearch: val }))}
            {renderLikertRow('Confianza adquirida para explicar el tema a colegas o evaluadores:', session.k5k6Responses.confidenceExplaining, (val) => updateK5K6({ confidenceExplaining: val }))}

            <h4 style={{ color: 'var(--c-peach)', fontSize: '14px', margin: '18px 0 8px' }}>3. Demanda Cognitiva y Carga de Trabajo (K6):</h4>
            {renderLikertRow(
              'Esfuerzo mental requerido para operar el sistema de tarjetas:',
              session.k5k6Responses.perceivedMentalEffort,
              (val) => updateK5K6({ perceivedMentalEffort: val }),
              'Esfuerzo muy bajo (1)',
              'Esfuerzo mental extremo (5)'
            )}
            {renderLikertRow(
              'Dificultad percibida para sintetizar la información del corpus:',
              session.k5k6Responses.synthesisDifficulty,
              (val) => updateK5K6({ synthesisDifficulty: val }),
              'Muy fácil de sintetizar (1)',
              'Extremadamente difícil (5)'
            )}

            <h4 style={{ color: 'var(--c-peach)', fontSize: '14px', margin: '18px 0 8px' }}>4. Intención de Uso:</h4>
            {renderLikertRow('Intención de volver a utilizar MTC Research Game en futuros proyectos:', session.k5k6Responses.intentionToReuse, (val) => updateK5K6({ intentionToReuse: val }))}

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between' }}>
              <button className="cyber-btn cyber-btn-outline" onClick={() => handlePrevStage('stage_e_k4')}>
                ← Anterior
              </button>
              <button className="cyber-btn cyber-btn-primary" onClick={() => handleNextStage('stage_g_comments')}>
                Siguiente (Comentarios Abiertos) →
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            ETAPA G: COMENTARIOS ABIERTOS (OPCIONALES)
            ========================================================================= */}
        {session.currentStage === 'stage_g_comments' && (
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ color: 'var(--c-peach)', marginTop: 0 }}>Etapa G. Retroalimentación Cualitativa (Opcional)</h3>
            <p style={{ fontSize: '13px', color: 'var(--c-rose)', marginBottom: '18px' }}>
              Tus comentarios permitirán perfeccionar la ruta metodológica y el grafo de relaciones. Puedes omitir cualquier pregunta si lo prefieres.
            </p>

            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label>¿Qué aspecto de la aplicación te ayudó más a comprender el estado del arte?</label>
              <textarea
                className="cyber-input"
                rows={2}
                value={session.qualitativeComments.whatHelpedMost || ''}
                onChange={(e) => updateComments({ whatHelpedMost: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label>¿Qué elemento resultó confuso, difícil o poco claro?</label>
              <textarea
                className="cyber-input"
                rows={2}
                value={session.qualitativeComments.whatWasConfusing || ''}
                onChange={(e) => updateComments({ whatWasConfusing: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label>¿Qué información adicional sentiste que faltó en las tarjetas?</label>
              <textarea
                className="cyber-input"
                rows={2}
                value={session.qualitativeComments.missingInformationInCards || ''}
                onChange={(e) => updateComments({ missingInformationInCards: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label>¿Detectaste algún problema de trazabilidad o consistencia en los datos bibliométricos?</label>
              <textarea
                className="cyber-input"
                rows={2}
                value={session.qualitativeComments.traceabilityIssuesObserved || ''}
                onChange={(e) => updateComments({ traceabilityIssuesObserved: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label>¿Qué utilidad concreta tendría esta herramienta en tu propio contexto profesional o docente?</label>
              <textarea
                className="cyber-input"
                rows={2}
                value={session.qualitativeComments.professionalUtilityContext || ''}
                onChange={(e) => updateComments({ professionalUtilityContext: e.target.value })}
              />
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between' }}>
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
            PANTALLA DE REVISIÓN ANTES DEL ENVÍO
            ========================================================================= */}
        {session.currentStage === 'stage_review' && (
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ color: 'var(--c-peach)', marginTop: 0 }}>Revisión Final de Respuestas</h3>
            <p style={{ fontSize: '13px', color: 'var(--c-rose)', marginBottom: '18px' }}>
              Por favor revisa el estado general de tu evaluación antes de confirmar el registro definitivo.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginBottom: '20px' }}>
              <div style={{ background: '#190d16', padding: '12px', borderRadius: '6px', border: '1px solid #331725' }}>
                <b style={{ color: 'var(--c-peach)', fontSize: '12px' }}>0. Consentimiento:</b>
                <div style={{ fontSize: '13px', color: session.consentGiven ? '#4ade80' : '#ff999f', marginTop: '4px' }}>
                  {session.consentGiven ? '✓ Confirmado explícitamente' : '✗ Pendiente'}
                </div>
              </div>

              <div style={{ background: '#190d16', padding: '12px', borderRadius: '6px', border: '1px solid #331725' }}>
                <b style={{ color: 'var(--c-peach)', fontSize: '12px' }}>A. Perfil:</b>
                <div style={{ fontSize: '12px', color: '#fff', marginTop: '4px' }}>
                  Rol: {session.profile.academicRole || 'No especificado'}<br />
                  Nivel: {session.profile.educationLevel || 'No especificado'}
                </div>
              </div>

              <div style={{ background: '#190d16', padding: '12px', borderRadius: '6px', border: '1px solid #331725' }}>
                <b style={{ color: 'var(--c-peach)', fontSize: '12px' }}>B. Comprensión (K1):</b>
                <div style={{ fontSize: '12px', color: '#fff', marginTop: '4px' }}>
                  4 de 4 tareas objetivas registradas
                </div>
              </div>

              <div style={{ background: '#190d16', padding: '12px', borderRadius: '6px', border: '1px solid #331725' }}>
                <b style={{ color: 'var(--c-peach)', fontSize: '12px' }}>C. Trazabilidad (K2):</b>
                <div style={{ fontSize: '12px', color: '#fff', marginTop: '4px' }}>
                  Metadatos y preguntas de verificación completadas
                </div>
              </div>

              <div style={{ background: '#190d16', padding: '12px', borderRadius: '6px', border: '1px solid #331725' }}>
                <b style={{ color: 'var(--c-peach)', fontSize: '12px' }}>D. Comparación (K3):</b>
                <div style={{ fontSize: '12px', color: '#fff', marginTop: '4px' }}>
                  Contraste entre {(session.k3Responses.selectedCardIds || []).join(' y ')} ({session.k3Responses.differencesText?.length || 0} caracteres)
                </div>
              </div>

              <div style={{ background: '#190d16', padding: '12px', borderRadius: '6px', border: '1px solid #331725' }}>
                <b style={{ color: 'var(--c-peach)', fontSize: '12px' }}>E. Síntesis (K4):</b>
                <div style={{ fontSize: '12px', color: '#fff', marginTop: '4px' }}>
                  Síntesis y transferencia de {(session.k4Responses.selectedCardIds || []).join(', ')}
                </div>
              </div>
            </div>

            <div style={{ background: '#20101b', padding: '14px', borderRadius: '8px', border: '1px solid var(--c-copper)', marginBottom: '22px' }}>
              <b style={{ color: 'var(--c-peach)', fontSize: '13px' }}>⚡ Confirmación de Registro Local</b>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#fcebe6' }}>
                Al pulsar el botón a continuación, se calcularán las puntuaciones objetivas reproducibles y se habilitarán los botones de exportación a JSON y CSV con el identificador de sesión.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
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
            <h3 style={{ color: 'var(--c-peach)', margin: '0 0 8px 0' }}>¡Evaluación Científica Completada con Éxito!</h3>
            <p style={{ fontSize: '14px', color: '#fcebe6', maxWidth: '640px', margin: '0 auto 20px' }}>
              Gracias por tu tiempo y rigor académico. Tus respuestas han sido procesadas localmente con el identificador anónimo <b>{session.sessionId}</b>.
            </p>

            {/* Resumen de puntuaciones objetivas */}
            {session.objectiveScores && (
              <div style={{ background: '#190d16', padding: '18px', borderRadius: '8px', border: '1px solid #381827', maxWidth: '580px', margin: '0 auto 24px', textAlign: 'left' }}>
                <h4 style={{ color: 'var(--c-peach)', margin: '0 0 12px 0', fontSize: '14px', borderBottom: '1px solid #331725', paddingBottom: '6px' }}>
                  📊 Resumen de Puntuaciones Objetivas Obtenidas:
                </h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                  <span style={{ color: '#fff' }}>Comprensión Conceptual (K1):</span>
                  <b style={{ color: 'var(--c-peach)' }}>{session.objectiveScores.k1Score} / {session.objectiveScores.k1Max} pts</b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                  <span style={{ color: '#fff' }}>Trazabilidad y Verificación (K2):</span>
                  <b style={{ color: 'var(--c-peach)' }}>{session.objectiveScores.k2Score} / {session.objectiveScores.k2Max} pts</b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', borderTop: '1px dashed #3d1b2a', paddingTop: '8px' }}>
                  <span style={{ color: '#fff', fontWeight: 700 }}>Total Objetivo Replicable:</span>
                  <b style={{ color: '#4ade80', fontSize: '15px' }}>
                    {session.objectiveScores.totalObjectiveScore} / {session.objectiveScores.totalObjectiveMax} pts ({session.objectiveScores.percentage}%)
                  </b>
                </div>
                <p style={{ margin: '10px 0 0 0', fontSize: '11px', color: 'var(--c-rose)', fontStyle: 'italic' }}>
                  * Las justificaciones de comparación (K3) y síntesis (K4) se conservan íntegras en los archivos exportados para su evaluación por pares con la rúbrica de 7 criterios.
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
            <div className="glass-panel" style={{ maxWidth: '480px', padding: '24px', border: '1px solid var(--c-crimson)', background: '#1c0c16' }}>
              <h3 style={{ color: '#ff707a', margin: '0 0 10px 0' }}>⚠️ ¿Eliminar datos locales de la evaluación?</h3>
              <p style={{ fontSize: '13px', lineHeight: 1.5, color: '#fcebe6', margin: '0 0 18px 0' }}>
                Esta acción eliminará de forma irreversible las respuestas almacenadas localmente en este navegador para la sesión <b>{session.sessionId}</b>. Si deseas conservarlas, descárgalas en JSON o CSV antes de continuar.
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
