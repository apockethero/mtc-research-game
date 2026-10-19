/**
 * Game 2: La Matriz de Enfoques (Classification Matrix)
 * Permite clasificar cartas en categorías temáticas, metodologías o niveles de calidad.
 * Al atinar, dispara animación de validación y alimenta la tabla comparativa del estado del arte.
 */
class GameMatrix {
  constructor() {
    this.container = null;
    this.allCards = [];
    this.categories = [];
    this.criteria = "category"; // "category" | "methodology" | "quality"
    this.groups = {}; // { categoryKey: [cards] }
    this.activePool = [];
    this.score = 0;
  }

  init(cards, criteria = "category") {
    this.container = document.getElementById("matrixGameView");
    if (!this.container) return;

    this.allCards = [...cards];
    this.criteria = criteria;
    this.setupCategories();
    this.preparePool();
    this.render();
    this.bindEvents();
  }

  setupCategories() {
    this.groups = {};
    if (this.criteria === "methodology") {
      this.categories = [
        { id: "Simulación y Modelado", name: "Simulación y Modelado", desc: "Modelos dinámicos, simulación CAE, algoritmos y optimización.", icon: "💻" },
        { id: "Diseño y Prototipado", name: "Diseño y Prototipado", desc: "Diseño mecánico, prototipos funcionales y componentes físicos.", icon: "⚙️" },
        { id: "Pruebas Experimentales", name: "Pruebas Experimentales", desc: "Bancos de prueba, pruebas en ruta y mediciones empíricas.", icon: "🔬" },
        { id: "Estudios Empíricos y Políticas", name: "Estudios Empíricos y Políticas", desc: "Encuestas, análisis normativo, estudios de caso y adopción.", icon: "📊" }
      ];
    } else if (this.criteria === "quality") {
      this.categories = [
        { id: "Q1-Q2", name: "Núcleo de Alto Impacto (Q1/Q2)", desc: "Artículos en revistas de primer y segundo cuartil con alta visibilidad.", icon: "🏆" },
        { id: "Q3-Q4", name: "Impacto Moderado (Q3/Q4)", desc: "Artículos indexados en cuartiles 3 y 4 en consolidación.", icon: "📈" },
        { id: "Apoyo-NQ", name: "Actas y Fuentes Locales (NQ/Proc/Cap)", desc: "Proceedings, capítulos de libro y fuentes técnicas sin cuartil.", icon: "📁" }
      ];
    } else {
      // Default: Categorías temáticas del MTC o tema activo
      this.categories = [
        { id: "Estructura, ergonomía y seguridad", name: "Estructura, Ergonomía y Seguridad", desc: "Chasis, estabilidad de vuelco, dinámica de giro y ergonomía del usuario.", icon: "🛡️" },
        { id: "Propulsión, batería y energía", name: "Propulsión, Batería y Energía", desc: "Motores eléctricos, gestión térmica, soporte solar y dimensionamiento.", icon: "⚡" },
        { id: "Logística, producción y despliegue", name: "Logística y Despliegue", desc: "Reparto de última milla, talleres locales y operaciones de flota.", icon: "📦" },
        { id: "Accesibilidad y movilidad inclusiva", name: "Accesibilidad Inclusiva", desc: "Diseño adaptativo, usuarios mayores y movilidad para discapacidad.", icon: "♿" },
        { id: "Aceptación pública y servicio", name: "Aceptación Pública y Servicio", desc: "Percepción comunitaria, costo-beneficio y calidad de transporte.", icon: "👥" },
        { id: "Política, regulación y sociedad", name: "Política, Regulación y Sociedad", desc: "Marco legal de mototaxis, impacto en el tráfico y normas viales.", icon: "⚖️" }
      ];
    }

    this.categories.forEach(c => {
      this.groups[c.id] = [];
    });
  }

  preparePool() {
    // Tomar un mazo de juego de 15 cartas variadas para clasificar
    const shuffled = [...this.allCards].sort(() => Math.random() - 0.5);
    this.activePool = shuffled.slice(0, 15);
  }

  getCorrectCategoryId(card) {
    if (this.criteria === "methodology") {
      return card.methodClass || "Simulación y Modelado";
    }
    if (this.criteria === "quality") {
      if (card.quality === "Q1" || card.quality === "Q2") return "Q1-Q2";
      if (card.quality === "Q3" || card.quality === "Q4") return "Q3-Q4";
      return "Apoyo-NQ";
    }
    return card.categoryEs || card.category;
  }

