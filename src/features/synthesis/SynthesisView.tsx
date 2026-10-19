import React from 'react';
import { useSession } from '../../context/SessionContext';
import {
  exportMarkdown,
  exportBibTeX,
  exportJSON,
  exportCSV,
  printThesisPDF
} from '../../services/exportService';
import { soundEngine } from '../../services/soundEngine';

export const SynthesisView: React.FC = () => {
  const {
    topic,
    report,
    allTrackedCards,
    discoveredGaps,
    combats,
    criteria,
    deck,
    timelineCards,
    matrixGroups
  } = useSession();

  const handleExportMd = () => {
    soundEngine.playSuccess();
    exportMarkdown(report, allTrackedCards);
  };

  const handleExportBib = () => {
    soundEngine.playSuccess();
    exportBibTeX(allTrackedCards);
  };

  const handleExportJson = () => {
    soundEngine.playSuccess();
    const sessionDump = {
      timestamp: new Date().toISOString(),
      topic,
      criteria,
      deckCount: deck.length,
      timelineCards,
      matrixGroups,
      discoveredGaps,
      combats,
      stats: report.stats
    };
    exportJSON(sessionDump);
  };

  const handleExportCsv = () => {
    soundEngine.playSuccess();
    exportCSV(allTrackedCards.length > 0 ? allTrackedCards : deck);
  };

  const handlePrint = () => {
    soundEngine.playSuccess();
    printThesisPDF();
  };

  return (
    <div className="view-panel active">
      <div className="synthesis-layout">
        {/* BARRA DE HERRAMIENTAS Y EXPORTACIÓN */}
        <div className="synthesis-toolbar">
          <div>
            <span className="synthesis-tag">
              OUTPUT ACADÉMICO EN TIEMPO REAL
            </span>
            <h3 className="synthesis-title">
              Borrador Estructurado del Estado del Arte
            </h3>
            <span className="synthesis-subtitle">
              Sintetizado a partir de <b>{report.stats.totalUniqueCards}</b> antecedentes trabajados en los minijuegos
            </span>
          </div>

          <div className="synthesis-actions">
            <button
              className="cyber-btn cyber-btn-secondary"
              onClick={handleExportMd}
              title="Descargar documento completo en formato Markdown (.md)"
            >
              📥 Markdown (.md)
            </button>
            <button
              className="cyber-btn cyber-btn-secondary"
              onClick={handleExportBib}
              title="Exportar archivo de referencias BibTeX (.bib)"
            >
              📥 BibTeX (.bib)
            </button>
            <button
              className="cyber-btn cyber-btn-secondary"
              onClick={handleExportCsv}
              title="Descargar matriz de antecedentes tabulada en CSV (.csv)"
            >
              📥 Matriz CSV (.csv)
            </button>
            <button
              className="cyber-btn cyber-btn-outline"
              onClick={handleExportJson}
              title="Exportar copia de seguridad en JSON (.json)"
            >
              📥 JSON (.json)
            </button>
            <button
              className="cyber-btn cyber-btn-primary"
              onClick={handlePrint}
              title="Imprimir documento o exportar a PDF"
            >
              🖨️ Imprimir / Guardar en PDF
            </button>
          </div>
        </div>

        {/* VISTA PREVIA FORMATO PAPER CIENTÍFICO */}
        <div className="academic-paper-preview">
          <header className="paper-header">
            <div className="journal-tag">
              MANUSCRITO PRELIMINAR · ESTADO DEL ARTE Y REVISIÓN SISTEMÁTICA
            </div>
            <h1 className="paper-title">
              Estado del Arte y Marco de Antecedentes: {topic.name}
            </h1>
            <div className="paper-authors">
              <b>Línea Disciplinar:</b> {topic.field} &nbsp;|&nbsp;
              <b>Fecha de Generación:</b> {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div className="paper-problem">
              <b>Pregunta Central de Investigación:</b>
              <div style={{ marginTop: '4px', fontStyle: 'italic' }}>
                "{topic.question}"
              </div>
            </div>
          </header>

          {/* SECCIÓN 1: INTRODUCCIÓN */}
          <section className="paper-section">
            <h2>1. Introducción y Problema de Investigación</h2>
            <p className="narrative-text">
              La consolidación de un marco teórico riguroso exige sistematizar la literatura previa identificando tanto los consensos metodológicos como las fronteras no resueltas. El presente documento sintetiza la evidencia disponible sobre <b>{topic.name}</b> a fin de fundamentar la necesidad de la investigación actual orientada a responder la interrogante central: <i>"{topic.question}"</i>.
            </p>
          </section>

          {/* SECCIÓN 2: EVOLUCIÓN HISTÓRICA */}
          <section className="paper-section">
            <h2>2. Evolución Cronológica de la Evidencia (Antecedentes Históricos)</h2>
            <p className="narrative-text">
              {report.historicalNarrative}
            </p>
          </section>

          {/* SECCIÓN 3: MATRIZ COMPARATIVA */}
          <section className="paper-section">
            <h2>3. Matriz Comparativa de Investigaciones Previas</h2>
            <p style={{ fontSize: '13px', color: '#553642', marginBottom: '12px' }}>
              La siguiente tabla compendia los antecedentes analizados, contrastando sus enfoques metodológicos, aportes verificados y limitaciones declaradas:
            </p>

            <div className="table-scroll-wrap">
              <table className="academic-table">
                <thead>
                  <tr>
                    <th style={{ width: '18%' }}>Autor(es) y Año</th>
                    <th style={{ width: '18%' }}>Categoría / Enfoque</th>
                    <th style={{ width: '18%' }}>Metodología / Evidencia</th>
                    <th style={{ width: '22%' }}>Hallazgo / Aporte Principal</th>
                    <th style={{ width: '24%' }}>Limitación / Vacío Declarado</th>
                  </tr>
                </thead>
                <tbody>
                  {allTrackedCards.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '16px', color: '#888' }}>
                        <i>(Juega en el Puente de Cronología, la Matriz de Enfoques o Cazadores de Vacíos para poblar automáticamente esta tabla con tus antecedentes seleccionados).</i>
                      </td>
                    </tr>
                  ) : (
                    allTrackedCards.map(c => (
                      <tr key={c.id}>
                        <td>
                          <b>{c.firstAuthor} et al. ({c.year})</b>
                          <div style={{ fontSize: '10px', color: '#8b5a68' }}>
                            <span className={`tbl-badge ${c.quality}`}>{c.quality || 'VERIF'}</span> {c.id}
                          </div>
                        </td>
                        <td>{c.categoryEs || c.category}</td>
                        <td>{c.methodClass || c.methodology}</td>
                        <td>{c.contribution || c.coreIdea}</td>
                        <td style={{ fontStyle: 'italic', color: '#7a2232' }}>{c.limitation}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* SECCIÓN 4: VACÍOS DE INVESTIGACIÓN */}
          <section className="paper-section">
            <h2>4. Identificación de Vacíos Críticos de Investigación (Research Gaps)</h2>
            {discoveredGaps.length === 0 ? (
              <p className="narrative-text">
                <i>*(Aún no se han generado haces en "Cazadores de Vacíos". Conecta antecedentes en la constelación para proyectar rayos digitales que extraigan los vacíos complementarios que justifican tu proyecto).*</i>
              </p>
            ) : (
              <div>
                <p className="narrative-text" style={{ marginBottom: '16px' }}>
                  A partir del análisis relacional de limitaciones y la proyección de haces digitales de tensión teórica, se han formalizado <b>{discoveredGaps.length} vacíos esenciales</b> en la frontera del conocimiento:
                </p>

                {discoveredGaps.map((gap, idx) => (
                  <div
                    key={gap.id || idx}
                    style={{
                      marginBottom: '16px',
                      padding: '14px',
                      background: '#fff9f7',
                      borderLeft: '4px solid var(--c-copper)',
                      borderRadius: '4px'
                    }}
                  >
                    <h3 style={{ fontSize: '15px', color: 'var(--c-crimson)', marginBottom: '4px' }}>
                      Vacío #{idx + 1}: {gap.title}
                    </h3>
                    <div style={{ fontSize: '12px', color: '#684551', marginBottom: '6px' }}>
                      <b>Artículos en Tensión:</b> {gap.cards.map(c => `${c.firstAuthor} et al. (${c.year}) [${c.id}]`).join(', ')}
                    </div>
                    <p style={{ fontSize: '13px', margin: '4px 0', color: '#2b1b22' }}>
                      <b>Brecha Observada:</b> {gap.description}
                    </p>
                    <p style={{ fontSize: '13px', margin: '4px 0', color: '#9c381c' }}>
                      <b>Justificación para la Propuesta:</b> {gap.justification}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* SECCIÓN 5: CONCLUSIONES */}
          <section className="paper-section">
            <h2>5. Conclusiones Metodológicas y Justificación de la Propuesta</h2>
            <p className="narrative-text">
              {report.conclusions}
            </p>
          </section>

          {/* SECCIÓN 6: REFERENCIAS BIBLIOGRÁFICAS */}
          <section className="paper-section">
            <h2>Referencias Bibliográficas Analizadas</h2>
            <div style={{ fontSize: '12px', lineHeight: 1.6 }}>
              {(allTrackedCards.length > 0 ? allTrackedCards : deck.slice(0, 10)).map(c => (
                <div key={c.id} style={{ marginBottom: '8px', paddingLeft: '24px', textIndent: '-24px' }}>
                  {c.citation || `${c.authors} (${c.year}). ${c.title}. ${c.venue || 'MTC Journal'}. ${c.doi || ''}`}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
