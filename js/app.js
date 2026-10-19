/**
 * App Controller - Orquestador Central de MTC Research Game
 * Gestiona navegación entre dinámicas, HUD, modal 3D de cartas, buscador y exportador.
 */
class App {
  constructor() {
    this.activeTab = "deck";
    this.currentDeck = [];
    this.searchQuery = "";
    this.filterCategory = "all";
    this.filterQuartile = "all";
  }

  init() {
    this.currentDeck = [...window.MTC_CARDS_DATA];

    // Inicializar módulos
    window.wizardModule.init();
    window.synthesisEngine.onUpdate((report) => this.updateHUDStats(report));

    this.bindGlobalEvents();
    this.renderDeckView();
    this.switchTab("deck");
    this.updateHUD();

    console.log("MTC Research Game initialized with", this.currentDeck.length, "cards.");
  }

  onConfigUpdated(config, newDeck) {
    this.currentDeck = [...newDeck];
    this.updateHUD();
    this.renderDeckView();

    // Reinicializar juegos con el nuevo mazo y criterios
    window.gameTimeline.init(this.currentDeck);
    window.gameMatrix.init(this.currentDeck, config.criteria);
    window.gameGapHunter.init(this.currentDeck);
    window.gameCombat.init(this.currentDeck);

    this.switchTab("deck");
  }

  updateHUD() {
    const topic = window.synthesisEngine.topicInfo;
    const titleEl = document.getElementById("hudTopicTitle");
    const qEl = document.getElementById("hudQuestion");

    if (titleEl) titleEl.innerText = topic.name;
    if (qEl) qEl.innerText = topic.question;

    this.updateHUDStats(window.synthesisEngine.generateFullReport());
  }

  updateHUDStats(report) {
    const pill = document.getElementById("hudStatsPill");
    if (pill && report && report.stats) {
      pill.innerHTML = `
        <span>📚 Cartas: <b>${this.currentDeck.length}</b></span>
        <span>⏳ Cronología: <b>${report.stats.timelineCount}</b></span>
        <span>🎯 Clasificadas: <b>${report.stats.classifiedCount}</b></span>
        <span>⚡ Vacíos: <b>${report.stats.gapsCount}</b></span>
      `;
    }

    // Actualizar vista de redacción si está activa
    const previewEl = document.getElementById("synthesisLiveDraft");
    if (previewEl) {
      previewEl.innerHTML = this.renderSynthesisHTML(report);
    }
  }

  switchTab(tabId) {
    this.activeTab = tabId;

    document.querySelectorAll(".nav-tab").forEach(tab => {
      tab.classList.toggle("active", tab.dataset.tab === tabId);
    });

    document.querySelectorAll(".view-panel").forEach(panel => {
      panel.classList.toggle("active", panel.id === `${tabId}View`);
    });

    if (window.soundEngine) window.soundEngine.playFlip();

    // Lazy init de dinámicas al entrar
    if (tabId === "timeline") {
      window.gameTimeline.init(this.currentDeck);
    } else if (tabId === "matrix") {
      window.gameMatrix.init(this.currentDeck, window.wizardModule.config.criteria);
    } else if (tabId === "gaphunter") {
      window.gameGapHunter.init(this.currentDeck);
    } else if (tabId === "combat") {
      window.gameCombat.init(this.currentDeck);
    } else if (tabId === "synthesis") {
      this.updateHUDStats(window.synthesisEngine.generateFullReport());
    }
  }

