import fs from "node:fs";
import path from "node:path";

const redesignDir = path.resolve(import.meta.dirname);
const outDir = path.join(redesignDir, "final_cards");
const sourceMd = path.join(redesignDir, "final_card_text_49.md");
const auditMd = path.join(outDir, "source_quality_audit.md");
const bibFile = path.resolve(redesignDir, "..", "references_paper1.bib");
const bibliometricsFile = path.join(outDir, "bibliometrics_openalex.json");
const verifiedIndicatorsFile = path.join(outDir, "mtc_card_indicators_scopus_scimago_2025.json");
const analysisYear = 2026;

const categoryEs = {
  "Accessibility and inclusive mobility": "Accesibilidad y movilidad inclusiva",
  "Public acceptance and service quality": "Aceptación pública y calidad del servicio",
  "Structure, ergonomics and safety": "Estructura, ergonomía y seguridad",
  "Propulsion, battery and energy management": "Propulsión, batería y gestión de energía",
  "Logistics, production and applied deployment": "Logística, producción y despliegue",
  "Policy, regulation and socioeconomic context": "Política, regulación y contexto socioeconómico"
};

const categoryColor = {
  "Accessibility and inclusive mobility": "#0f766e",
  "Public acceptance and service quality": "#2563eb",
  "Structure, ergonomics and safety": "#b91c1c",
  "Propulsion, battery and energy management": "#b45309",
  "Logistics, production and applied deployment": "#15803d",
  "Policy, regulation and socioeconomic context": "#7e22ce"
};

const qualityColor = {
  Q1: "#15803d",
  Q2: "#0f766e",
  Q3: "#b45309",
  Q4: "#c2410c",
  Proceedings: "#7e22ce",
  Chapter: "#475569",
  "Scopus-NQ": "#64748b",
  Book: "#475569",
  NQ: "#991b1b"
};

const esTitle = parseAudit(auditMd);
const bibliography = parseBib(fs.readFileSync(bibFile, "utf8"));
const bibliometrics = fs.existsSync(bibliometricsFile) ? JSON.parse(fs.readFileSync(bibliometricsFile, "utf8")) : {};
const verifiedIndicators = fs.existsSync(verifiedIndicatorsFile)
  ? new Map(JSON.parse(fs.readFileSync(verifiedIndicatorsFile, "utf8")).map((row) => [row.card_id, row]))
  : new Map();
const cards = parseCards(fs.readFileSync(sourceMd, "utf8")).map(enrichCard);

function parseCards(markdown) {
  const escapedPipe = "__PIPE__";
  return markdown.split(/\r?\n/)
    .filter((line) => line.startsWith("| MTC"))
    .map((line) => line.replace(/\\\|/g, escapedPipe))
    .map((line) => line.trim().slice(1, -1).split("|").map((cell) => cell.trim().replaceAll(escapedPipe, "|")))
    .map(([id, category, quality, title, evidence, core, contribution, limitation, trace]) => ({
      id, category, quality, title, evidence, core, contribution, limitation, trace
    }));
}

function parseAudit(file) {
  if (!fs.existsSync(file)) return new Map();
  const rows = new Map();
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    if (!line.startsWith("| MTC")) continue;
    const cells = line.trim().slice(1, -1).split("|").map((cell) => cell.trim());
    rows.set(cells[0], { title: cells[4], type: cells[3] });
  }
  return rows;
}

function parseBib(text) {
  const entries = new Map();
  const entryRe = /@(\w+)\s*\{\s*([^,]+),([\s\S]*?)\n\}/g;
  let entry;
  while ((entry = entryRe.exec(text))) {
    const [, type, key, body] = entry;
    const fields = {};
    const fieldRe = /([a-zA-Z]+)\s*=\s*(\{(?:[^{}]|\{[^{}]*\})*\}|"[^"]*"|[^,\n]+)\s*,?/g;
    let field;
    while ((field = fieldRe.exec(body))) fields[field[1].toLowerCase()] = cleanBib(field[2]);
    entries.set(key.trim(), { type, key: key.trim(), ...fields });
  }
  return entries;
}

