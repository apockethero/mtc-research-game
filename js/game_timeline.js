/**
 * Game 1: El Puente de Cronología (Timeline Challenge)
 * Permite ordenar hitos temporalmente en una línea de tiempo interactiva.
 * Al acertar, conecta las cartas mediante un flujo evolutivo y redacta los antecedentes históricos.
 */
class GameTimeline {
  constructor() {
    this.container = null;
    this.poolCards = [];
    this.timelineSlots = [];
    this.selectedCards = [];
  }

  init(cards) {
    this.container = document.getElementById("timelineGameView");
    if (!this.container) return;

    // Tomar una muestra representativa con variedad de años (2012 a 2025)
    this.prepareSampleDeck(cards);
    this.render();
    this.bindEvents();
  }

  prepareSampleDeck(cards) {
    // Tomar cartas de diferentes años para crear una progresión cronológica interesante
    const sampleIds = ["MTC03", "MTC02", "MTC36", "MTC01", "MTC09", "MTC18", "MTC04", "MTC06", "MTC17"];
    let sample = cards.filter(c => sampleIds.includes(c.id));
    if (sample.length < 6) {
      sample = cards.slice(0, 8);
    }
    // Mezclar aleatoriamente el pool de cartas desordenadas
    this.poolCards = [...sample].sort(() => Math.random() - 0.5);
    this.timelineSlots = new Array(this.poolCards.length).fill(null);
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="game-wrapper">
        <div class="game-header-bar">
          <div>
            <div class="game-tag">DINÁMICA 1 · ORDENACIÓN TEMPORAL</div>
            <h2>El Puente de Cronología</h2>
            <p>Arrastra las cartas de la bandeja inferior hacia los hitos temporales para reconstruir la evolución tecnológica de <b>${window.synthesisEngine.topicInfo.name}</b>.</p>
          </div>
          <div class="game-actions">
            <button id="btnTimelineCheck" class="cyber-btn primary-btn">Validar Puente ⚡</button>
            <button id="btnTimelineAuto" class="cyber-btn secondary-btn small-btn">Ayuda Pedagógica (Auto-ordenar)</button>
            <button id="btnTimelineReset" class="cyber-btn secondary-btn small-btn">Reiniciar</button>
          </div>
        </div>

        <div class="timeline-bridge-wrapper">
          <div class="timeline-meta-track">
            <div class="track-label start">2012 · Inicios & Modelado</div>
            <div class="track-pulse"></div>
            <div class="track-label end">2025 · Validación & Frontera</div>
          </div>

          <!-- Pistas receptoras de la línea temporal -->
          <div class="timeline-slots-container" id="timelineSlots">
            ${this.timelineSlots.map((card, idx) => `
              <div class="timeline-slot" data-index="${idx}">
                <div class="slot-marker">Hito ${idx + 1}</div>
                <div class="slot-dropzone ${card ? 'filled' : 'empty'}">
                  ${card ? this.renderMiniCard(card) : '<span class="drop-hint">+ Arrastra una carta aquí</span>'}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Indicador de evolución y feedback -->
        <div id="timelineFeedback" class="timeline-feedback-banner" style="display: none;"></div>

        <!-- Bandeja de cartas mezcladas -->
        <div class="timeline-pool-section">
          <div class="pool-title">
            <span>Bandeja de Antecedentes Desordenados (${this.poolCards.filter(c => !this.timelineSlots.includes(c)).length} cartas disponibles):</span>
            <span class="pool-tip">💡 Haz clic o arrastra para situarlas en la cronología. Puedes voltear la carta para inspeccionar su metodología.</span>
          </div>

          <div class="timeline-cards-pool" id="timelinePool">
            ${this.poolCards.map(c => {
              const isPlaced = this.timelineSlots.includes(c);
              return `
                <div class="draggable-card-wrap ${isPlaced ? 'placed' : ''}" draggable="${!isPlaced}" data-card-id="${c.id}">
                  ${this.renderCardElement(c)}
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  }

  renderCardElement(card) {
    return `
      <div class="mtc-mini-card" data-id="${card.id}" style="--cat-color: ${card.categoryColor || '#2563eb'}">
        <div class="mini-card-inner">
          <div class="mini-card-front">
            <div class="mini-card-badge">${card.id} · ${card.quality || 'NQ'}</div>
            <div class="mini-card-year">${card.year}</div>
            <img src="${card.image}" alt="${card.title}" class="mini-card-img" onerror="this.src='card_redesign/card_back/mtc_card_back_art.png'">
            <div class="mini-card-title">${card.title}</div>
            <div class="mini-card-author">${card.firstAuthor} et al.</div>
            <div class="mini-card-cat">${card.categoryEs || card.category}</div>
            <div class="mini-flip-hint">Girar ⟳</div>
          </div>
          <div class="mini-card-back">
            <div class="back-hdr">Metodología & Vacío</div>
            <div class="back-field"><b>Método:</b> ${card.methodology}</div>
            <div class="back-field"><b>Aporte:</b> ${card.contribution}</div>
            <div class="back-field limit"><b>Vacío:</b> ${card.limitation}</div>
            <div class="mini-flip-hint">Volver ⟲</div>
          </div>
        </div>
      </div>
    `;
  }

  renderMiniCard(card) {
    return `
      <div class="placed-card-preview" data-id="${card.id}">
        <span class="placed-year">${card.year}</span>
        <img src="${card.image}" class="placed-thumb" onerror="this.src='card_redesign/card_back/mtc_card_back_art.png'">
        <div class="placed-info">
          <strong>${card.id}: ${card.firstAuthor} et al.</strong>
          <span>${card.title}</span>
        </div>
        <button class="remove-slot-btn" title="Quitar de este hito">×</button>
      </div>
    `;
  }

  bindEvents() {
    const slotsEl = document.getElementById("timelineSlots");
    const poolEl = document.getElementById("timelinePool");

    // Drag & Drop
    let draggedCardId = null;

    document.querySelectorAll(".draggable-card-wrap").forEach(wrap => {
      wrap.addEventListener("dragstart", (e) => {
        draggedCardId = wrap.dataset.cardId;
        e.dataTransfer.setData("text/plain", draggedCardId);
        wrap.classList.add("dragging");
        if (window.soundEngine) window.soundEngine.playFlip();
      });

      wrap.addEventListener("dragend", () => {
        wrap.classList.remove("dragging");
      });

      // Flip en clic
      wrap.addEventListener("click", (e) => {
        if (e.target.closest(".mini-flip-hint")) {
          const inner = wrap.querySelector(".mini-card-inner");
          if (inner) inner.classList.toggle("flipped");
          if (window.soundEngine) window.soundEngine.playFlip();
        }
      });
    });

    document.querySelectorAll(".timeline-slot").forEach(slot => {
      slot.addEventListener("dragover", (e) => {
        e.preventDefault();
        slot.classList.add("drag-over");
      });

      slot.addEventListener("dragleave", () => {
        slot.classList.remove("drag-over");
      });

      slot.addEventListener("drop", (e) => {
        e.preventDefault();
        slot.classList.remove("drag-over");
        const cardId = e.dataTransfer.getData("text/plain") || draggedCardId;
        const targetIdx = parseInt(slot.dataset.index, 10);
        this.placeCardInSlot(cardId, targetIdx);
      });
    });

    // Quitar carta de slot
    slotsEl?.addEventListener("click", (e) => {
      const rmBtn = e.target.closest(".remove-slot-btn");
      if (rmBtn) {
        const slotEl = rmBtn.closest(".timeline-slot");
        const idx = parseInt(slotEl.dataset.index, 10);
        this.timelineSlots[idx] = null;
        if (window.soundEngine) window.soundEngine.playDrop();
        this.render();
        this.bindEvents();
      }
    });

    // Botones de acción
    document.getElementById("btnTimelineCheck")?.addEventListener("click", () => {
      this.validateTimeline();
    });

    document.getElementById("btnTimelineAuto")?.addEventListener("click", () => {
      this.autoSortPedagogical();
    });

    document.getElementById("btnTimelineReset")?.addEventListener("click", () => {
      this.timelineSlots = new Array(this.poolCards.length).fill(null);
      this.render();
      this.bindEvents();
    });
  }

  placeCardInSlot(cardId, slotIndex) {
    const card = this.poolCards.find(c => c.id === cardId);
    if (!card) return;

    // Si ya estaba en otro slot, limpiarlo
    const prevIdx = this.timelineSlots.indexOf(card);
    if (prevIdx !== -1) {
      this.timelineSlots[prevIdx] = null;
    }

    this.timelineSlots[slotIndex] = card;
    if (window.soundEngine) window.soundEngine.playDrop();

    this.render();
    this.bindEvents();
    this.updateSynthesisDraft();
  }

  validateTimeline() {
    const filled = this.timelineSlots.filter(Boolean);
    if (filled.length < 3) {
      alert("Coloca al menos 3 cartas en la línea de tiempo antes de validar el puente.");
      return;
    }

    let isSorted = true;
    for (let i = 0; i < filled.length - 1; i++) {
      if (filled[i].year > filled[i + 1].year) {
        isSorted = false;
        break;
      }
    }

    const banner = document.getElementById("timelineFeedback");
    if (!banner) return;
    banner.style.display = "block";

    if (isSorted) {
      banner.className = "timeline-feedback-banner success";
      banner.innerHTML = `
        <div class="banner-title">🎉 ¡Puente de Cronología Validado con Éxito!</div>
        <p>Has ordenado temporalmente los hitos de investigación (${filled.map(c => c.year).join(" → ")}). La evolución metodológica ha sido transferida automáticamente al borrador del estado del arte.</p>
      `;
      if (window.soundEngine) window.soundEngine.playVictory();
      this.updateSynthesisDraft(true);
    } else {
      banner.className = "timeline-feedback-banner warning";
      banner.innerHTML = `
        <div class="banner-title">⚠️ Secuencia Temporal Desalineada</div>
        <p>Existen investigaciones situadas fuera de su orden de publicación cronológico. Revisa los años de cada hito (año de publicación visible en la tarjeta) o pulsa <b>"Ayuda Pedagógica"</b>.</p>
      `;
      if (window.soundEngine) window.soundEngine.playError();
    }
  }

  autoSortPedagogical() {
    // Ordenar de forma ascendente por año
    const sorted = [...this.poolCards].sort((a, b) => a.year - b.year);
    this.timelineSlots = sorted;
    if (window.soundEngine) window.soundEngine.playSuccess();
    this.render();
    this.bindEvents();
    this.validateTimeline();
  }

  updateSynthesisDraft(isFinal = false) {
    const placed = this.timelineSlots.filter(Boolean);
    window.synthesisEngine.recordTimelineOrder(placed);
  }
}

window.gameTimeline = new GameTimeline();
