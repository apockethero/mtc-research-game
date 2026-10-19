/**
 * Game 4: Combates de Validación (Novedad vs Redundancia)
 * Ring de contraste académico donde el usuario enfrenta dos antecedentes
 * para discernir si un artículo aporta novedad metodológica, complementariedad o redundancia.
 */
class GameCombat {
  constructor() {
    this.container = null;
    this.allCards = [];
    this.cardA = null;
    this.cardB = null;
    this.combatsHistory = [];
  }

  init(cards) {
    this.container = document.getElementById("combatGameView");
    if (!this.container) return;

    this.allCards = [...cards];
    // Default cards
    this.cardA = this.allCards.find(c => c.id === "MTC22") || this.allCards[0];
    this.cardB = this.allCards.find(c => c.id === "MTC23") || this.allCards[1];

    this.render();
    this.bindEvents();
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="game-wrapper">
        <div class="game-header-bar">
          <div>
            <div class="game-tag">DINÁMICA 4 · EVALUACIÓN CRÍTICA</div>
            <h2>Combates de Validación: Novedad vs. Redundancia</h2>
            <p>Enfrenta dos investigaciones para determinar si la propuesta desafiante representa un <b>Hito Novedoso</b>, una <b>Extensión Complementaria</b> o una <b>Reiteración Redundante</b>.</p>
          </div>
          <div class="game-actions">
            <button id="btnRandomCombat" class="cyber-btn secondary-btn small-btn">Duelo Aleatorio 🎲</button>
          </div>
        </div>

        <div class="combat-arena">
          <!-- Esquina Azul: Hito Establecido -->
          <div class="fighter-corner corner-a glass-panel">
            <div class="corner-label">🔵 Antecedente Referencial (Hito Base)</div>
            <div class="fighter-select-row">
              <label>Seleccionar:</label>
              <select id="selectCardA" class="cyber-select">
                ${this.allCards.map(c => `
                  <option value="${c.id}" ${this.cardA && c.id === this.cardA.id ? 'selected' : ''}>
                    ${c.id}: ${c.firstAuthor} (${c.year}) - ${c.title.slice(0, 30)}...
                  </option>
                `).join('')}
              </select>
            </div>

            <div class="fighter-card" id="fighterCardA">
              ${this.renderFighterDetails(this.cardA)}
            </div>
          </div>

          <!-- Centro: Duelo de Veredicto -->
          <div class="combat-versus-panel">
            <div class="vs-badge">VS</div>
            <div class="overlap-gauge">
              <span>Solapamiento Conceptual:</span>
              <div class="gauge-bar"><div class="gauge-fill" style="width: ${this.computeOverlapPercent()}%"></div></div>
              <small>${this.computeOverlapPercent()}% de conceptos coincidentes</small>
            </div>

            <div class="verdict-actions">
              <button class="cyber-btn verdict-btn hito" data-verdict="hito">
                🏆 Hito Novedoso
                <small>Aporta avance metodológico no cubierto</small>
              </button>
              <button class="cyber-btn verdict-btn comp" data-verdict="complementaria">
                🔗 Extensión Complementaria
                <small>Resuelve una limitación del hito base</small>
              </button>
              <button class="cyber-btn verdict-btn redun" data-verdict="redundante">
                ⚠️ Evidencia Redundante
                <small>Reitera hallazgos sin aporte sustancial</small>
              </button>
            </div>

            <div id="combatFeedback" class="combat-feedback" style="display: none;"></div>
          </div>

          <!-- Esquina Roja: Desafiante -->
          <div class="fighter-corner corner-b glass-panel">
            <div class="corner-label">🔴 Antecedente Desafiante (Nueva Evidencia)</div>
            <div class="fighter-select-row">
              <label>Seleccionar:</label>
              <select id="selectCardB" class="cyber-select">
                ${this.allCards.map(c => `
                  <option value="${c.id}" ${this.cardB && c.id === this.cardB.id ? 'selected' : ''}>
                    ${c.id}: ${c.firstAuthor} (${c.year}) - ${c.title.slice(0, 30)}...
                  </option>
                `).join('')}
              </select>
            </div>

            <div class="fighter-card" id="fighterCardB">
              ${this.renderFighterDetails(this.cardB)}
            </div>
          </div>
        </div>

        <!-- Historial de combates y deducciones críticas -->
        <div class="combat-history-section glass-panel">
          <h3>Veredictos Críticos Registrados (${this.combatsHistory.length})</h3>
          <div class="history-grid" id="combatHistoryGrid">
            ${this.renderHistory()}
          </div>
        </div>
      </div>
    `;
  }

  renderFighterDetails(card) {
    if (!card) return '<p>Sin carta seleccionada</p>';

    return `
      <div class="f-header">
        <span class="f-id">${card.id} · ${card.year}</span>
        <span class="f-quality">${card.quality || 'NQ'} · ${card.venueHIndex ? 'H:' + card.venueHIndex : 'Indexado'}</span>
      </div>
      <img src="${card.image}" class="f-img" onerror="this.src='card_redesign/card_back/mtc_card_back_art.png'">
      <h4 class="f-title">${card.title}</h4>
      <div class="f-author">${card.firstAuthor} et al. (${card.venue || 'Publicación'})</div>
      
      <div class="f-specs">
        <div class="f-spec-row">
          <span class="f-lbl">Metodología:</span>
          <span class="f-val">${card.methodology}</span>
        </div>
        <div class="f-spec-row">
          <span class="f-lbl">Aporte Clave:</span>
          <span class="f-val">${card.contribution}</span>
        </div>
        <div class="f-spec-row limit">
          <span class="f-lbl">Limitación:</span>
          <span class="f-val">${card.limitation}</span>
        </div>
      </div>
    `;
  }

  renderHistory() {
    if (this.combatsHistory.length === 0) {
      return '<p class="empty-hist">Aún no has emitido veredictos en el ring. Evalúa el primer enfrentamiento arriba.</p>';
    }

    return this.combatsHistory.map(h => `
      <div class="history-item-card ${h.verdict}">
        <div class="h-badge">${h.verdictLabel}</div>
        <div class="h-title"><b>${h.cardB.id}</b> vs <b>${h.cardA.id}</b></div>
        <p class="h-reason">${h.analysis}</p>
      </div>
    `).join('');
  }

  computeOverlapPercent() {
    if (!this.cardA || !this.cardB) return 50;
    // Si pertenecen a la misma categoría, alto solapamiento
    let overlap = 30;
    if (this.cardA.category === this.cardB.category) overlap += 40;
    if (this.cardA.methodClass === this.cardB.methodClass) overlap += 20;
    return Math.min(overlap, 95);
  }

  bindEvents() {
    document.getElementById("selectCardA")?.addEventListener("change", (e) => {
      this.cardA = this.allCards.find(c => c.id === e.target.value);
      this.render();
      this.bindEvents();
    });

    document.getElementById("selectCardB")?.addEventListener("change", (e) => {
      this.cardB = this.allCards.find(c => c.id === e.target.value);
      this.render();
      this.bindEvents();
    });

    document.getElementById("btnRandomCombat")?.addEventListener("click", () => {
      const idxA = Math.floor(Math.random() * this.allCards.length);
      let idxB = Math.floor(Math.random() * this.allCards.length);
      while (idxB === idxA) idxB = Math.floor(Math.random() * this.allCards.length);
      this.cardA = this.allCards[idxA];
      this.cardB = this.allCards[idxB];
      if (window.soundEngine) window.soundEngine.playFlip();
      this.render();
      this.bindEvents();
    });

    document.querySelectorAll(".verdict-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const verdict = btn.dataset.verdict;
        this.processVerdict(verdict);
      });
    });
  }

  processVerdict(verdict) {
    if (!this.cardA || !this.cardB) return;

    let verdictLabel = "Hito Novedoso";
    let analysis = "";

    if (verdict === "hito") {
      verdictLabel = "🏆 Hito Metodológico";
      analysis = `${this.cardB.firstAuthor} et al. (${this.cardB.year}) introduce ${this.cardB.contribution.toLowerCase()}, superando el marco inicial de ${this.cardA.firstAuthor} (${this.cardA.year}).`;
      if (window.soundEngine) window.soundEngine.playVictory();
    } else if (verdict === "complementaria") {
      verdictLabel = "🔗 Extensión Complementaria";
      analysis = `${this.cardB.firstAuthor} (${this.cardB.year}) complementa la limitación de ${this.cardA.firstAuthor} (${this.cardA.limitation.toLowerCase()}) mediante ${this.cardB.methodology.toLowerCase()}.`;
      if (window.soundEngine) window.soundEngine.playSuccess();
    } else {
      verdictLabel = "⚠️ Evidencia Redundante";
      analysis = `La evidencia aportada por ${this.cardB.firstAuthor} (${this.cardB.year}) se solapa significativamente con ${this.cardA.firstAuthor} (${this.cardA.year}) sin ofrecer una variación metodológica sustantiva.`;
      if (window.soundEngine) window.soundEngine.playDrop();
    }

    const record = {
      cardA: this.cardA,
      cardB: this.cardB,
      verdict,
      verdictLabel,
      analysis,
      timestamp: new Date().toLocaleTimeString()
    };

    this.combatsHistory.unshift(record);
    window.synthesisEngine.recordCombat(record);

    const feedback = document.getElementById("combatFeedback");
    if (feedback) {
      feedback.style.display = "block";
      feedback.className = `combat-feedback ${verdict}`;
      feedback.innerHTML = `
        <strong>${verdictLabel} Registrado</strong>
        <p>${analysis}</p>
      `;
    }

    const histGrid = document.getElementById("combatHistoryGrid");
    if (histGrid) histGrid.innerHTML = this.renderHistory();
  }
}

window.gameCombat = new GameCombat();
