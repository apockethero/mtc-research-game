/**
 * Game 3: Cazadores de Vacíos (Digital Beam Gap Hunter)
 * Lienzo de constelación donde el usuario conecta 2 o 3 cartas mediante un haz digital luminoso.
 * El algoritmo calcula la intersección de sus limitaciones y revela vacíos de investigación (Research Gaps).
 */
class GameGapHunter {
  constructor() {
    this.container = null;
    this.allCards = [];
    this.selectedCards = [];
    this.discoveredGaps = [];
    this.canvas = null;
    this.ctx = null;
    this.animFrameId = null;
    this.pulsePhase = 0;
  }

  init(cards) {
    this.container = document.getElementById("gaphunterGameView");
    if (!this.container) return;

    this.allCards = [...cards];
    this.selectedCards = [];
    this.render();
    this.setupCanvas();
    this.bindEvents();
    this.startBeamLoop();
  }

  render() {
    if (!this.container) return;

    // Seleccionar nodos de constelación representativos para el lienzo
    const nodeIds = ["MTC06", "MTC43", "MTC49", "MTC02", "MTC07", "MTC29", "MTC22", "MTC31", "MTC34", "MTC09", "MTC16", "MTC14"];
    const constellationCards = this.allCards.filter(c => nodeIds.includes(c.id));

    this.container.innerHTML = `
      <div class="game-wrapper">
        <div class="game-header-bar">
          <div>
            <div class="game-tag">DINÁMICA 3 · IDENTIFICACIÓN DE GAPS CIENTÍFICOS</div>
            <h2>Cazadores de Vacíos</h2>
            <p>Haz clic en 2 o 3 antecedentes para proyectar un <b>haz digital luminoso</b> entre ellos. El motor analizará sus limitaciones cruzadas y sintetizará el vacío que tu investigación resolverá.</p>
          </div>
          <div class="game-actions">
            <button id="btnSynthesizeGap" class="cyber-btn primary-btn" ${this.selectedCards.length < 2 ? 'disabled' : ''}>
              Trazar Haz Digital y Revelar Vacío ⚡ (${this.selectedCards.length}/3)
            </button>
            <button id="btnClearSelection" class="cyber-btn secondary-btn small-btn">Limpiar Selección</button>
          </div>
        </div>

        <div class="constellation-layout">
          <!-- Lienzo interactivo espacial -->
          <div class="constellation-stage" id="constellationStage">
            <canvas id="beamCanvas"></canvas>
            
            <div class="nodes-overlay" id="nodesOverlay">
              ${constellationCards.map((card, idx) => {
                const angle = (idx / constellationCards.length) * Math.PI * 2;
                const rx = 40; // radio porcentual
                const ry = 36;
                const left = 50 + rx * Math.cos(angle);
                const top = 50 + ry * Math.sin(angle);
                const isSelected = this.selectedCards.includes(card);

                return `
                  <div class="constellation-node ${isSelected ? 'selected' : ''}" 
                       data-card-id="${card.id}" 
                       style="left: ${left}%; top: ${top}%;">
                    <div class="node-ring"></div>
                    <img src="${card.image}" class="node-img" onerror="this.src='card_redesign/card_back/mtc_card_back_art.png'">
                    <div class="node-tooltip">
                      <strong>${card.id}: ${card.firstAuthor} (${card.year})</strong>
                      <span class="tip-core">${card.title}</span>
                      <span class="tip-lim"><b>Límite:</b> ${card.limitation}</span>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Panel lateral de vacíos descubiertos -->
          <div class="gaps-sidebar glass-panel">
            <div class="sidebar-header">
              <h3>Vacíos de Investigación Revelados (<span id="gapCount">${this.discoveredGaps.length}</span>)</h3>
              <p>Cada brecha descubierta se integra automáticamente en la Justificación de tu Tesis.</p>
            </div>

            <div class="gaps-list" id="gapsList">
              ${this.renderGapsList()}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderGapsList() {
    if (this.discoveredGaps.length === 0) {
      return `
        <div class="empty-gaps-state">
          <div class="radar-scan-icon">📡</div>
          <p>No se han enlazado cartas todavía.</p>
          <span>Selecciona antecedentes en el mapa cósmico que aborden el mismo problema desde ángulos opuestos para extraer su brecha oculta.</span>
        </div>
      `;
    }

    return this.discoveredGaps.map(g => `
      <div class="gap-card-discovered glass-card">
        <div class="gap-badge">BRECHA METODOLÓGICA #${g.id.slice(-2)}</div>
        <h4 class="gap-title">${g.title}</h4>
        <div class="gap-cards-linked">
          ${g.cards.map(c => `<span class="linked-tag">${c.id} (${c.firstAuthor}, ${c.year})</span>`).join('')}
        </div>
        <p class="gap-desc">${g.description}</p>
        <div class="gap-justification">
          <b>🎯 Impacto en tu Proyecto:</b>
          <p>${g.justification}</p>
        </div>
      </div>
    `).join('');
  }

  setupCanvas() {
    this.canvas = document.getElementById("beamCanvas");
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");
    this.resizeCanvas();
    window.addEventListener("resize", () => this.resizeCanvas());
  }

  resizeCanvas() {
    const stage = document.getElementById("constellationStage");
    if (stage && this.canvas) {
      this.canvas.width = stage.clientWidth;
      this.canvas.height = stage.clientHeight;
    }
  }

  bindEvents() {
    const stage = document.getElementById("constellationStage");
    if (!stage) return;

    stage.addEventListener("click", (e) => {
      const nodeEl = e.target.closest(".constellation-node");
      if (nodeEl) {
        const cardId = nodeEl.dataset.cardId;
        const card = this.allCards.find(c => c.id === cardId);
        if (!card) return;

        if (this.selectedCards.includes(card)) {
          this.selectedCards = this.selectedCards.filter(c => c !== card);
        } else {
          if (this.selectedCards.length >= 3) {
            this.selectedCards.shift(); // Reemplazar la más antigua si ya hay 3
          }
          this.selectedCards.push(card);
          if (window.soundEngine) window.soundEngine.playFlip();
        }

        this.updateNodeStyles();
      }
    });

    document.getElementById("btnSynthesizeGap")?.addEventListener("click", () => {
      this.analyzeAndRevealGap();
    });

    document.getElementById("btnClearSelection")?.addEventListener("click", () => {
      this.selectedCards = [];
      this.updateNodeStyles();
    });
  }

  updateNodeStyles() {
    document.querySelectorAll(".constellation-node").forEach(n => {
      const id = n.dataset.cardId;
      const isSel = this.selectedCards.some(c => c.id === id);
      n.classList.toggle("selected", isSel);
    });

    const btn = document.getElementById("btnSynthesizeGap");
    if (btn) {
      btn.disabled = this.selectedCards.length < 2;
      btn.innerHTML = `Trazar Haz Digital y Revelar Vacío ⚡ (${this.selectedCards.length}/3)`;
    }
  }

  startBeamLoop() {
    const loop = () => {
      this.drawBeams();
      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  drawBeams() {
    if (!this.ctx || !this.canvas) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.selectedCards.length < 2) return;

    this.pulsePhase += 0.08;
    const stage = document.getElementById("constellationStage");
    if (!stage) return;

    const points = this.selectedCards.map(c => {
      const el = stage.querySelector(`.constellation-node[data-card-id="${c.id}"]`);
      if (el) {
        return {
          x: el.offsetLeft + el.offsetWidth / 2,
          y: el.offsetTop + el.offsetHeight / 2
        };
      }
      return null;
    }).filter(Boolean);

    if (points.length < 2) return;

    // Dibujar haces láser cibernéticos entre todos los puntos seleccionados
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const p1 = points[i];
        const p2 = points[j];

        // Haz exterior difuso (Glow con tono Melocotón / Cobre)
        this.ctx.beginPath();
        this.ctx.moveTo(p1.x, p1.y);
        this.ctx.lineTo(p2.x, p2.y);
        this.ctx.strokeStyle = `rgba(253, 153, 92, ${0.45 + 0.3 * Math.sin(this.pulsePhase)})`;
        this.ctx.lineWidth = 8 + 3 * Math.sin(this.pulsePhase);
        this.ctx.shadowBlur = 18;
        this.ctx.shadowColor = "#FD995C";
        this.ctx.stroke();

        // Núcleo blanco brillante del rayo láser
        this.ctx.beginPath();
        this.ctx.moveTo(p1.x, p1.y);
        this.ctx.lineTo(p2.x, p2.y);
        this.ctx.strokeStyle = "#ffffff";
        this.ctx.lineWidth = 2.5;
        this.ctx.stroke();

        // Partícula viajera en el haz
        const t = (Math.sin(this.pulsePhase * 0.7 + i) + 1) / 2;
        const px = p1.x + (p2.x - p1.x) * t;
        const py = p1.y + (p2.y - p1.y) * t;

        this.ctx.beginPath();
        this.ctx.arc(px, py, 4.5, 0, Math.PI * 2);
        this.ctx.fillStyle = "#FD995C";
        this.ctx.shadowBlur = 12;
        this.ctx.shadowColor = "#D4783D";
        this.ctx.fill();
      }
    }
  }

