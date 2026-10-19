/**
 * Wizard Module - Asistente Dinámico de Configuración en 3 Pasos
 * Permite que la herramienta funcione para el caso MTC o para cualquier disciplina científica.
 */
class WizardModule {
  constructor() {
    this.currentStep = 1;
    this.config = {
      topicId: "mtc-electric",
      topicName: "Mototriciclos Eléctricos y Movilidad Ligera (MTC)",
      question: "¿Cómo optimizar la estabilidad, la propulsión eficiente y la accesibilidad ergonómica en vehículos eléctricos de 3 ruedas para el transporte urbano y periurbano en el Sur Global?",
      field: "Ingeniería de Transporte & Electromovilidad",
      criteria: "category", // "category" | "methodology" | "quality"
      deckSource: "pilot" // "pilot" | "custom"
    };
    this.customCards = [];
  }

  init() {
    this.render();
    this.bindEvents();
  }

  show() {
    const modal = document.getElementById("wizardModal");
    if (modal) {
      modal.classList.add("active");
      this.goToStep(1);
    }
  }

  hide() {
    const modal = document.getElementById("wizardModal");
    if (modal) {
      modal.classList.remove("active");
    }
  }

  goToStep(step) {
    this.currentStep = step;
    document.querySelectorAll(".wizard-step-content").forEach((el, idx) => {
      el.classList.toggle("active", idx + 1 === step);
    });
    document.querySelectorAll(".wizard-step-indicator").forEach((el, idx) => {
      el.classList.toggle("active", idx + 1 === step);
      el.classList.toggle("completed", idx + 1 < step);
    });

    const prevBtn = document.getElementById("wizardPrevBtn");
    const nextBtn = document.getElementById("wizardNextBtn");
    const finishBtn = document.getElementById("wizardFinishBtn");

    if (prevBtn) prevBtn.style.display = step === 1 ? "none" : "inline-flex";
    if (nextBtn) nextBtn.style.display = step === 3 ? "none" : "inline-flex";
    if (finishBtn) finishBtn.style.display = step === 3 ? "inline-flex" : "none";
  }

