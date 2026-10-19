import React, { useState } from 'react';
import { useSession } from '../../context/SessionContext';
import { DEFAULT_TOPICS } from '../../data/topics/defaultTopics';
import { MTC_CARDS_DATA } from '../../data/cards/mtcCardsData';
import { TopicConfig, Card } from '../../types/card';
import { ClassificationCriteria } from '../../types/session';
import { soundEngine } from '../../services/soundEngine';

export const WizardModal: React.FC = () => {
  const {
    isWizardOpen,
    setWizardOpen,
    topic,
    setTopic,
    criteria,
    setCriteria,
    setDeck
  } = useSession();

  const [step, setStep] = useState<number>(1);

  // Form states
  const [selectedTopicId, setSelectedTopicId] = useState<string>(topic.id);
  const [topicName, setTopicName] = useState<string>(topic.name);
  const [topicQuestion, setTopicQuestion] = useState<string>(topic.question);
  const [topicField, setTopicField] = useState<string>(topic.field);

  const [selectedCriteria, setSelectedCriteria] = useState<ClassificationCriteria>(criteria);
  const [deckSource, setDeckSource] = useState<'pilot' | 'custom'>('pilot');
  const [customJsonText, setCustomJsonText] = useState<string>('');

  if (!isWizardOpen) return null;

  const handleSelectPreset = (t: TopicConfig) => {
    soundEngine.playFlip();
    setSelectedTopicId(t.id);
    setTopicName(t.name);
    setTopicQuestion(t.question);
    setTopicField(t.field);
  };

  const handleSelectCustomTopic = () => {
    soundEngine.playFlip();
    setSelectedTopicId('custom');
    setTopicName('');
    setTopicQuestion('');
    setTopicField('');
  };

  const handleNext = () => {
    if (step === 1) {
      if (!topicName.trim() || !topicQuestion.trim()) {
        alert('Por favor define al menos el nombre del tópico y la pregunta de investigación central.');
        return;
      }
    }
    soundEngine.playDrop();
    setStep(prev => Math.min(prev + 1, 3));
  };

  const handlePrev = () => {
    soundEngine.playDrop();
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleFinish = () => {
    const finalTopic: TopicConfig = {
      id: selectedTopicId === 'custom' ? `custom-${Date.now()}` : selectedTopicId,
      name: topicName.trim(),
      question: topicQuestion.trim(),
      field: topicField.trim() || 'Multidisciplinar',
      defaultCategories: [
        'Modelado y Simulación',
        'Diseño y Prototipado',
        'Validación Experimental',
        'Políticas y Adopción'
      ],
      deckType: deckSource === 'pilot' ? 'mtc_pilot' : 'custom'
    };

    setTopic(finalTopic);
    setCriteria(selectedCriteria);

    if (deckSource === 'custom') {
      if (customJsonText.trim()) {
        try {
          const parsed = JSON.parse(customJsonText);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setDeck(parsed as Card[]);
          } else {
            alert('El JSON proporcionado debe ser un arreglo de cartas no vacío. Se conservará el mazo actual.');
          }
        } catch (e) {
          alert('Error al procesar el JSON personalizado. Se conservará el mazo actual.');
        }
      }
    } else {
      setDeck(MTC_CARDS_DATA);
    }

    soundEngine.playVictory();
    setWizardOpen(false);
  };

  return (
    <div
      className="modal-overlay"
      onClick={() => setWizardOpen(false)}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="wizard-container glass-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="wizard-header">
          <div className="wizard-badge">MTC RESEARCH GAME ENGINE</div>
          <h2>Configuración del Asistente de Investigación</h2>
          <p>
            Configura tu temática y mazo de antecedentes para construir un estado del arte riguroso y gamificado.
          </p>

          <div className="wizard-stepper">
            <div className={`wizard-step-indicator ${step === 1 ? 'active' : step > 1 ? 'completed' : ''}`}>
              <span className="step-num">1</span>
              <span className="step-label">Tópico y Pregunta</span>
            </div>
            <div className="wizard-line"></div>
            <div className={`wizard-step-indicator ${step === 2 ? 'active' : step > 2 ? 'completed' : ''}`}>
              <span className="step-num">2</span>
              <span className="step-label">Criterios de Análisis</span>
            </div>
            <div className="wizard-line"></div>
            <div className={`wizard-step-indicator ${step === 3 ? 'active' : ''}`}>
              <span className="step-num">3</span>
              <span className="step-label">Ingesta del Mazo</span>
            </div>
          </div>
        </header>

        <div className="wizard-body">
          {/* PASO 1: TÓPICO Y PREGUNTA */}
          {step === 1 && (
            <div className="wizard-step-content active">
              <div className="form-group">
                <label>Plantillas de Tópico Rápido:</label>
                <div className="topic-presets-grid">
                  {DEFAULT_TOPICS.map(t => (
                    <div
                      key={t.id}
                      className={`preset-card ${selectedTopicId === t.id ? 'selected' : ''}`}
                      onClick={() => handleSelectPreset(t)}
                    >
                      <div className="preset-field">{t.field}</div>
                      <h4>{t.name}</h4>
                      <p className="preset-q">{t.question}</p>
                    </div>
                  ))}

                  <div
                    className={`preset-card ${selectedTopicId === 'custom' ? 'selected' : ''}`}
                    onClick={handleSelectCustomTopic}
                  >
                    <div className="preset-field">Personalizado</div>
                    <h4>Nuevo Proyecto Propio</h4>
                    <p className="preset-q">Define un tema de tesis, disciplina y pregunta de investigación desde cero.</p>
                  </div>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="topicNameInput">Nombre del Tópico o Tesis:</label>
                  <input
                    id="topicNameInput"
                    type="text"
                    className="cyber-input"
                    value={topicName}
                    onChange={(e) => setTopicName(e.target.value)}
                    placeholder="Ej. Diseño y Dinámica de Vehículos Eléctricos Ligeros"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="topicFieldInput">Disciplina o Línea Académica:</label>
                  <input
                    id="topicFieldInput"
                    type="text"
                    className="cyber-input"
                    value={topicField}
                    onChange={(e) => setTopicField(e.target.value)}
                    placeholder="Ej. Ingeniería Mecánica & Transporte"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="topicQuestionInput">Pregunta de Investigación o Problema Central:</label>
                <textarea
                  id="topicQuestionInput"
                  className="cyber-textarea"
                  rows={3}
                  value={topicQuestion}
                  onChange={(e) => setTopicQuestion(e.target.value)}
                  placeholder="Formula aquí la pregunta medular que tu proyecto busca responder..."
                />
              </div>
            </div>
          )}

          {/* PASO 2: CRITERIOS DE ANÁLISIS */}
          {step === 2 && (
            <div className="wizard-step-content active">
              <div className="form-group">
                <label>Selecciona el Criterio Epistemológico para Clasificar y Agrupar Antecedentes:</label>
                <p style={{ fontSize: '12px', color: 'var(--c-rose)', marginBottom: '14px' }}>
                  Este criterio definirá los cuadrantes en la Matriz de Enfoques y los ejes de análisis de la tabla comparativa de tu marco teórico.
                </p>

                <div className="criteria-options-grid">
                  <div
                    className={`criteria-card ${selectedCriteria === 'category' ? 'selected' : ''}`}
                    onClick={() => {
                      soundEngine.playFlip();
                      setSelectedCriteria('category');
                    }}
                  >
                    <div className="preset-field">Enfoque Temático</div>
                    <h4>Categoría Temática / Subsistema</h4>
                    <p>Agrupa antecedentes por subsistemas técnicos (Chasis, Batería, Logística, Ergonomía, Políticas).</p>
                    <div className="criteria-badge">Ideal para marcos conceptuales multidisciplinares</div>
                  </div>

                  <div
                    className={`criteria-card ${selectedCriteria === 'methodology' ? 'selected' : ''}`}
                    onClick={() => {
                      soundEngine.playFlip();
                      setSelectedCriteria('methodology');
                    }}
                  >
                    <div className="preset-field">Rigor Metodológico</div>
                    <h4>Enfoque Metodológico</h4>
                    <p>Clasifica según el tipo de evidencia (Simulación, Prototipado, Ensayos Experimentales, Estudios Empíricos).</p>
                    <div className="criteria-badge">Recomendado para justificar la novedad del método</div>
                  </div>

                  <div
                    className={`criteria-card ${selectedCriteria === 'quality' ? 'selected' : ''}`}
                    onClick={() => {
                      soundEngine.playFlip();
                      setSelectedCriteria('quality');
                    }}
                  >
                    <div className="preset-field">Indicadores Bibliométricos</div>
                    <h4>Cuartil Scopus & Visibilidad</h4>
                    <p>Ordena las fuentes por impacto indexado (Q1/Q2 vs Q3/Q4 vs Proceedings y Fuentes Locales).</p>
                    <div className="criteria-badge">Excelente para revisiones sistemáticas PRISMA</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PASO 3: INGESTA DEL MAZO */}
          {step === 3 && (
            <div className="wizard-step-content active">
              <div className="form-group">
                <label>Selecciona el Origen de Datos para las Cartas:</label>
                <div className="deck-source-options">
                  <div
                    className={`source-card ${deckSource === 'pilot' ? 'selected' : ''}`}
                    onClick={() => {
                      soundEngine.playFlip();
                      setDeckSource('pilot');
                    }}
                  >
                    <div className="preset-field">Dataset Verificado</div>
                    <h4>Mazo Oficial MTC (49 Cartas)</h4>
                    <p>
                      Mazo piloto completo con trazabilidad Scopus/SCImago, DOIs y visuales de alta definición.
                    </p>
                    <div className="source-tag">49 Artículos · 2012–2025</div>
                  </div>

                  <div
                    className={`source-card ${deckSource === 'custom' ? 'selected' : ''}`}
                    onClick={() => {
                      soundEngine.playFlip();
                      setDeckSource('custom');
                    }}
                  >
                    <div className="preset-field">Ingesta de Datos Externa</div>
                    <h4>Cargar Dataset JSON Propio</h4>
                    <p>
                      Pega una colección JSON personalizada estructurada con atributos bibliográficos de tu disciplina.
                    </p>
                    <div className="source-tag">Estructura Abierta JSON</div>
                  </div>
                </div>
              </div>

              {deckSource === 'custom' && (
                <div className="form-group" style={{ marginTop: '16px' }}>
                  <label htmlFor="jsonTextArea">Pega aquí el contenido JSON de tus cartas:</label>
                  <textarea
                    id="jsonTextArea"
                    className="cyber-textarea"
                    rows={6}
                    value={customJsonText}
                    onChange={(e) => setCustomJsonText(e.target.value)}
                    placeholder='[ { "id": "ART01", "title": "...", "authors": "...", "year": 2024, ... } ]'
                  />
                  <small style={{ color: 'var(--c-rose)', display: 'block', marginTop: '6px' }}>
                    💡 Si dejas este campo vacío, se mantendrá el mazo cargado actualmente.
                  </small>
                </div>
              )}
            </div>
          )}
        </div>

        <footer className="wizard-footer">
          {step > 1 && (
            <button
              className="cyber-btn cyber-btn-outline"
              onClick={handlePrev}
            >
              ← Anterior
            </button>
          )}

          <div className="spacer"></div>

          {step < 3 ? (
            <button
              className="cyber-btn cyber-btn-primary"
              onClick={handleNext}
            >
              Siguiente →
            </button>
          ) : (
            <button
              className="cyber-btn cyber-btn-primary"
              onClick={handleFinish}
            >
              Finalizar y Aplicar Configuración 🚀
            </button>
          )}
        </footer>
      </div>
    </div>
  );
};