  analyzeAndRevealGap() {
    if (this.selectedCards.length < 2) return;

    if (window.soundEngine) {
      window.soundEngine.playBeamHum();
      setTimeout(() => window.soundEngine.playGapDiscovered(), 300);
    }

    const gap = this.computeResearchGap(this.selectedCards);
    this.discoveredGaps.unshift(gap);
    window.synthesisEngine.recordDiscoveredGap(gap);

    // Actualizar vista
    const listEl = document.getElementById("gapsList");
    const countEl = document.getElementById("gapCount");
    if (listEl) listEl.innerHTML = this.renderGapsList();
    if (countEl) countEl.innerText = this.discoveredGaps.length;

    // Resaltar el vacío descubierto
    alert(`⚡ ¡Haz Digital Conectado y Vacío Descubierto!\n\n` +
          `BRECHA: ${gap.title}\n\n` +
          `${gap.description}\n\n` +
          `Este vacío ha sido transferido directamente al capítulo de Justificación de tu Estado del Arte.`);
  }

  computeResearchGap(cards) {
    const ids = cards.map(c => c.id).sort().join("-");
    const authors = cards.map(c => `${c.firstAuthor} (${c.year})`).join(" y ");

    // Matriz de patrones de vacíos basados en la intersección de subsistemas
    const hasStructure = cards.some(c => c.category.includes("Structure"));
    const hasPropulsion = cards.some(c => c.category.includes("Propulsion"));
    const hasLogistics = cards.some(c => c.category.includes("Logistics"));
    const hasAccessibility = cards.some(c => c.category.includes("Accessibility") || c.category.includes("Public"));

    let title = "Brecha de Integración Multidisciplinar y Validación Empírica";
    let desc = `Al contrastar las investigaciones de ${authors}, se observa que ${cards[0].firstAuthor} aborda ${cards[0].coreIdea.toLowerCase()} pero advierte que "${cards[0].limitation}", mientras que ${cards[1].firstAuthor} se enfoca en ${cards[1].coreIdea.toLowerCase()} con la limitación "${cards[1].limitation}".`;
    let just = `El proyecto del investigador aporta novedad al cerrar la brecha entre el modelado aislado y las demandas operativas formuladas en la pregunta: "${window.synthesisEngine.topicInfo.question}".`;

    if (hasStructure && hasLogistics) {
      title = "Falta de Validación Estructural ante Cargas Dinámicas de Reparto en Última Milla";
      desc = `Los estudios de chasis se limitan a cargas estáticas teóricas, mientras que los estudios de logística de carga no incorporan telemetría de fatiga mecánica en pavimentos irregulares.`;
      just = `Justifica la necesidad de diseñar estructuras ligeras optimizadas con pruebas de esfuerzo bajo ciclos de entrega reales.`;
    } else if (hasStructure && hasPropulsion) {
      title = "Desacoplamiento entre Control Dinámico Antivuelco y Eficiencia del Tren Motriz";
      desc = `Los algoritmos de estabilidad asumen torque infinito sin considerar la caída de tensión en baterías de baja capacidad, mientras que los diseños de batería ignoran las demandas bruscas de frenado diferencial.`;
      just = `Abre la oportunidad para un sistema integrado de gestión energética y control de estabilidad dinámica de bajo costo.`;
    } else if (hasAccessibility && hasPropulsion) {
      title = "Incompatibilidad entre Asistencia Motriz Adaptativa y Restricciones de Autonomía Urbana";
      desc = `Las interfaces ergonómicas para personas mayores o con discapacidad incrementan el peso y consumo motriz, sin contar con optimizaciones de carga solar o recuperación regenerativa compacta.`;
      just = `Demuestra la urgencia de desarrollar soluciones de movilidad inclusiva energéticamente autosuficientes para ciudades emergentes.`;
    }

    return {
      id: `GAP-${Date.now()}`,
      title,
      cards: [...cards],
      description: desc,
      justification: just
    };
  }
}

window.gameGapHunter = new GameGapHunter();
