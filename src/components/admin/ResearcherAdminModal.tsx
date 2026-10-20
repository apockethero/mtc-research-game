import React, { useState, useMemo } from 'react';
import {
  isCloudConfigured,
  fetchCloudEvaluations,
  calculateResearcherMetrics,
  exportConsolidatedCloudCSV,
  exportConsolidatedCloudJSON
} from '../../services/cloudSubmissionService';
import {
  ResearcherEvaluationRecord,
  ResearcherMetricsSummary
} from '../../types/cloudSubmission';

interface ResearcherAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResearcherAdminModal: React.FC<ResearcherAdminModalProps> = ({
  isOpen,
  onClose
}) => {
  const [authKey, setAuthKey] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [records, setRecords] = useState<ResearcherEvaluationRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<ResearcherEvaluationRecord | null>(null);

  const [filterMode, setFilterMode] = useState<'all' | 'guiado' | 'investigacion'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const cloudReady = isCloudConfigured();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authKey.trim()) {
      setErrorMsg('Por favor ingresa la clave de autorización del investigador.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    const res = await fetchCloudEvaluations(authKey.trim());
    setIsLoading(false);

    if (res.success && res.data) {
      setRecords(res.data);
      setIsAuthenticated(true);
    } else {
      setErrorMsg(res.error || 'Credenciales no autorizadas o error de conexión con Supabase.');
    }
  };

  const handleRefresh = async () => {
    if (!authKey) return;
    setIsLoading(true);
    const res = await fetchCloudEvaluations(authKey.trim());
    setIsLoading(false);
    if (res.success && res.data) {
      setRecords(res.data);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAuthKey('');
    setRecords([]);
    setSelectedRecord(null);
  };

  const metrics: ResearcherMetricsSummary = useMemo(() => {
    return calculateResearcherMetrics(records);
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchesMode = filterMode === 'all' || r.evaluation_mode === filterMode;
      const matchesSearch = !searchTerm ||
        r.session_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.client_submission_id.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesMode && matchesSearch;
    });
  }, [records, filterMode, searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div
        className="modal-box glass-panel"
        style={{
          width: '95%',
          maxWidth: '1000px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px',
          overflowY: 'auto'
        }}
      >
        {/* Encabezado */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--c-copper)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
              PANEL PRIVADO DE INVESTIGACIÓN
            </div>
            <h3 style={{ margin: '4px 0 0 0', color: 'var(--c-plum)' }}>
              Base de Datos Centralizada de Evaluaciones Científicas
            </h3>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {isAuthenticated && (
              <button
                className="cyber-btn cyber-btn-outline"
                style={{ fontSize: '11px', padding: '4px 10px' }}
                onClick={handleLogout}
              >
                Cerrar Sesión 🔒
              </button>
            )}
            <button
              className="modal-close-btn"
              onClick={onClose}
              style={{ fontSize: '20px', background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Estado no configurado */}
        {!cloudReady && (
          <div style={{ background: 'rgba(212, 120, 61, 0.1)', border: '1px solid var(--c-copper)', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
            <b style={{ color: 'var(--c-copper)', fontSize: '14px' }}>⚡ Backend Central No Conectado</b>
            <p style={{ margin: '6px 0 0 0', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
              Las variables de entorno de Supabase (<code>VITE_SUPABASE_URL</code> y <code>VITE_SUPABASE_ANON_KEY</code>) no han sido configuradas en este cliente. Consulta el archivo <code>docs/supabase_setup.md</code> para las instrucciones de despliegue.
            </p>
          </div>
        )}

        {/* Pantalla de Autenticación */}
        {!isAuthenticated ? (
          <div style={{ padding: '24px 12px', maxWidth: '520px', margin: '0 auto', width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '40px', marginBottom: '8px' }}>🔐</div>
              <h4 style={{ margin: 0, fontSize: '16px', color: 'var(--text-primary)' }}>
                Acceso Administrativo Restringido
              </h4>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '6px' }}>
                Este panel permite consultar y exportar las evaluaciones enviadas desde todos los dispositivos a PostgreSQL en Supabase.
              </p>
            </div>

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>
                  Clave de Autorización / Token Bearer de Investigador:
                </label>
                <input
                  type="password"
                  className="cyber-input"
                  placeholder="Introduce tu token o Service Key de Supabase..."
                  value={authKey}
                  onChange={(e) => setAuthKey(e.target.value)}
                  style={{ width: '100%' }}
                />
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>
                  * En producción se valida contra las políticas RLS de Supabase.
                </span>
              </div>

              {errorMsg && (
                <div style={{ background: 'rgba(184, 44, 57, 0.15)', border: '1px solid var(--c-crimson)', color: 'var(--c-crimson)', padding: '10px', borderRadius: '6px', fontSize: '12px' }}>
                  ⚠️ {errorMsg}
                </div>
              )}

              <button
                type="submit"
                className="cyber-btn cyber-btn-primary"
                disabled={isLoading}
                style={{ width: '100%', padding: '10px' }}
              >
                {isLoading ? 'Verificando credenciales...' : 'Ingresar al Panel de Datos 🚀'}
              </button>
            </form>
          </div>
        ) : (
          /* Pantalla del Panel de Investigador */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Tarjetas de Métricas */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              <div className="eval-stat-grid-item" style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Total Evaluaciones</span>
                <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--c-crimson)' }}>
                  {metrics.totalEvaluations}
                </div>
              </div>
              <div className="eval-stat-grid-item" style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Modo Guiado</span>
                <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--c-copper)' }}>
                  {metrics.guidedCount}
                </div>
              </div>
              <div className="eval-stat-grid-item" style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Modo Investigación</span>
                <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--c-plum)' }}>
                  {metrics.researchCount}
                </div>
              </div>
              <div className="eval-stat-grid-item" style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Puntaje Promedio</span>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#15803d' }}>
                  {metrics.averagePercentage}%
                </div>
              </div>
            </div>

            {/* Barra de Acciones y Exportación */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', background: 'rgba(0,0,0,0.03)', padding: '12px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  className="cyber-btn cyber-btn-primary"
                  onClick={() => exportConsolidatedCloudCSV(records)}
                  style={{ fontSize: '11.5px', padding: '6px 14px' }}
                >
                  📊 Exportar Todo a CSV ({records.length})
                </button>
                <button
                  className="cyber-btn cyber-btn-secondary"
                  onClick={() => exportConsolidatedCloudJSON(records)}
                  style={{ fontSize: '11.5px', padding: '6px 14px' }}
                >
                  📥 Exportar Todo a JSON ({records.length})
                </button>
                <button
                  className="cyber-btn cyber-btn-outline"
                  onClick={handleRefresh}
                  disabled={isLoading}
                  style={{ fontSize: '11.5px', padding: '6px 12px' }}
                >
                  {isLoading ? 'Actualizando...' : '🔄 Actualizar'}
                </button>
              </div>

              {/* Filtros */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <select
                  className="cyber-select"
                  value={filterMode}
                  onChange={(e) => setFilterMode(e.target.value as 'all' | 'guiado' | 'investigacion')}
                  style={{ fontSize: '12px', padding: '6px 10px' }}
                >
                  <option value="all">Todas las Modalidades</option>
                  <option value="guiado">Solo Modo Guiado</option>
                  <option value="investigacion">Solo Modo Investigación</option>
                </select>
                <input
                  type="text"
                  className="cyber-input"
                  placeholder="Buscar por ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: '140px', fontSize: '12px', padding: '6px 10px' }}
                />
              </div>
            </div>

            {/* Tabla de Evaluaciones */}
            <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(108, 55, 69, 0.1)', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '10px 12px' }}>Fecha Recepción</th>
                    <th style={{ padding: '10px 12px' }}>ID Sesión</th>
                    <th style={{ padding: '10px 12px' }}>Modalidad</th>
                    <th style={{ padding: '10px 12px' }}>Puntaje Replicable</th>
                    <th style={{ padding: '10px 12px' }}>Consentimiento</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No se encontraron evaluaciones registradas con los filtros actuales.
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((r) => (
                      <tr key={r.id} style={{ borderBottom: '1px solid rgba(108, 55, 69, 0.15)' }}>
                        <td style={{ padding: '8px 12px' }}>
                          {r.server_received_at ? new Date(r.server_received_at).toLocaleString('es-ES') : 'N/A'}
                        </td>
                        <td style={{ padding: '8px 12px', fontWeight: 700, color: 'var(--c-copper)' }}>
                          {r.session_id}
                        </td>
                        <td style={{ padding: '8px 12px' }}>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '10px',
                            fontSize: '11px',
                            fontWeight: 700,
                            background: r.evaluation_mode === 'guiado' ? 'rgba(212, 120, 61, 0.15)' : 'rgba(108, 55, 69, 0.15)',
                            color: r.evaluation_mode === 'guiado' ? 'var(--c-copper)' : 'var(--c-plum)'
                          }}>
                            {r.evaluation_mode === 'guiado' ? '🌟 Guiado' : '🔬 Investigación'}
                          </span>
                        </td>
                        <td style={{ padding: '8px 12px' }}>
                          {r.total_objective_score !== null ? (
                            <b style={{ color: '#15803d' }}>{r.total_objective_score} pts ({r.percentage}%)</b>
                          ) : (
                            <span style={{ color: 'var(--text-secondary)' }}>Pendiente</span>
                          )}
                        </td>
                        <td style={{ padding: '8px 12px' }}>
                          <span style={{ color: r.consent_given ? '#15803d' : 'var(--c-crimson)', fontWeight: 700 }}>
                            {r.consent_given ? '✓ Acreditado' : '✗ No otorgado'}
                          </span>
                        </td>
                        <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                          <button
                            className="cyber-btn cyber-btn-outline"
                            style={{ fontSize: '11px', padding: '3px 8px' }}
                            onClick={() => setSelectedRecord(r)}
                          >
                            Ver Detalle 🔍
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Modal de Detalle de Evaluación Individual */}
            {selectedRecord && (
              <div
                style={{
                  background: 'var(--surface-primary)',
                  border: '1.5px solid var(--c-copper)',
                  borderRadius: '10px',
                  padding: '18px',
                  marginTop: '12px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ margin: 0, color: 'var(--c-copper)', fontSize: '15px' }}>
                    Detalle de Evaluación: {selectedRecord.session_id}
                  </h4>
                  <button
                    className="cyber-btn cyber-btn-outline"
                    style={{ fontSize: '11px', padding: '3px 8px' }}
                    onClick={() => setSelectedRecord(null)}
                  >
                    Cerrar Detalle ✕
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', fontSize: '12px' }}>
                  <div style={{ background: 'rgba(0,0,0,0.02)', padding: '10px', borderRadius: '6px' }}>
                    <b>Perfil del Participante:</b>
                    <ul style={{ margin: '6px 0 0 16px', padding: 0 }}>
                      <li>Rol: {selectedRecord.participant_profile?.academicRole || 'N/A'}</li>
                      <li>Nivel: {selectedRecord.participant_profile?.educationLevel || 'N/A'}</li>
                      <li>Área: {selectedRecord.participant_profile?.disciplinaryArea || 'N/A'}</li>
                      <li>Dispositivo: {selectedRecord.participant_profile?.deviceType || 'N/A'}</li>
                    </ul>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.02)', padding: '10px', borderRadius: '6px' }}>
                    <b>Criterio K3 (Comparación Crítica):</b>
                    <div style={{ marginTop: '4px' }}>
                      <b>Cartas:</b> {(selectedRecord.k3_responses?.selectedCardIds || []).join(' y ')}
                    </div>
                    <div style={{ marginTop: '4px' }}>
                      <b>Diferencias:</b> {selectedRecord.k3_responses?.differencesText || '(No redactado)'}
                    </div>
                    <div style={{ marginTop: '4px' }}>
                      <b>Similitudes:</b> {selectedRecord.k3_responses?.similaritiesText || '(No redactado)'}
                    </div>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.02)', padding: '10px', borderRadius: '6px', gridColumn: '1 / -1' }}>
                    <b>Criterio K4 (Síntesis y Transferencia para No Especialistas):</b>
                    <div style={{ marginTop: '4px' }}>
                      <b>Cartas:</b> {(selectedRecord.k4_responses?.selectedCardIds || []).join(', ')}
                    </div>
                    <div style={{ marginTop: '4px' }}>
                      <b>Síntesis:</b> {selectedRecord.k4_responses?.synthesisText || '(No redactado)'}
                    </div>
                    <div style={{ marginTop: '4px' }}>
                      <b>Transferencia:</b> {selectedRecord.k4_responses?.transferExplanationText || '(No redactado)'}
                    </div>
                  </div>

                  {selectedRecord.qualitative_comments && Object.keys(selectedRecord.qualitative_comments).length > 0 && (
                    <div style={{ background: 'rgba(0,0,0,0.02)', padding: '10px', borderRadius: '6px', gridColumn: '1 / -1' }}>
                      <b>Comentarios y Sugerencias Abiertas:</b>
                      <div style={{ marginTop: '4px' }}>
                        <b>Qué ayudó más:</b> {selectedRecord.qualitative_comments.whatHelpedMost || 'N/A'}
                      </div>
                      <div style={{ marginTop: '4px' }}>
                        <b>Qué causó confusión:</b> {selectedRecord.qualitative_comments.whatWasConfusing || 'N/A'}
                      </div>
                      <div style={{ marginTop: '4px' }}>
                        <b>Información faltante:</b> {selectedRecord.qualitative_comments.missingInformationInCards || 'N/A'}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