  renderDeckView() {
    const grid = document.getElementById("cardsGrid");
    if (!grid) return;

    let filtered = this.currentDeck.filter(card => {
      const matchSearch = !this.searchQuery || 
        card.title.toLowerCase().includes(this.searchQuery) ||
        card.authors.toLowerCase().includes(this.searchQuery) ||
        card.contribution.toLowerCase().includes(this.searchQuery) ||
        card.id.toLowerCase().includes(this.searchQuery);

      const matchCat = this.filterCategory === "all" || 
        (card.categoryEs === this.filterCategory || card.category === this.filterCategory);

      const matchQ = this.filterQuartile === "all" || card.quality === this.filterQuartile;

      return matchSearch && matchCat && matchQ;
    });

    const countEl = document.getElementById("deckCountLabel");
    if (countEl) countEl.innerText = `${filtered.length} cartas de ${this.currentDeck.length}`;

    grid.innerHTML = filtered.map(c => `
      <div class="deck-card-container" data-card-id="${c.id}">
        <div class="card-3d-wrapper">
          <!-- ANVERSO -->
          <div class="card-face card-front">
            <div class="card-header-bar" style="background: ${c.categoryColor || '#1e293b'}">
              <span class="card-id-tag">${c.id}</span>
              <span class="card-quality-badge ${c.quality}">${c.quality || 'NQ'}</span>
              <span class="card-year-tag">${c.year}</span>
            </div>

            <div class="card-img-box">
              <img src="${c.image}" alt="${c.title}" onerror="this.src='card_redesign/card_back/mtc_card_back_art.png'">
              <div class="card-keyword-overlay">${c.keyword || c.id}</div>
            </div>

            <div class="card-body">
              <div class="card-category-lbl">${c.categoryEs || c.category}</div>
              <h3 class="card-title">${c.title}</h3>
              <div class="card-authors">${c.firstAuthor} et al.</div>

              <div class="card-indicators-strip">
                <div class="ind-item">
                  <span class="ind-lbl">SJR</span>
                  <b class="ind-val">${c.sjr ? parseFloat(c.sjr).toFixed(2) : '-'}</b>
                </div>
                <div class="ind-item">
                  <span class="ind-lbl">Citas</span>
                  <b class="ind-val">${c.citationCount || 0}</b>
                </div>
                <div class="ind-item">
                  <span class="ind-lbl">Scopus</span>
                  <b class="ind-val">${c.scopusIndexed === 'yes' ? 'Sí' : 'Ref'}</b>
                </div>
              </div>
            </div>

            <div class="card-flip-btn" title="Girar para ver reverso técnico">
              <span>Girar Reverso Técnico ⟳</span>
            </div>
          </div>

          <!-- REVERSO -->
          <div class="card-face card-back">
            <div class="card-header-bar back-hdr">
              <span class="card-id-tag">${c.id} · Reverso</span>
              <button class="inspect-btn-mini" data-card-id="${c.id}" title="Inspección detallada">🔍</button>
            </div>

            <div class="card-back-content">
              <div class="back-section">
                <span class="back-label">🔬 METODOLOGÍA / EVIDENCIA:</span>
                <p class="back-text">${c.methodology}</p>
              </div>

              <div class="back-section">
                <span class="back-label">💡 APORTE / HALLAZGO PRINCIPAL:</span>
                <p class="back-text">${c.contribution}</p>
              </div>

              <div class="back-section limit-box">
                <span class="back-label">⚠️ LIMITACIÓN / VACÍO DECORRENTE:</span>
                <p class="back-text limit-text">${c.limitation}</p>
              </div>

              <div class="back-meta-box">
                <div><b>Revista:</b> ${c.venue ? c.venue.slice(0, 36) + '...' : 'Fuente indexada'}</div>
                <div><b>DOI:</b> ${c.doi ? `<a href="${c.doi}" target="_blank" rel="noopener">Ver enlace ↗</a>` : 'No asignado'}</div>
              </div>
            </div>

            <div class="card-flip-btn" title="Volver al anverso visual">
              <span>Volver al Anverso ⟲</span>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }

  openCardInspector(cardId) {
    const card = this.currentDeck.find(c => c.id === cardId);
    if (!card) return;

    const modal = document.getElementById("cardInspectorModal");
    const body = document.getElementById("inspectorModalBody");
    if (!modal || !body) return;

    body.innerHTML = `
      <div class="inspector-layout">
        <div class="inspector-visual">
          <img src="${card.image}" alt="${card.title}" onerror="this.src='card_redesign/card_back/mtc_card_back_art.png'">
          <div class="inspector-badge-row">
            <span class="badge ${card.quality}">${card.quality || 'NQ'}</span>
            <span class="badge year">${card.year}</span>
            <span class="badge cat">${card.categoryEs || card.category}</span>
          </div>
          <button class="cyber-btn primary-btn full-width" onclick="window.soundEngine.playFlip(); document.querySelector('.inspector-flip-target').classList.toggle('flipped');">
            Voltear Tarjeta 3D ⟳
          </button>
        </div>

        <div class="inspector-details inspector-flip-target">
          <div class="inspector-face inspector-face-front">
            <h2>${card.title}</h2>
            <div class="meta-authors"><b>Autores:</b> ${card.authors}</div>
            <div class="meta-venue"><b>Publicación / Revista:</b> ${card.venue || 'No reportada'}</div>
            <div class="meta-doi"><b>DOI:</b> ${card.doi ? `<a href="${card.doi}" target="_blank" rel="noopener">${card.doi}</a>` : 'Sin registro DOI directo'}</div>

            <div class="data-block">
              <h4>Núcleo Conceptual & Contribución</h4>
              <p>${card.coreIdea}</p>
              <p><b>Aporte específico:</b> ${card.contribution}</p>
            </div>

            <div class="data-block limit-block">
              <h4>Limitación Crítica / Advertencia Epistemológica</h4>
              <p>${card.limitation}</p>
            </div>

            <div class="bibliometrics-grid">
              <div class="b-box"><span>Citas:</span><b>${card.citationCount || 0}</b></div>
              <div class="b-box"><span>Cuartil:</span><b>${card.quality || 'N/A'}</b></div>
              <div class="b-box"><span>SJR:</span><b>${card.sjr || 'Pendiente'}</b></div>
              <div class="b-box"><span>CiteScore:</span><b>${card.citeScore || 'N/A'}</b></div>
            </div>

            <div class="citation-copy-box">
              <p>${card.citation || `${card.authors} (${card.year}). ${card.title}.`}</p>
              <button class="cyber-btn secondary-btn small-btn" onclick="navigator.clipboard.writeText('${card.citation?.replace(/'/g, "\\'")}'); alert('¡Cita copiada al portapapeles!');">Copiar Cita APA</button>
            </div>
          </div>
        </div>
      </div>
    `;

    modal.classList.add("active");
    if (window.soundEngine) window.soundEngine.playFlip();
  }

  renderSynthesisHTML(report) {
    return `
      <article class="academic-paper-preview">
        <header class="paper-header">
          <div class="journal-tag">MTC STATE OF THE ART REVIEW · TESIS / MARCO TEÓRICO</div>
          <h1 class="paper-title">Estado del Arte: ${report.topic.name}</h1>
          <div class="paper-authors">Generado con Asistente Gamificado de Trazabilidad · Fecha: ${new Date().toLocaleDateString('es-ES')}</div>
          <div class="paper-problem">
            <b>Pregunta Central de Investigación:</b> <i>"${report.topic.question}"</i>
          </div>
        </header>

        <section class="paper-section">
          <h2>1. Introducción y Planteamiento del Problema</h2>
          <p>La delimitación del presente estado del arte responde a la necesidad de articular la evidencia científica dispersa sobre <b>${report.topic.name}</b> (${report.topic.field}), estableciendo una base rigurosa para fundamentar la interrogante de investigación y orientar el diseño metodológico de la tesis.</p>
        </section>

        <section class="paper-section">
          <h2>2. Evolución Cronológica de la Evidencia (Antecedentes)</h2>
          <p class="narrative-text">${report.historicalNarrative}</p>
        </section>

        <section class="paper-section">
          <h2>3. Matriz Comparativa Cruzada de Autores</h2>
          <div class="table-scroll-wrap">
            <table class="academic-table">
              <thead>
                <tr>
                  <th>Autor y Año</th>
                  <th>Categoría / Enfoque</th>
                  <th>Metodología</th>
                  <th>Aporte Principal</th>
                  <th>Limitación Declarada</th>
                  <th>Calidad</th>
                </tr>
              </thead>
              <tbody>
                ${window.synthesisEngine.getAllTrackedCards().map(c => `
                  <tr>
                    <td><b>${c.firstAuthor} et al. (${c.year})</b></td>
                    <td>${c.categoryEs || c.category}</td>
                    <td>${c.methodology}</td>
                    <td>${c.contribution}</td>
                    <td><i class="lim-text">${c.limitation}</i></td>
                    <td><span class="tbl-badge ${c.quality}">${c.quality || 'Ref'}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </section>

        <section class="paper-section">
          <h2>4. Identificación de Vacíos Críticos de Investigación (Research Gaps)</h2>
          <div class="gaps-container-synthesis">
            ${report.gapsNarrative.replace(/\n\n/g, '<br><br>')}
          </div>
        </section>

        <section class="paper-section">
          <h2>5. Conclusiones Metodológicas y Justificación de la Propuesta</h2>
          <p>${report.conclusions}</p>
        </section>
      </article>
    `;
  }

  bindGlobalEvents() {
    // Tabs
    document.querySelectorAll(".nav-tab").forEach(tab => {
      tab.addEventListener("click", () => {
        this.switchTab(tab.dataset.tab);
      });
    });

    // Abrir Wizard
    document.getElementById("btnOpenWizard")?.addEventListener("click", () => {
      window.wizardModule.show();
    });

    // Audio Toggle
    document.getElementById("btnToggleAudio")?.addEventListener("click", (e) => {
      const enabled = window.soundEngine.toggleSound();
      e.target.innerText = enabled ? "🔊 Sonido: ON" : "🔇 Sonido: OFF";
    });

    // Drawer de Síntesis en Vivo
    document.getElementById("btnToggleDrawer")?.addEventListener("click", () => {
      this.switchTab("synthesis");
    });

    // Filtros de cartas
    document.getElementById("deckSearchInput")?.addEventListener("input", (e) => {
      this.searchQuery = e.target.value.toLowerCase().trim();
      this.renderDeckView();
    });

    document.getElementById("deckCategoryFilter")?.addEventListener("change", (e) => {
      this.filterCategory = e.target.value;
      this.renderDeckView();
    });

    document.getElementById("deckQuartileFilter")?.addEventListener("change", (e) => {
      this.filterQuartile = e.target.value;
      this.renderDeckView();
    });

    // Flip en cartas del mazo
    document.getElementById("cardsGrid")?.addEventListener("click", (e) => {
      const flipBtn = e.target.closest(".card-flip-btn");
      if (flipBtn) {
        const cardBox = flipBtn.closest(".card-3d-wrapper");
        if (cardBox) cardBox.classList.toggle("flipped");
        if (window.soundEngine) window.soundEngine.playFlip();
        return;
      }

      const inspectBtn = e.target.closest(".inspect-btn-mini");
      if (inspectBtn) {
        this.openCardInspector(inspectBtn.dataset.cardId);
        return;
      }

      const cardContainer = e.target.closest(".deck-card-container");
      if (cardContainer && !e.target.closest("a")) {
        // Clic abre inspector si no fue flip
        this.openCardInspector(cardContainer.dataset.cardId);
      }
    });

    // Modal Inspector cerrar
    document.getElementById("closeInspectorBtn")?.addEventListener("click", () => {
      document.getElementById("cardInspectorModal")?.classList.remove("active");
    });

    // Botones de exportación
    document.getElementById("btnExportMd")?.addEventListener("click", () => {
      window.synthesisEngine.exportMarkdown();
    });

    document.getElementById("btnExportPdf")?.addEventListener("click", () => {
      window.print();
    });

    document.getElementById("btnExportBib")?.addEventListener("click", () => {
      window.synthesisEngine.exportBibTeX();
    });

    document.getElementById("btnExportJson")?.addEventListener("click", () => {
      window.synthesisEngine.exportJSON();
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.appInstance = new App();
  window.appInstance.init();
});