  render() {
    const modal = document.getElementById("wizardModal");
    if (!modal) return;

    modal.innerHTML = `
      <div class="wizard-container glass-panel">
        <header class="wizard-header">
          <div class="wizard-badge">MTC RESEARCH GAME ENGINE</div>
          <h2>Configuración del Asistente de Investigación</h2>
          <p>Configura tu temática y mazo de antecedentes para construir un estado del arte riguroso y gamificado.</p>
          
          <div class="wizard-stepper">
            <div class="wizard-step-indicator active" data-step="1">
              <span class="step-num">1</span>
              <span class="step-label">Tópico y Pregunta</span>
            </div>
            <div class="wizard-line"></div>
            <div class="wizard-step-indicator" data-step="2">
              <span class="step-num">2</span>
              <span class="step-label">Criterios de Análisis</span>
            </div>
            <div class="wizard-line"></div>
            <div class="wizard-step-indicator" data-step="3">
              <span class="step-num">3</span>
              <span class="step-label">Ingesta del Mazo</span>
            </div>
          </div>
        </header>

        <div class="wizard-body">
          <!-- PASO 1 -->
          <div class="wizard-step-content active" id="step1">
            <div class="form-group">
              <label>Plantilla de Tópico Rápido:</label>
              <div class="topic-presets-grid" id="topicPresets">
                ${window.DEFAULT_TOPICS.map(t => `
                  <div class="preset-card ${t.id === this.config.topicId ? 'selected' : ''}" data-topic-id="${t.id}">
                    <div class="preset-field">${t.field}</div>
                    <h4>${t.name}</h4>
                    <p class="preset-q">${t.question}</p>
                  </div>
                `).join('')}
                <div class="preset-card ${this.config.topicId === 'custom' ? 'selected' : ''}" data-topic-id="custom">
                  <div class="preset-field">Personalizado</div>
                  <h4>Definir Mi Propio Tema</h4>
                  <p class="preset-q">Escribe tu propio problema de investigación, disciplina y categorías a medida.</p>
                </div>
              </div>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label for="inputTopicName">Nombre del Tema / Proyecto de Tesis:</label>
                <input type="text" id="inputTopicName" value="${this.config.topicName}" class="cyber-input" placeholder="Ej. Uso de IA en la gestión de inventarios">
              </div>
              <div class="form-group">
                <label for="inputField">Disciplina o Campo Académico:</label>
                <input type="text" id="inputField" value="${this.config.field}" class="cyber-input" placeholder="Ej. Ingeniería Industrial, Biomedicina, etc.">
              </div>
            </div>

            <div class="form-group">
              <label for="inputQuestion">Pregunta Central de Investigación o Problema Científico:</label>
              <textarea id="inputQuestion" rows="3" class="cyber-input" placeholder="¿Cuál es la interrogante o brecha central que tu investigación resolverá?">${this.config.question}</textarea>
            </div>
          </div>

          <!-- PASO 2 -->
          <div class="wizard-step-content" id="step2">
            <h3>Selecciona el Criterio de Clasificación de Antecedentes</h3>
            <p>Este criterio definirá los cuadrantes en "La Matriz de Enfoques" y los poderes analíticos de las cartas:</p>

            <div class="criteria-options-grid">
              <label class="criteria-card ${this.config.criteria === 'category' ? 'selected' : ''}">
                <input type="radio" name="criteriaOption" value="category" ${this.config.criteria === 'category' ? 'checked' : ''}>
                <div class="criteria-icon">📂</div>
                <h4>Por Categoría Temática del Dominio</h4>
                <p>Agrupa según los subsistemas del problema (ej. Estructura, Propulsión, Accesibilidad, Logística, Regulación).</p>
                <span class="criteria-badge">Recomendado para el caso MTC</span>
              </label>

              <label class="criteria-card ${this.config.criteria === 'methodology' ? 'selected' : ''}">
                <input type="radio" name="criteriaOption" value="methodology" ${this.config.criteria === 'methodology' ? 'checked' : ''}>
                <div class="criteria-icon">🔬</div>
                <h4>Por Enfoque Metodológico</h4>
                <p>Clasifica en: Simulación y Modelado, Diseño y Prototipado, Pruebas Experimentales o Estudios Empíricos.</p>
                <span class="criteria-badge">Universal para cualquier ciencia</span>
              </label>

              <label class="criteria-card ${this.config.criteria === 'quality' ? 'selected' : ''}">
                <input type="radio" name="criteriaOption" value="quality" ${this.config.criteria === 'quality' ? 'checked' : ''}>
                <div class="criteria-icon">⭐</div>
                <h4>Por Nivel de Rigor y Cuartil Scopus</h4>
                <p>Distingue entre fuentes de alto impacto (Q1/Q2), desarrollo intermedio (Q3/Q4) y fuentes grises/actas (NQ/Proc).</p>
                <span class="criteria-badge">Enfoque bibliométrico crítico</span>
              </label>
            </div>
          </div>

          <!-- PASO 3 -->
          <div class="wizard-step-content" id="step3">
            <h3>Ingesta y Carga del Mazo Inicial</h3>
            <p>Selecciona cómo alimentar el mazo de cartas de antecedentes:</p>

            <div class="deck-source-options">
              <label class="source-card ${this.config.deckSource === 'pilot' ? 'selected' : ''}">
                <input type="radio" name="deckSourceOption" value="pilot" ${this.config.deckSource === 'pilot' ? 'checked' : ''}>
                <div class="source-icon">🎴</div>
                <h4>Mazo Piloto MTC del Artículo Científico (49 Cartas)</h4>
                <p>Carga el mazo completo con 49 antecedentes reales, ilustraciones 3D, métricas Scopus/SJR, citas completas y limitaciones verificadas.</p>
                <span class="source-tag active">Listo para usar</span>
              </label>

              <label class="source-card ${this.config.deckSource === 'custom' ? 'selected' : ''}">
                <input type="radio" name="deckSourceOption" value="custom" ${this.config.deckSource === 'custom' ? 'checked' : ''}>
                <div class="source-icon">📤</div>
                <h4>Subir Artículos / Archivo Propio (JSON o BibTeX)</h4>
                <p>Sube tu propia base bibliográfica o define tus antecedentes personalizados para cualquier tema nuevo.</p>
                <span class="source-tag">Modular / Extensible</span>
              </label>
            </div>

            <div class="custom-deck-box" id="customDeckBox" style="display: ${this.config.deckSource === 'custom' ? 'block' : 'none'};">
              <h4>Importar Archivo JSON o CSV:</h4>
              <input type="file" id="customFileInput" accept=".json,.csv" class="cyber-input file-input">
              <p class="small-text">O agrega una carta manual rápida para tu tema:</p>
              <button type="button" id="openManualCardBtn" class="cyber-btn secondary-btn small-btn">+ Crear Carta Rápida Manual</button>
            </div>
          </div>
        </div>

        <footer class="wizard-footer">
          <button type="button" id="wizardPrevBtn" class="cyber-btn secondary-btn" style="display: none;">← Anterior</button>
          <div class="spacer"></div>
          <button type="button" id="wizardNextBtn" class="cyber-btn primary-btn">Siguiente →</button>
          <button type="button" id="wizardFinishBtn" class="cyber-btn success-btn" style="display: none;">¡Iniciar Aventura de Investigación! 🚀</button>
        </footer>
      </div>
    `;
  }