  render() {
    if (!this.container) return;

    const remainingInPool = this.activePool.filter(c => {
      return !Object.values(this.groups).some(list => list.includes(c));
    });

    this.container.innerHTML = `
      <div class="game-wrapper">
        <div class="game-header-bar">
          <div>
            <div class="game-tag">DINÁMICA 2 · CLASIFICACIÓN Y VALIDACIÓN</div>
            <h2>La Matriz de Enfoques</h2>
            <p>Arrastra cada carta a su cuadrante metodológico o temático correcto. Al atinar, se disparará una validación y se enriquecerá la tabla comparativa de tu tesis.</p>
          </div>
          <div class="game-actions">
            <div class="score-pill">Puntaje Epistemológico: <b id="matrixScore">${this.score} pts</b></div>
            <button id="btnMatrixAuto" class="cyber-btn secondary-btn small-btn">Clasificar Todo (Demostración)</button>
            <button id="btnMatrixReset" class="cyber-btn secondary-btn small-btn">Reiniciar Matriz</button>
          </div>
        </div>

        <!-- Matriz de Cuadrantes / Zonas de Drop -->
        <div class="matrix-grid ${this.categories.length <= 4 ? 'cols-2' : 'cols-3'}">
          ${this.categories.map(cat => {
            const list = this.groups[cat.id] || [];
            return `
              <div class="matrix-zone" data-category-id="${cat.id}">
                <div class="zone-header">
                  <div class="zone-icon">${cat.icon}</div>
                  <div class="zone-title-box">
                    <h4>${cat.name}</h4>
                    <span class="zone-count">${list.length} artículos asignados</span>
                  </div>
                </div>
                <p class="zone-desc">${cat.desc}</p>
                <div class="zone-dropzone ${list.length > 0 ? 'has-cards' : ''}">
                  ${list.map(c => `
                    <div class="docked-card-pill" data-card-id="${c.id}" title="${c.title} - ${c.firstAuthor} et al.">
                      <span class="dock-badge">${c.id}</span>
                      <span class="dock-title">${c.title}</span>
                      <span class="dock-year">(${c.year})</span>
                    </div>
                  `).join('')}
                  ${list.length === 0 ? '<div class="empty-zone-hint">Arrastra aquí antecedentes afines</div>' : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Bandeja de cartas a clasificar -->
        <div class="matrix-pool-section">
          <div class="pool-title">
            <span>Bandeja de Antecedentes Pendientes (${remainingInPool.length} por ubicar):</span>
            <span class="pool-tip">💡 Revisa el título, metodología y aportes para inferir la categoría adecuada.</span>
          </div>

          <div class="matrix-cards-pool" id="matrixPool">
            ${remainingInPool.map(c => `
              <div class="matrix-draggable-card" draggable="true" data-card-id="${c.id}">
                <div class="m-card-badge">${c.id} · ${c.year}</div>
                <img src="${c.image}" class="m-card-thumb" onerror="this.src='card_redesign/card_back/mtc_card_back_art.png'">
                <div class="m-card-title">${c.title}</div>
                <div class="m-card-meta">${c.firstAuthor} et al. · <i>${c.methodology}</i></div>
              </div>
            `).join('')}
            ${remainingInPool.length === 0 ? '<div class="matrix-completed-msg">🎉 ¡Excelente! Todos los antecedentes han sido organizados en la matriz.</div>' : ''}
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    let draggedCardId = null;

    document.querySelectorAll(".matrix-draggable-card").forEach(el => {
      el.addEventListener("dragstart", (e) => {
        draggedCardId = el.dataset.cardId;
        e.dataTransfer.setData("text/plain", draggedCardId);
        el.classList.add("dragging");
        if (window.soundEngine) window.soundEngine.playFlip();
      });

      el.addEventListener("dragend", () => {
        el.classList.remove("dragging");
      });
    });

    document.querySelectorAll(".matrix-zone").forEach(zone => {
      zone.addEventListener("dragover", (e) => {
        e.preventDefault();
        zone.classList.add("drag-over");
      });

      zone.addEventListener("dragleave", () => {
        zone.classList.remove("drag-over");
      });

      zone.addEventListener("drop", (e) => {
        e.preventDefault();
        zone.classList.remove("drag-over");
        const cardId = e.dataTransfer.getData("text/plain") || draggedCardId;
        const targetCatId = zone.dataset.categoryId;
        this.attemptClassification(cardId, targetCatId, zone);
      });
    });

    document.getElementById("btnMatrixAuto")?.addEventListener("click", () => {
      this.autoClassifyAll();
    });

    document.getElementById("btnMatrixReset")?.addEventListener("click", () => {
      this.setupCategories();
      this.preparePool();
      this.score = 0;
      this.render();
      this.bindEvents();
      window.synthesisEngine.recordMatrixClassification(this.groups);
    });
  }

  attemptClassification(cardId, targetCatId, zoneElement) {
    const card = this.allCards.find(c => c.id === cardId);
    if (!card) return;

    const correctCatId = this.getCorrectCategoryId(card);

    if (correctCatId === targetCatId) {
      // Acierto
      if (!this.groups[targetCatId].includes(card)) {
        this.groups[targetCatId].push(card);
        this.score += 50;
      }

      zoneElement.classList.add("validate-success");
      setTimeout(() => zoneElement.classList.remove("validate-success"), 700);

      if (window.soundEngine) window.soundEngine.playSuccess();

      this.render();
      this.bindEvents();
      window.synthesisEngine.recordMatrixClassification(this.groups);
    } else {
      // Fallo
      zoneElement.classList.add("validate-error");
      setTimeout(() => zoneElement.classList.remove("validate-error"), 600);

      if (window.soundEngine) window.soundEngine.playError();
      alert(`⚠️ Desalineación de Enfoque:\n"${card.title}" pertenece a "${correctCatId}", no a "${targetCatId}".\nRevisa la metodología: ${card.methodology}.`);
    }
  }

  autoClassifyAll() {
    this.activePool.forEach(card => {
      const correctCat = this.getCorrectCategoryId(card);
      if (this.groups[correctCat] && !this.groups[correctCat].includes(card)) {
        this.groups[correctCat].push(card);
      }
    });
    this.score += 500;
    if (window.soundEngine) window.soundEngine.playVictory();
    this.render();
    this.bindEvents();
    window.synthesisEngine.recordMatrixClassification(this.groups);
  }
}

window.gameMatrix = new GameMatrix();