function cleanBib(value = "") {
  return String(value).replace(/^\s*[{"]|[}"]\s*$/g, "").replace(/[{}]/g, "").replace(/\s+/g, " ").trim();
}

function sourceKey(trace) {
  return String(trace).split("|")[0].trim();
}

function year(trace) {
  return String(trace).match(/\b(19|20)\d{2}\b/)?.[0] ?? "";
}

function authors(entry) {
  return cleanBib(entry?.author || entry?.editor || "").replace(/\s+and\s+/gi, "; ");
}

function venue(entry) {
  return entry?.journal || entry?.booktitle || entry?.publisher || entry?.institution || entry?.school || "";
}

function doi(entry) {
  return entry?.doi ? "https://doi.org/" + entry.doi.replace(/^https?:\/\/doi.org\//i, "") : "";
}

function docType(quality, locale) {
  if (/^Q[1-4]$/.test(quality)) return locale === "es" ? "Artículo de revista" : "Journal article";
  if (quality === "Proceedings") return locale === "es" ? "Proceedings / conferencia" : "Proceedings / conference";
  if (quality === "Chapter") return locale === "es" ? "Capítulo de libro" : "Book chapter";
  if (quality === "Scopus-NQ") return locale === "es" ? "Fuente Scopus sin cuartil SJR" : "Scopus source without SJR quartile";
  return locale === "es" ? "Fuente no indexada o sin cuartil" : "Non-quartile or non-indexed source";
}

function sourceRole(quality, locale) {
  const es = {
    Q1: "Evidencia científica principal de alta prioridad.",
    Q2: "Evidencia científica principal.",
    Q3: "Evidencia científica útil, con peso medio.",
    Q4: "Evidencia científica indexada, con lectura cautelosa.",
    Proceedings: "Señal tecnológica o evidencia emergente; no pesa igual que un artículo Q1-Q4.",
    Chapter: "Apoyo conceptual o técnico; no debe tratarse como evidencia empírica principal.",
    NQ: "Fuente débil o sin cuartil local; útil para discutir descarte, trazabilidad y riesgo."
  };
  const en = {
    Q1: "High-priority scientific evidence.",
    Q2: "Main scientific evidence.",
    Q3: "Useful scientific evidence with medium weight.",
    Q4: "Indexed scientific evidence requiring cautious reading.",
    Proceedings: "Technology signal or emerging evidence; not equivalent to a Q1-Q4 article.",
    Chapter: "Conceptual or technical support; not primary empirical evidence.",
    NQ: "Weak or locally non-quartile source; useful for discussing exclusion, traceability and risk."
  };
  return (locale === "es" ? es : en)[quality] ?? (locale === "es" ? es.NQ : en.NQ);
}

function sourcePoints(quality) {
  return { Q1: 5, Q2: 4, Q3: 3, Q4: 2, Proceedings: 1, Chapter: 1, "Scopus-NQ": 1, Book: 1, NQ: 0 }[quality] ?? 0;
}

function evidencePoints(card) {
  const text = `${card.evidence} ${card.core} ${card.contribution}`.toLowerCase();
  let score = 2;
  if (/review|field|case|empirical|experiment|test|assessment|performance|safety testing/.test(text)) score = 4;
  if (/simulation|model|analysis|controller|optimization/.test(text)) score = Math.max(score, 3);
  if (/design|prototype|fabrication|procedural|concept/.test(text)) score = Math.max(score, 2);
  if (/field|real-world|human-subject|empirical business/.test(text)) score = 5;
  return Math.min(5, score);
}

function tracePoints(card) {
  const b = bibliography.get(card.sourceKey);
  let score = 1;
  if (doi(b)) score += 2;
  if (authors(b)) score += 1;
  if (venue(b)) score += 1;
  return Math.min(5, score);
}

function riskPoints(card) {
  if (card.quality === "NQ") return 5;
  if (["Proceedings", "Chapter"].includes(card.quality)) return 4;
  if (card.quality === "Q4") return 3;
  return 2;
}

function ageYears(cardYear) {
  const parsed = Number(cardYear);
  return Number.isFinite(parsed) ? Math.max(0, analysisYear - parsed) : null;
}

function ageBand(age, locale) {
  if (age === null) return locale === "es" ? "Sin año" : "No year";
  if (age <= 2) return locale === "es" ? "0-2 años" : "0-2 years";
  if (age <= 5) return locale === "es" ? "3-5 años" : "3-5 years";
  if (age <= 10) return locale === "es" ? "6-10 años" : "6-10 years";
  return locale === "es" ? "Más de 10 años" : "More than 10 years";
}

function contributionType(card, locale) {
  const text = `${card.evidence} ${card.core} ${card.contribution}`.toLowerCase();
  const es = {
    review: "Revisión / mapeo",
    field: "Evidencia de campo",
    experiment: "Prueba / experimento",
    simulation: "Modelo / simulación",
    prototype: "Diseño / prototipo",
    policy: "Política / contexto",
    service: "Servicio / adopción",
    concept: "Marco conceptual"
  };
  const en = {
    review: "Review / mapping",
    field: "Field evidence",
    experiment: "Test / experiment",
    simulation: "Model / simulation",
    prototype: "Design / prototype",
    policy: "Policy / context",
    service: "Service / adoption",
    concept: "Conceptual frame"
  };
  const out = locale === "es" ? es : en;
  if (/review|mapping/.test(text)) return out.review;
  if (/field|real-world|case study|empirical business/.test(text)) return out.field;
  if (/experiment|test|assessment|performance|safety testing/.test(text)) return out.experiment;
  if (/simulation|model|analysis|controller|optimization|dynamic/.test(text)) return out.simulation;
  if (/prototype|fabrication|design|development|procedural/.test(text)) return out.prototype;
  if (/policy|legal|regulation|traffic/.test(text)) return out.policy;
  if (/service|acceptance|adoption|operation|maintenance/.test(text)) return out.service;
  return out.concept;
}

function habitPhrase(card, locale) {
  const isEs = locale === "es";
  if (card.quality === "NQ") {
    return isEs
      ? "Hábito: no uses una fuente sin cuartil para cerrar una conclusión; úsala para practicar descarte, contraste o búsqueda de una fuente más sólida."
      : "Habit: do not use a non-quartile source to close a conclusion; use it to practice exclusion, contrast or search for stronger evidence.";
  }
  if (card.quality === "Proceedings") {
    return isEs
      ? "Hábito: lee un proceedings como señal temprana; confirma sus hallazgos con artículos indexados antes de generalizar."
      : "Habit: read proceedings as early signals; confirm their findings with indexed articles before generalizing.";
  }
  if (card.quality === "Chapter") {
    return isEs
      ? "Hábito: usa capítulos para marco conceptual o contexto técnico; no los confundas con validación empírica principal."
      : "Habit: use book chapters for conceptual framing or technical context; do not confuse them with primary empirical validation.";
  }
  if (card.ageYears !== null && card.ageYears > 10) {
    return isEs
      ? "Hábito: una fuente antigua puede ser seminal, pero debes buscar evidencia reciente que confirme si el hallazgo sigue vigente."
      : "Habit: an older source may be seminal, but look for recent evidence that confirms whether the finding still holds.";
  }
  if (/review/i.test(card.evidence)) {
    return isEs
      ? "Hábito: en una revisión, identifica alcance, criterios de inclusión y vacíos; no la leas como si probara un prototipo."
      : "Habit: in a review, identify scope, inclusion criteria and gaps; do not read it as prototype validation.";
  }
  if (/simulation|model|analysis|control/i.test(card.evidence)) {
    return isEs
      ? "Hábito: separa evidencia modelada de evidencia en campo; pregunta siempre qué supuestos sostienen el resultado."
      : "Habit: separate modelled evidence from field evidence; always ask which assumptions support the result.";
  }
  if (/field|case|empirical|operational|service/i.test(`${card.evidence} ${card.core}`)) {
    return isEs
      ? "Hábito: cuando hay evidencia de campo, revisa contexto, muestra y condiciones antes de transferir el hallazgo."
      : "Habit: when evidence is field-based, check context, sample and conditions before transferring the finding.";
  }
  return isEs
    ? "Hábito: compara esta fuente con otra de distinto cuartil o evidencia antes de decidir su peso en el estado del arte."
    : "Habit: compare this source with another of different quartile or evidence type before deciding its weight in the state of the art.";
}

function methodUse(card, locale) {
  if (locale === "es") {
    return `Use esta carta para comparar ${docType(card.quality, "es").toLowerCase()}, calidad ${card.quality}, tipo de evidencia y riesgo de sobreinterpretación dentro de la ruta ${categoryEs[card.category]}.`;
  }
  return `Use this card to compare ${docType(card.quality, "en").toLowerCase()}, ${card.quality} quality, evidence type and overclaiming risk within ${card.category}.`;
}

function citation(entry, card) {
  const a = authors(entry);
  const v = venue(entry);
  const d = doi(entry);
  return `${a ? a + ". " : ""}(${card.year}). ${entry?.title || card.title}.${v ? " " + v + "." : ""}${d ? " " + d : ""}`;
}

function enrichCard(card) {
  const key = sourceKey(card.trace);
  const entry = bibliography.get(key);
  const bm = bibliometrics[card.id] || {};
  const vi = verifiedIndicators.get(card.id) || {};
  const y = year(card.trace);
  const age = ageYears(y);
  const verifiedQuality = vi.clase_documental_verificada || card.quality;
  const scopusCitations = vi.scopus_citas !== "" && vi.scopus_citas !== undefined ? Number(vi.scopus_citas) : null;
  return {
    ...card,
    originalQuality: card.quality,
    quality: verifiedQuality,
    sourceKey: key,
    year: y,
    ageYears: age,
    color: qualityColor[verifiedQuality] || qualityColor.NQ,
    categoryColor: categoryColor[card.category] || "#475569",
    authors: authors(entry),
    venue: venue(entry),
    doi: doi(entry),
    citation: citation(entry, { ...card, year: y }),
    citationCount: Number.isFinite(scopusCitations) ? scopusCitations : (Number.isFinite(bm.citedByCount) ? bm.citedByCount : null),
    citationSource: Number.isFinite(scopusCitations) ? "Elsevier Scopus API" : (bm.status === "ok" ? `OpenAlex, ${bm.queryDate}` : ""),
    venueHIndex: vi.h_index_fuente_scimago ? Number(vi.h_index_fuente_scimago) : (Number.isFinite(bm.venueHIndex) ? bm.venueHIndex : null),
    bibliometricSource: vi.fuentes_indicadores || (bm.status === "ok" ? `OpenAlex, ${bm.queryDate}` : ""),
    scopusIndexed: vi.scopus_indexado || "",
    scopusDocumentFound: vi.scopus_documento_encontrado || "",
    citeScore: vi.citescore || "",
    sjr: vi.sjr || "",
    sjrQuartile: vi.cuartil_sjr || "",
    scimagoTitle: vi.scimago_title || "",
    scimagoMatch: vi.scimago_match_2025 || "",
    scimagoMatchMethod: vi.scimago_match_metodo || "",
    scimagoCategories: vi.scimago_categories || "",
    scimagoAreas: vi.scimago_areas || "",
    verifiedDocumentValue: vi.valor_documental || "",
    sourcePoints: vi.valor_documental !== "" && vi.valor_documental !== undefined ? Number(vi.valor_documental) : sourcePoints(verifiedQuality),
    evidencePoints: evidencePoints(card),
    tracePoints: tracePoints({ ...card, sourceKey: key }),
    riskPoints: riskPoints({ ...card, quality: verifiedQuality })
  };
}

function esc(value) {
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function local(card, locale) {
  if (locale === "en") return {
    title: card.title,
    category: card.category,
    evidence: card.evidence,
    core: card.core,
    contribution: card.contribution,
    limitation: card.limitation,
    docType: docType(card.quality, "en"),
    role: sourceRole(card.quality, "en"),
    use: methodUse(card, "en"),
    labels: {
      deckTitle: "MTC cards - critical evidence deck",
      note: "The deck keeps 49 sources because the strategy teaches learners to distinguish strong journal articles from proceedings, chapters and weak/non-quartile sources.",
      search: "Search by topic, author, evidence, quartile or document type",
      print: "Print / PDF",
      detail: "Open article view",
      back: "Back to deck",
      close: "Close window",
      type: "Document type",
      quality: "Quartile / class",
      source: "Source quality",
      sourceValue: "Document value",
      evidenceScore: "Evidence strength",
      age: "Age",
      trace: "Traceability",
      risk: "Overclaim risk",
      cites: "Citations",
      contributionType: "Contribution type",
      habit: "Research habit",
      verification: "Academic verification",
      doiStatus: "DOI status",
      openCitations: "Open citations",
      externalMetrics: "External metrics",
      authorMetrics: "Author metrics",
      doi: "DOI",
      summary: "What the source contributes",
      caution: "How to read it critically",
      cite: "How to cite"
    }
  };
  return {
    title: esTitle.get(card.id)?.title || card.title,
    category: categoryEs[card.category] || card.category,
    evidence: card.evidence,
    core: card.core,
    contribution: card.contribution,
    limitation: card.limitation,
    docType: docType(card.quality, "es"),
    role: sourceRole(card.quality, "es"),
    use: methodUse(card, "es"),
    labels: {
      deckTitle: "Cartas MTC - mazo crítico de evidencias",
      note: "El mazo conserva 49 fuentes porque la estrategia enseña a distinguir artículos de revista fuertes frente a proceedings, capítulos y fuentes débiles o sin cuartil.",
      search: "Buscar por tema, autor, evidencia, cuartil o tipo documental",
      print: "Imprimir / PDF",
      detail: "Abrir vista del artículo",
      back: "Volver al mazo",
      close: "Cerrar ventana",
      type: "Tipo documental",
      quality: "Cuartil / clase",
      source: "Calidad de fuente",
      sourceValue: "Valor documental",
      evidenceScore: "Fuerza de evidencia",
      age: "Antigüedad",
      trace: "Trazabilidad",
      risk: "Riesgo de exagerar",
      cites: "Citaciones",
      contributionType: "Tipo de aporte",
      habit: "Hábito de revisión",
      verification: "Verificación académica",
      doiStatus: "Estado DOI",
      openCitations: "Citas abiertas",
      externalMetrics: "Métricas externas",
      authorMetrics: "Métricas de autor",
      doi: "DOI",
      summary: "Qué aporta la fuente",
      caution: "Cómo leerla críticamente",
      cite: "Cómo citar"
    }
  };
}

function metrics(card, labels) {
  const items = [
    [labels.sourceValue, card.sourcePoints],
    [labels.age, card.ageYears === null ? "NA" : card.ageYears],
    [labels.evidenceScore, card.evidencePoints],
    [labels.risk, card.riskPoints]
  ];
  return items.map(([name, value]) => `<div class="metric"><span>${esc(name)}</span><b>${value}</b></div>`).join("");
}

function academicMetrics(card, locale) {
  const isEs = locale === "es";
  const items = [
    [isEs ? "Cuartil" : "Quartile", card.sjrQuartile || card.quality],
    ["SJR", card.sjr || "NA"],
    ["CiteScore", card.citeScore || "NA"],
    [isEs ? "Citas" : "Cites", card.citationCount ?? "NA"],
    ["H-index", card.venueHIndex ?? "NA"],
    ["Scopus", card.scopusIndexed === "si" ? (isEs ? "Si" : "Yes") : "No"]
  ];
  return `<div class="academic-strip">${items.map(([label, value]) => `<div><span>${esc(label)}</span><b>${esc(value)}</b></div>`).join("")}</div>`;
}

function metaPair(label, value) {
  if (value === null || value === undefined || value === "") return "";
  return `<b>${esc(label)}</b><span>${value}</span>`;
}

function verificationStatus(card, l, locale) {
  const isEs = locale === "es";
  const doiText = card.doi
    ? (isEs ? "Verificado por DOI" : "Verified by DOI")
    : (isEs ? "Sin DOI en metadatos" : "No DOI in metadata");
  const citationText = card.citationCount === null
    ? (isEs ? "No disponible en consulta abierta" : "Not available in open query")
    : `${card.citationCount} (${card.citationSource || card.bibliometricSource || "OpenAlex"})`;
  const externalText = isEs
    ? "SJR, cuartil, CiteScore, SNIP e Impact Factor se registran solo con evidencia externa."
    : "SJR, quartile, CiteScore, SNIP and Impact Factor are recorded only with external evidence.";
  const authorText = isEs
    ? "H-index de autor pendiente salvo perfil Scholar/Scopus inequívoco."
    : "Author H-index remains pending unless an unambiguous Scholar/Scopus profile is found.";
  return [
    metaPair(l.labels.doiStatus, esc(doiText)),
    metaPair(l.labels.openCitations, esc(citationText)),
    metaPair(l.labels.externalMetrics, esc(externalText)),
    metaPair(l.labels.authorMetrics, esc(authorText))
  ].join("");
}

function detailMeta(card, l, locale) {
  const authorLabel = locale === "es" ? "Autores" : "Authors";
  const sourceLabel = locale === "es" ? "Fuente" : "Source";
  const bibliometricLabel = locale === "es" ? "Fuente bibliometrica" : "Bibliometric source";
  return [
    metaPair(l.labels.type, esc(l.docType)),
    metaPair(l.labels.quality, esc(card.quality)),
    metaPair("Scopus", esc(card.scopusIndexed || "")),
    metaPair("SJR", esc(card.sjr || "")),
    metaPair("Cuartil SJR", esc(card.sjrQuartile || "")),
    metaPair("CiteScore", esc(card.citeScore || "")),
    metaPair("H-index fuente", esc(card.venueHIndex ?? "")),
    metaPair("Fuente SCImago", esc(card.scimagoTitle || "")),
    metaPair(l.labels.contributionType, esc(contributionType(card, locale))),
    metaPair(l.labels.age, esc(`${card.ageYears ?? "NA"} (${ageBand(card.ageYears, locale)})`)),
    card.citationCount === null ? "" : metaPair(l.labels.cites, esc(card.citationCount)),
    card.doi ? metaPair(l.labels.doi, `<a href="${esc(card.doi)}">${esc(card.doi)}</a>`) : "",
    metaPair(authorLabel, esc(card.authors)),
    metaPair(sourceLabel, esc(card.venue)),
    metaPair(bibliometricLabel, esc(card.bibliometricSource))
  ].join("");
}

function corpusSummary(locale) {
  const total = cards.length;
  const qCount = cards.filter((card) => /^Q[1-4]$/.test(card.quality)).length;
  const proceedings = cards.filter((card) => card.quality === "Proceedings").length;
  const chapters = cards.filter((card) => card.quality === "Chapter").length;
  const nq = cards.filter((card) => card.quality === "NQ").length;
  const scopusNq = cards.filter((card) => card.quality === "Scopus-NQ").length;
  const avgDocument = cards.reduce((sum, card) => sum + card.sourcePoints, 0) / total;
  const knownCitations = cards.filter((card) => card.citationCount !== null);
  const avgCitations = knownCitations.length ? knownCitations.reduce((sum, card) => sum + card.citationCount, 0) / knownCitations.length : null;
  const avgAge = cards.reduce((sum, card) => sum + (card.ageYears ?? 0), 0) / total;
  const qRatio = qCount / total;
  const diagnosis = qRatio >= 0.75 && avgDocument >= 3.5
    ? (locale === "es" ? "Revision cientifica robusta" : "Robust scientific review")
    : qRatio >= 0.5
      ? (locale === "es" ? "Revision exploratoria con nucleo indexado" : "Exploratory review with indexed core")
      : (locale === "es" ? "Vigilancia tecnologica exploratoria" : "Exploratory technology watch");
  return { total, qCount, proceedings, chapters, nq, scopusNq, avgDocument, avgCitations, avgAge, diagnosis };
}

function summaryCardHtml(locale) {
  const s = corpusSummary(locale);
  const isEs = locale === "es";
  const title = isEs ? "Sintesis de calidad del mazo" : "Deck quality synthesis";
  const type = isEs ? "Carta de orientacion del mazo" : "Deck orientation card";
  const text = isEs
    ? `Diagnostico: ${s.diagnosis}. ${s.qCount}/${s.total} fuentes son articulos Q1-Q4; ${s.proceedings} son proceedings, ${s.chapters} capitulos y ${s.nq} fuentes sin cuartil local.`
    : `Diagnosis: ${s.diagnosis}. ${s.qCount}/${s.total} sources are Q1-Q4 articles; ${s.proceedings} are proceedings, ${s.chapters} book chapters and ${s.nq} locally non-quartile sources.`;
  const avgCites = s.avgCitations === null ? "NA" : s.avgCitations.toFixed(1);
  return `<a class="mtc-card wildcard" href="mtc_card_details_${locale}.html?card=SYNTHESIS" target="_blank" rel="noopener" data-card="SYNTHESIS" data-search="${esc(`${title} ${type} ${s.diagnosis}`.toLowerCase())}" style="--accent:#172033;--cat:#64748b">
  <header><span>${isEs ? "Comodin" : "Wildcard"}</span><b>${esc(s.diagnosis)}</b></header>
  <figure>${qualitySvg(locale)}</figure>
  <section class="body">
    <p class="category">${esc(type)}</p>
    <h2>${esc(title)}</h2>
    <div class="metrics"><div class="metric"><span>${isEs ? "Valor prom." : "Avg value"}</span><b>${s.avgDocument.toFixed(2)}</b></div><div class="metric"><span>Q1-Q4</span><b>${s.qCount}/${s.total}</b></div><div class="metric"><span>${isEs ? "Edad prom." : "Avg age"}</span><b>${s.avgAge.toFixed(1)}</b></div><div class="metric"><span>${isEs ? "Citas prom." : "Avg cites"}</span><b>${avgCites}</b></div></div>
    <p class="role">${esc(text)}</p>
  </section>
  <footer>${isEs ? "Abrir sintesis del corpus" : "Open corpus synthesis"}</footer>
</a>`;
}

function graphCardHtml(locale) {
  const isEs = locale === "es";
  const title = isEs ? "Grafo relacional documental" : "Document relationship graph";
  const text = isEs
    ? "Conecta documentos por conceptos observables: tema, evidencia, aporte y limite."
    : "Connects documents through observable concepts: topic, evidence, contribution and limitation.";
  return `<a class="mtc-card wildcard" href="mtc_card_details_${locale}.html?card=GRAPH" target="_blank" rel="noopener" data-card="GRAPH" data-search="${esc(`${title} grafo relaciones documentos conceptos evidencia`.toLowerCase())}" style="--accent:#334155;--cat:#0f766e">
  <header><span>${isEs ? "Grafo" : "Graph"}</span><b>${isEs ? "Relaciones" : "Relations"}</b></header>
  <figure>${graphSvg(locale)}</figure>
  <section class="body"><p class="category">${isEs ? "Carta de orientacion del mazo" : "Deck orientation card"}</p><h2>${esc(title)}</h2><p class="role">${esc(text)}</p></section>
  <footer>${isEs ? "Abrir grafo documental" : "Open document graph"}</footer>
</a>`;
}

function modelCardHtml(locale) {
  const isEs = locale === "es";
  const title = isEs ? "Modelo conceptual de lectura" : "Conceptual reading model";
  const text = isEs
    ? "Resume la ruta publica observable: buscar, relacionar, ponderar, comparar, limitar y justificar la evidencia."
    : "Summarizes the public observable route: search, relate, weight, compare, limit and justify evidence.";
  return `<a class="mtc-card wildcard" href="mtc_card_details_${locale}.html?card=MODEL" target="_blank" rel="noopener" data-card="MODEL" data-search="${esc(`${title} modelo conceptual lectura critica`.toLowerCase())}" style="--accent:#1d4ed8;--cat:#7e22ce">
  <header><span>${isEs ? "Modelo" : "Model"}</span><b>${isEs ? "Ruta" : "Route"}</b></header>
  <figure>${modelSvg(locale)}</figure>
  <section class="body"><p class="category">${isEs ? "Carta de orientacion del mazo" : "Deck orientation card"}</p><h2>${esc(title)}</h2><p class="role">${esc(text)}</p></section>
  <footer>${isEs ? "Abrir modelo conceptual" : "Open conceptual model"}</footer>
</a>`;
}

function wildcardCardsHtml(locale) {
  return summaryCardHtml(locale) + graphCardHtml(locale) + modelCardHtml(locale);
}

function qualitySvg(locale) {
  const s = corpusSummary(locale);
  const counts = {
    Q1: cards.filter((card) => card.quality === "Q1").length,
    Q2: cards.filter((card) => card.quality === "Q2").length,
    Q3: cards.filter((card) => card.quality === "Q3").length,
    Q4: cards.filter((card) => card.quality === "Q4").length,
    Proc: cards.filter((card) => card.quality === "Proceedings").length,
    Chap: cards.filter((card) => card.quality === "Chapter").length,
    ScNQ: cards.filter((card) => card.quality === "Scopus-NQ").length,
    NQ: cards.filter((card) => card.quality === "NQ").length
  };
  const max = Math.max(...Object.values(counts), 1);
  const bars = Object.entries(counts).map(([label, value], index) => {
    const x = 28 + index * 42;
    const h = Math.round((value / max) * 92);
    const y = 136 - h;
    const color = label === "Q1" ? qualityColor.Q1 : label === "Q2" ? qualityColor.Q2 : label === "Q3" ? qualityColor.Q3 : label === "Q4" ? qualityColor.Q4 : label === "Proc" ? qualityColor.Proceedings : label === "Chap" ? qualityColor.Chapter : label === "ScNQ" ? qualityColor["Scopus-NQ"] : qualityColor.NQ;
    return `<rect x="${x}" y="${y}" width="25" height="${h}" rx="4" fill="${color}"/><text x="${x + 12.5}" y="153" text-anchor="middle" font-size="10" fill="#172033">${label}</text><text x="${x + 12.5}" y="${y - 6}" text-anchor="middle" font-size="11" font-weight="700" fill="${color}">${value}</text>`;
  }).join("");
  return `<svg viewBox="0 0 380 190" role="img" aria-label="Deck quality synthesis"><rect width="380" height="190" fill="#f8fafc"/><text x="18" y="28" font-size="16" font-weight="800" fill="#172033">${locale === "es" ? "Robustez del corpus" : "Corpus robustness"}</text><text x="18" y="48" font-size="11" fill="#475569">${esc(s.diagnosis)} · ${s.qCount}/${s.total} Q1-Q4 · avg ${s.avgDocument.toFixed(2)}/5</text><line x1="18" y1="137" x2="362" y2="137" stroke="#cbd5e1"/>${bars}</svg>`;
}

const graphStopWords = new Set([
  "about", "after", "among", "analysis", "article", "based", "before", "between", "could", "design", "does", "each", "evidence", "from", "into", "limit", "method", "model", "paper", "review", "should", "shows", "study", "system", "that", "their", "there", "these", "this", "through", "using", "where", "which", "with",
  "acerca", "ademas", "analisis", "aporte", "articulo", "basado", "campo", "categoria", "central", "como", "cuando", "desde", "diseno", "documento", "donde", "evidencia", "forma", "fuente", "hallazgo", "hasta", "ideas", "limite", "mapa", "mental", "metodo", "modelo", "para", "puede", "revision", "segun", "sobre", "tambien", "tema", "tiene", "usar", "valor"
]);

function normalizeGraphText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function graphTokens(card) {
  const text = normalizeGraphText(`${card.title} ${card.evidence} ${card.core} ${card.contribution} ${card.limitation} ${card.category}`);
  const tokens = text
    .split(/[^a-z0-9]+/i)
    .filter((token) => token.length >= 5 && !graphStopWords.has(token) && !/^\d+$/.test(token));
  return new Set(tokens);
}

function graphData() {
  const categories = Object.keys(categoryColor);
  const centers = [
    { x: 92, y: 78 },
    { x: 210, y: 68 },
    { x: 328, y: 78 },
    { x: 92, y: 178 },
    { x: 210, y: 188 },
    { x: 328, y: 178 }
  ];
  const nodes = [];
  for (const [categoryIndex, category] of categories.entries()) {
    const group = cards.filter((card) => card.category === category);
    const center = centers[categoryIndex] || centers[centers.length - 1];
    const radius = Math.min(35, 15 + group.length * 2.1);
    group.forEach((card, index) => {
      const angle = -Math.PI / 2 + (index * Math.PI * 2) / Math.max(group.length, 1);
      nodes.push({
        card,
        category,
        center,
        x: Math.round(center.x + Math.cos(angle) * radius),
        y: Math.round(center.y + Math.sin(angle) * radius),
        tokens: graphTokens(card)
      });
    });
  }

  const candidates = [];
  for (let i = 0; i < nodes.length; i += 1) {
    for (let j = i + 1; j < nodes.length; j += 1) {
      const a = nodes[i];
      const b = nodes[j];
      const shared = [...a.tokens].filter((token) => b.tokens.has(token));
      if (shared.length < 2 && !(a.category === b.category && shared.length >= 1)) continue;
      const score = shared.length + (a.category === b.category ? 0.75 : 0) + (a.card.quality === b.card.quality ? 0.2 : 0);
      candidates.push({ a, b, shared, score });
    }
  }

  candidates.sort((left, right) => right.score - left.score || left.a.card.id.localeCompare(right.a.card.id));
  const degree = new Map(nodes.map((node) => [node.card.id, 0]));
  const edges = [];
  for (const edge of candidates) {
    if (edges.length >= 88) break;
    if ((degree.get(edge.a.card.id) ?? 0) >= 5 || (degree.get(edge.b.card.id) ?? 0) >= 5) continue;
    edges.push(edge);
    degree.set(edge.a.card.id, (degree.get(edge.a.card.id) ?? 0) + 1);
    degree.set(edge.b.card.id, (degree.get(edge.b.card.id) ?? 0) + 1);
  }
  return { categories, centers, nodes, edges };
}

function graphSvg(locale) {
  const isEs = locale === "es";
  const { categories, centers, nodes, edges } = graphData();
  const zones = categories.map((category, index) => {
    const center = centers[index] || centers[centers.length - 1];
    const label = (isEs ? (categoryEs[category] || category) : category).split(" ").slice(0, 2).join(" ");
    return `<circle cx="${center.x}" cy="${center.y}" r="54" fill="${categoryColor[category]}" opacity=".08"/><circle cx="${center.x}" cy="${center.y}" r="54" fill="none" stroke="${categoryColor[category]}" stroke-width="1" stroke-dasharray="3 4" opacity=".55"/><text x="${center.x}" y="${center.y + 55}" text-anchor="middle" font-size="7.5" font-weight="800" fill="${categoryColor[category]}">${esc(label)}</text>`;
  }).join("");
  const edgeEls = edges.map((edge) => {
    const opacity = Math.min(0.55, 0.12 + edge.shared.length * 0.08);
    const width = Math.min(2.2, 0.55 + edge.shared.length * 0.28);
    return `<line class="graph-edge" data-shared="${esc(edge.shared.slice(0, 6).join(", "))}" x1="${edge.a.x}" y1="${edge.a.y}" x2="${edge.b.x}" y2="${edge.b.y}" stroke="#334155" stroke-width="${width.toFixed(2)}" opacity="${opacity.toFixed(2)}"/>`;
  }).join("");
  const nodeEls = nodes.map((node) => {
    const number = node.card.id.replace("MTC", "");
    const r = /^Q[1-4]$/.test(node.card.quality) ? 5.4 : node.card.quality === "NQ" ? 4.3 : 4.8;
    const title = `${node.card.id}: ${node.card.title} | ${node.card.quality} | ${[...node.tokens].slice(0, 8).join(", ")}`;
    return `<g class="graph-node" data-card="${esc(node.card.id)}"><circle cx="${node.x}" cy="${node.y}" r="${r}" fill="${node.card.color}" stroke="${node.card.categoryColor}" stroke-width="1.6"/><title>${esc(title)}</title><text x="${node.x}" y="${node.y + 2.3}" text-anchor="middle" font-size="5.3" font-weight="900" fill="#fff">${esc(number)}</text></g>`;
  }).join("");
  const legend = `<g transform="translate(18 228)"><circle cx="4" cy="4" r="4" fill="${qualityColor.Q1}"/><text x="12" y="7" font-size="8" fill="#172033">Q1-Q4</text><circle cx="62" cy="4" r="4" fill="${qualityColor.Proceedings}"/><text x="70" y="7" font-size="8" fill="#172033">${isEs ? "Apoyo" : "Support"}</text><circle cx="120" cy="4" r="4" fill="${qualityColor.NQ}"/><text x="128" y="7" font-size="8" fill="#172033">NQ</text><line x1="172" y1="4" x2="202" y2="4" stroke="#334155" stroke-width="1.4" opacity=".5"/><text x="208" y="7" font-size="8" fill="#172033">${isEs ? "ideas compartidas" : "shared ideas"}</text></g>`;
  return `<svg viewBox="0 0 420 245" role="img" aria-label="${isEs ? "Grafo relacional de documentos" : "Document relationship graph"}"><rect width="420" height="245" fill="#f8fafc"/><text x="18" y="24" font-size="14" font-weight="900" fill="#172033">${isEs ? "Grafo documento-documento" : "Document-document graph"}</text><text x="18" y="39" font-size="8.5" fill="#475569">${isEs ? "Nodos=49 fuentes; aristas=ideas secundarias compartidas; color=calidad documental." : "Nodes=49 sources; edges=shared secondary ideas; color=document quality."}</text>${zones}${edgeEls}${nodeEls}${legend}</svg>`;
}

function modelSvg(locale) {
  const isEs = locale === "es";
  const steps = isEs ? ["Buscar", "Relacionar", "Ponderar", "Comparar", "Limitar", "Justificar"] : ["Search", "Relate", "Weight", "Compare", "Limit", "Justify"];
  const boxes = steps.map((step, index) => {
    const x = 20 + (index % 3) * 100;
    const y = index < 3 ? 60 : 118;
    return `<rect x="${x}" y="${y}" width="84" height="34" rx="8" fill="${index < 3 ? "#e0f2fe" : "#fef3c7"}" stroke="#94a3b8"/><text x="${x + 42}" y="${y + 21}" text-anchor="middle" font-size="11" font-weight="800" fill="#172033">${step}</text>`;
  }).join("");
  return `<svg viewBox="0 0 330 190" role="img" aria-label="Conceptual model"><rect width="330" height="190" fill="#f8fafc"/><text x="18" y="28" font-size="15" font-weight="800" fill="#172033">${isEs ? "Modelo conceptual" : "Conceptual model"}</text><path d="M104 77 H120 M204 77 H220 M262 94 V112 M220 135 H204 M120 135 H104" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/>${boxes}<text x="165" y="174" text-anchor="middle" font-size="11" fill="#475569">${isEs ? "De cartas trazables a evidencia justificable" : "From traceable cards to justified evidence"}</text></svg>`;
}

function wildcardDetailSections(locale) {
  const isEs = locale === "es";
  const s = corpusSummary(locale);
  const synthesisTitle = isEs ? "Sintesis de calidad del mazo" : "Deck quality synthesis";
  const graphTitle = isEs ? "Grafo relacional documental" : "Document relationship graph";
  const modelTitle = isEs ? "Modelo conceptual de lectura" : "Conceptual reading model";
  const back = isEs ? "Volver al mazo" : "Back to deck";
  const synthesisText = isEs
    ? `El corpus tiene ${s.total} fuentes: ${s.qCount} articulos Q1-Q4, ${s.proceedings} proceedings, ${s.chapters} capitulos y ${s.nq} fuentes sin cuartil local. Valor documental promedio: ${s.avgDocument.toFixed(2)}/5. Diagnostico: ${s.diagnosis}.`
    : `The corpus has ${s.total} sources: ${s.qCount} Q1-Q4 articles, ${s.proceedings} proceedings, ${s.chapters} book chapters and ${s.nq} locally non-quartile sources. Average document value: ${s.avgDocument.toFixed(2)}/5. Diagnosis: ${s.diagnosis}.`;
  return `<section class="detail-target" id="review-SYNTHESIS" style="--accent:#172033;--cat:#64748b"><article class="detail-panel"><header class="detail-head"><div><p>${isEs ? "Carta comodin" : "Wildcard card"}</p><h2>${esc(synthesisTitle)}</h2></div><a href="mtc_cards_new_proposal_${locale}.html">${esc(back)}</a></header><section class="detail-body"><div class="visual">${qualitySvg(locale)}</div><div class="panels"><div class="panel"><h3>${isEs ? "Diagnostico del corpus" : "Corpus diagnosis"}</h3><p>${esc(synthesisText)}</p></div><div class="panel"><h3>${isEs ? "Uso en la validacion" : "Use in validation"}</h3><p>${isEs ? "Esta carta permite discutir si el conjunto funciona como revision robusta, revision exploratoria o vigilancia tecnologica, segun la calidad documental real del mazo." : "This card supports discussion of whether the set behaves as a robust review, exploratory review or technology watch, based on actual document quality."}</p></div></div></section></article></section>
<section class="detail-target" id="review-GRAPH" style="--accent:#334155;--cat:#0f766e"><article class="detail-panel"><header class="detail-head"><div><p>${isEs ? "Carta comodin" : "Wildcard card"}</p><h2>${esc(graphTitle)}</h2></div><a href="mtc_cards_new_proposal_${locale}.html">${esc(back)}</a></header><section class="detail-body"><div class="visual">${graphSvg(locale)}</div><div class="panels"><div class="panel"><h3>${isEs ? "Uso publico" : "Public use"}</h3><p>${isEs ? "El grafo representa relaciones documento-documento: cada nodo es una fuente del mazo; las aristas aparecen cuando dos documentos comparten conceptos observables en titulo, evidencia, aporte o limite. En el experimento, el aprendiz debe usarlo para detectar nucleos conceptuales, documentos puente, vacios de relacion y zonas donde la evidencia fuerte o debil cambia la interpretacion del estado del arte." : "The graph represents document-document relationships: each node is a deck source; edges appear when two documents share observable concepts in title, evidence, contribution or limitation. In the experiment, the learner should use it to detect conceptual cores, bridge documents, relational gaps and zones where strong or weak evidence changes the state-of-the-art interpretation."}</p></div></div></section></article></section>
<section class="detail-target" id="review-MODEL" style="--accent:#1d4ed8;--cat:#7e22ce"><article class="detail-panel"><header class="detail-head"><div><p>${isEs ? "Carta comodin" : "Wildcard card"}</p><h2>${esc(modelTitle)}</h2></div><a href="mtc_cards_new_proposal_${locale}.html">${esc(back)}</a></header><section class="detail-body"><div class="visual">${modelSvg(locale)}</div><div class="panels"><div class="panel"><h3>${isEs ? "Modelo de trabajo" : "Working model"}</h3><p>${isEs ? "El modelo resume la ruta observable esperada: buscar, relacionar, ponderar, comparar, limitar y justificar. Esa es la conducta que el experimento debe observar." : "The model summarizes the expected observable route: search, relate, weight, compare, limit and justify. That is the behavior the experiment should observe."}</p></div></div></section></article></section>`;
}

function deckHtml(locale) {
  const l0 = local(cards[0], locale).labels;
  const items = cards.map((card) => {
    const l = local(card, locale);
    return `<a class="mtc-card quality-${esc(card.quality)}" href="mtc_card_details_${locale}.html?card=${card.id}" target="_blank" rel="noopener" data-card="${card.id}" data-search="${esc(`${card.id} ${l.title} ${l.category} ${card.quality} ${l.docType} ${card.authors} ${card.venue} ${card.evidence}`.toLowerCase())}" style="--accent:${card.color};--cat:${card.categoryColor}">
  <header><span>${esc(card.id.replace("MTC", ""))}/49</span><b>${esc(card.quality)}</b></header>
  <figure><img src="../generated_visuals/${card.id}_visual_final.png" alt="${esc(l.title)}"></figure>
  <section class="body">
    <p class="category">${esc(l.category)}</p>
    <h2>${esc(l.title)}</h2>
    <div class="badges"><span>${esc(l.docType)}</span><span>${esc(card.year)}</span><span>${esc(ageBand(card.ageYears, locale))}</span><span>${esc(contributionType(card, locale))}</span></div>
    ${academicMetrics(card, locale)}
    <div class="metrics">${metrics(card, l.labels)}</div>
    <p class="role">${esc(l.role)}</p>
    <p class="habit">${esc(habitPhrase(card, locale))}</p>
    <dl>
      <dt>${esc(l.labels.type)}</dt><dd>${esc(l.docType)}</dd>
      <dt>${esc(l.labels.summary)}</dt><dd>${esc(l.core)}</dd>
      <dt>${esc(l.labels.verification)}</dt><dd>${esc(card.doi ? "DOI" : "DOI pendiente")}${card.citationCount !== null ? esc(` / ${l.labels.cites}: ${card.citationCount}`) : ""}${card.sjrQuartile ? esc(` / ${card.sjrQuartile}`) : ""}${card.citeScore ? esc(` / CiteScore: ${card.citeScore}`) : ""}</dd>
    </dl>
  </section>
  <footer>${esc(l.labels.detail)}</footer>
</a>`;
  }).join("\n");
  return htmlShell(locale, l0.deckTitle, `<header class="toolbar"><h1>${esc(l0.deckTitle)}</h1><input id="search" placeholder="${esc(l0.search)}"><button id="clearSearch">×</button><button onclick="window.print()">${esc(l0.print)}</button></header><section class="method-note">${esc(l0.note)}</section><main class="deck">${wildcardCardsHtml(locale)}${items}</main><script>
const search=document.getElementById('search');
const clear=document.getElementById('clearSearch');
search.addEventListener('input',()=>{const q=search.value.trim().toLowerCase();document.querySelectorAll('.mtc-card').forEach(c=>c.hidden=q&&!c.dataset.search.includes(q));});
clear.addEventListener('click',()=>{search.value='';search.dispatchEvent(new Event('input'));search.focus();});
</script>`);
}

function detailHtml(locale) {
  const l0 = local(cards[0], locale).labels;
  const sections = cards.map((card) => {
    const l = local(card, locale);
    return `<section class="detail-target" id="review-${card.id}" style="--accent:${card.color};--cat:${card.categoryColor}">
  <article class="detail-panel">
    <header class="detail-head"><div><p>${esc(card.id.replace("MTC", ""))}/49 · ${esc(l.category)} · ${esc(card.year)}</p><h2>${esc(l.title)}</h2></div><a href="mtc_cards_new_proposal_${locale}.html">${esc(l.labels.back)}</a></header>
    <section class="detail-body"><div class="visual"><img src="../generated_visuals/${card.id}_visual_final.png" alt="${esc(l.title)}"><div class="metrics">${metrics(card, l.labels)}</div></div>
    <div class="panels">
      <div class="panel"><h3>${esc(l.labels.summary)}</h3><p>${esc(l.core)}</p><p>${esc(l.contribution)}</p><p class="role">${esc(l.use)}</p></div>
      <div class="panel"><h3>${esc(l.labels.caution)}</h3><p>${esc(l.role)}</p><p>${esc(l.limitation)}</p></div>
      <div class="panel habit-panel"><h3>${esc(l.labels.habit)}</h3><p>${esc(habitPhrase(card, locale))}</p></div>
      <div class="panel"><h3>${esc(l.labels.verification)}</h3><div class="meta">${verificationStatus(card, l, locale)}${detailMeta(card, l, locale)}</div></div>
      <div class="panel"><h3>${esc(l.labels.cite)}</h3><div class="citation">${esc(card.citation)}</div></div>
    </div></section>
  </article>
</section>`;
  }).join("\n");
  const allSections = wildcardDetailSections(locale) + sections;
  return htmlShell(locale, l0.deckTitle, `<header class="detail-toolbar"><strong>${esc(l0.deckTitle)}</strong><nav><a href="mtc_cards_new_proposal_${locale}.html">${esc(l0.back)}</a><button onclick="window.close()">${esc(l0.close)}</button></nav></header><main>${allSections}</main><script>
function show(){const id=new URLSearchParams(location.search).get('card')||'MTC01';document.querySelectorAll('.detail-target').forEach(s=>s.classList.remove('active'));const el=document.getElementById('review-'+id);(el||document.getElementById('review-MTC01')).classList.add('active');}
show();
</script>`);
}

function htmlShell(locale, title, body) {
  return `<!doctype html>
<html lang="${locale}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<style>
:root{font-family:Inter,Arial,sans-serif;color:#172033;background:#eef2f7}body{margin:0}.toolbar,.detail-toolbar{position:sticky;top:0;z-index:5;background:#fff;border-bottom:1px solid #d8dee8;padding:12px 18px;display:flex;gap:12px;align-items:center}.toolbar h1{font-size:18px;margin:0;flex:1}.toolbar input{min-width:260px;max-width:520px;flex:1;border:1px solid #cbd5e1;border-radius:6px;padding:9px 10px;font:inherit}.toolbar button,.detail-toolbar button,.detail-toolbar a{border:0;background:#172033;color:#fff;border-radius:6px;padding:9px 12px;text-decoration:none;font:inherit}.method-note{margin:14px 18px 0;padding:12px 14px;border:1px solid #d8dee8;border-left:6px solid #172033;background:#fff;border-radius:8px;line-height:1.4}.deck{display:grid;grid-template-columns:repeat(auto-fill,minmax(330px,1fr));gap:18px;padding:18px}.mtc-card{display:block;text-decoration:none;color:inherit;background:#fff;border:1px solid color-mix(in srgb,var(--accent) 45%,#d7dde6);border-top:6px solid var(--accent);border-radius:8px;overflow:hidden;box-shadow:0 10px 24px #0f172a14}.mtc-card:hover{outline:2px solid var(--accent);outline-offset:2px}.mtc-card header{height:48px;background:var(--accent);color:#fff;display:flex;justify-content:space-between;align-items:center;padding:0 16px;font-weight:800}.mtc-card header span{font-size:21px}figure{margin:0;background:#e5e7eb}figure img,figure svg{display:block;width:100%;aspect-ratio:1.35/1;object-fit:cover}.body{padding:14px 16px}.category{margin:0 0 6px;color:var(--cat);font-weight:800;font-size:12px;text-transform:uppercase;border-left:5px solid var(--cat);padding-left:7px}.body h2{font-size:20px;line-height:1.08;margin:0 0 10px}.badges{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px}.badges span,.role,.habit{background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:5px 7px;font-size:12px}.habit{border-left:4px solid var(--accent);line-height:1.35}.badges span:first-child{border-color:var(--accent);color:var(--accent);font-weight:800}.academic-strip{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:0 0 10px}.academic-strip div{background:color-mix(in srgb,var(--accent) 9%,#fff);border:1px solid color-mix(in srgb,var(--accent) 36%,#d8dee8);border-radius:6px;padding:6px;text-align:center}.academic-strip span{display:block;font-size:9px;color:#475569;text-transform:uppercase;font-weight:900}.academic-strip b{display:block;font-size:16px;line-height:1.05;color:var(--accent);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.metrics{display:grid;grid-template-columns:repeat(auto-fit,minmax(72px,1fr));gap:6px;margin:0 0 11px}.metric{border:1px solid #e2e8f0;background:#f8fafc;border-radius:6px;padding:6px 4px;text-align:center}.metric span{display:block;font-size:10px;color:#475569;font-weight:800}.metric b{display:block;font-size:18px;line-height:1;color:var(--accent)}dl{display:grid;grid-template-columns:110px 1fr;gap:7px 10px;margin:12px 0 0}dt{font-size:11px;text-transform:uppercase;color:#64748b;font-weight:800}dd{margin:0;font-size:13px;line-height:1.28}footer{border-top:1px solid #e2e8f0;padding:10px 16px;font-size:12px;color:#475569}.detail-toolbar{justify-content:space-between}.detail-toolbar nav{display:flex;gap:10px}.detail-target{display:none}.detail-target.active{display:block}.detail-panel{width:min(1120px,calc(100vw - 28px));margin:18px auto 28px;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 18px 40px #0f172a24;border-top:7px solid var(--accent)}.detail-head{background:var(--accent);color:#fff;padding:16px 20px;display:grid;grid-template-columns:1fr auto;gap:12px}.detail-head p{margin:0;font-size:12px;font-weight:800;text-transform:uppercase}.detail-head h2{margin:4px 0 0;font-size:26px}.detail-head a{align-self:start;color:#fff;background:#ffffff22;border-radius:6px;text-decoration:none;padding:8px 10px}.detail-body{display:grid;grid-template-columns:minmax(260px,360px) 1fr;gap:18px;padding:18px}.visual img,.visual svg{width:100%;border-radius:8px;border:1px solid #d8dee8}.panel{border:1px solid #d8dee8;border-radius:8px;padding:14px;margin-bottom:14px}.panel h3{margin:0 0 8px;font-size:15px}.panel p{margin:0 0 8px;line-height:1.45}.habit-panel{border-left:5px solid var(--accent)}.meta{display:grid;grid-template-columns:160px 1fr;gap:8px;font-size:14px}.meta b{color:#475569}.citation{font-family:Georgia,serif;background:#f8fafc;border-radius:8px;padding:12px;line-height:1.45}@media(max-width:760px){.toolbar,.detail-toolbar{align-items:flex-start;flex-direction:column}.toolbar input{min-width:0;width:100%}.detail-body,.meta{grid-template-columns:1fr}.metrics,.academic-strip{grid-template-columns:repeat(2,1fr)}}@media print{.toolbar,.detail-toolbar,.method-note{display:none}.deck{grid-template-columns:repeat(2,1fr);gap:8mm;padding:0}.mtc-card{break-inside:avoid;box-shadow:none}}
</style>
</head>
<body>${body}</body>
</html>`;
}

fs.writeFileSync(path.join(outDir, "mtc_cards_new_proposal_es.html"), deckHtml("es"), "utf8");
fs.writeFileSync(path.join(outDir, "mtc_cards_new_proposal_en.html"), deckHtml("en"), "utf8");
fs.writeFileSync(path.join(outDir, "mtc_card_details_es.html"), detailHtml("es"), "utf8");
fs.writeFileSync(path.join(outDir, "mtc_card_details_en.html"), detailHtml("en"), "utf8");
fs.writeFileSync(path.join(outDir, "mtc_cards_critical_dataset.json"), JSON.stringify(cards, null, 2), "utf8");
console.log(`Built critical 49-card deck in ${outDir}`);