  bindEvents() {
    const modal = document.getElementById("wizardModal");
    if (!modal) return;

    // Presets click
    modal.addEventListener("click", (e) => {
      const presetCard = e.target.closest(".preset-card");
      if (presetCard) {
        modal.querySelectorAll(".preset-card").forEach(c => c.classList.remove("selected"));
        presetCard.classList.add("selected");
        const tid = presetCard.dataset.topicId;
        this.config.topicId = tid;

        if (tid === "custom") {
          document.getElementById("inputTopicName").value = "";
          document.getElementById("inputField").value = "";
          document.getElementById("inputQuestion").value = "";
        } else {
          const t = window.DEFAULT_TOPICS.find(item => item.id === tid);
          if (t) {
            document.getElementById("inputTopicName").value = t.name;
            document.getElementById("inputField").value = t.field;
            document.getElementById("inputQuestion").value = t.question;
            this.config.topicName = t.name;
            this.config.field = t.field;
            this.config.question = t.question;
          }
        }
      }

      // Criteria selection
      const critCard = e.target.closest(".criteria-card");
      if (critCard) {
        modal.querySelectorAll(".criteria-card").forEach(c => c.classList.remove("selected"));
        critCard.classList.add("selected");
        const radio = critCard.querySelector("input[name='criteriaOption']");
        if (radio) {
          radio.checked = true;
          this.config.criteria = radio.value;
        }
      }

      // Deck Source selection
      const sourceCard = e.target.closest(".source-card");
      if (sourceCard) {
        modal.querySelectorAll(".source-card").forEach(c => c.classList.remove("selected"));
        sourceCard.classList.add("selected");
        const radio = sourceCard.querySelector("input[name='deckSourceOption']");
        if (radio) {
          radio.checked = true;
          this.config.deckSource = radio.value;
          const box = document.getElementById("customDeckBox");
          if (box) box.style.display = radio.value === "custom" ? "block" : "none";
        }
      }
    });

    // Inputs change
    modal.addEventListener("input", (e) => {
      if (e.target.id === "inputTopicName") this.config.topicName = e.target.value;
      if (e.target.id === "inputField") this.config.field = e.target.value;
      if (e.target.id === "inputQuestion") this.config.question = e.target.value;
    });

    // Stepper buttons
    document.getElementById("wizardNextBtn")?.addEventListener("click", () => {
      if (this.currentStep < 3) this.goToStep(this.currentStep + 1);
    });

    document.getElementById("wizardPrevBtn")?.addEventListener("click", () => {
      if (this.currentStep > 1) this.goToStep(this.currentStep - 1);
    });

    document.getElementById("wizardFinishBtn")?.addEventListener("click", () => {
      this.finishWizard();
    });

    // Custom file upload listener
    document.getElementById("customFileInput")?.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file && file.name.endsWith(".json")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const parsed = JSON.parse(event.target.result);
            if (Array.isArray(parsed)) {
              this.customCards = parsed;
              alert(`¡Mazo personalizado cargado con éxito! (${parsed.length} cartas encontradas).`);
            }
          } catch (err) {
            alert("Error al leer el archivo JSON: formato inválido.");
          }
        };
        reader.readAsText(file);
      }
    });
  }

  finishWizard() {
    // Aplicar configuración a la app
    this.config.topicName = document.getElementById("inputTopicName")?.value || this.config.topicName;
    this.config.field = document.getElementById("inputField")?.value || this.config.field;
    this.config.question = document.getElementById("inputQuestion")?.value || this.config.question;

    window.synthesisEngine.setTopic({
      name: this.config.topicName,
      question: this.config.question,
      field: this.config.field
    });

    let activeDeck = window.MTC_CARDS_DATA;
    if (this.config.deckSource === "custom" && this.customCards.length > 0) {
      activeDeck = this.customCards;
    }

    if (window.appInstance) {
      window.appInstance.onConfigUpdated(this.config, activeDeck);
    }

    if (window.soundEngine) {
      window.soundEngine.playVictory();
    }

    this.hide();
  }
}

window.wizardModule = new WizardModule();
