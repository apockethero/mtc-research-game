import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const redesignDir = path.resolve(import.meta.dirname);
const rootDir = path.resolve(redesignDir, "..", "..");
const outDir = path.join(redesignDir, "final_cards");
const cardsFile = path.join(redesignDir, "final_card_text_49.md");
const bibFile = path.resolve(redesignDir, "..", "references_paper1.bib");
const scimagoFile = path.join(rootDir, "scimagojr 2025.csv");
const apiKey = process.env.ELSEVIER_API_KEY || "";
const apiKeyId = apiKey ? crypto.createHash("sha256").update(apiKey).digest("hex").slice(0, 10) : "no_api";
const cacheFile = path.join(outDir, `mtc_elsevier_cache_${apiKeyId}.json`);
const cache = fs.existsSync(cacheFile) ? JSON.parse(fs.readFileSync(cacheFile, "utf8")) : {};
const delayMs = Number(process.env.ELSEVIER_DELAY_MS || 250);

if (!apiKey) {
  console.warn("ELSEVIER_API_KEY no definida. Se usara solo SCImago por titulo exacto/ISSN disponible.");
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function splitCsvLine(line, delimiter = ";") {
  const out = [];
  let current = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"' && line[i + 1] === '"') {
      current += '"';
      i += 1;
    } else if (ch === '"') {
      quoted = !quoted;
    } else if (ch === delimiter && !quoted) {
      out.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  out.push(current.trim());
  return out;
}

function normalizeIssn(value) {
  return String(value || "").toUpperCase().replace(/[^0-9X]/g, "");
}

function normalizeTitle(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function findColumn(headers, names) {
  const lower = headers.map((h) => h.toLowerCase().trim());
  for (const name of names) {
    const idx = lower.findIndex((h) => h === name || h.includes(name));
    if (idx >= 0) return idx;
  }
  return -1;
}

function parseScimago(file) {
  const lines = fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "").split(/\r?\n/).filter((line) => line.trim());
  const headers = splitCsvLine(lines[0], ";");
  const idx = {
    rank: findColumn(headers, ["rank"]),
    sourceid: findColumn(headers, ["sourceid"]),
    title: findColumn(headers, ["title"]),
    type: findColumn(headers, ["type"]),
    issn: findColumn(headers, ["issn"]),
    publisher: findColumn(headers, ["publisher"]),
    openAccess: findColumn(headers, ["open access"]),
    sjr: findColumn(headers, ["sjr"]),
    quartile: findColumn(headers, ["sjr best quartile"]),
    hIndex: findColumn(headers, ["h index"]),
    totalDocs2025: findColumn(headers, ["total docs. (2025)"]),
    totalCitations3y: findColumn(headers, ["total citations (3years)"]),
    citationsPerDoc2y: findColumn(headers, ["citations / doc. (2years)"]),
    country: findColumn(headers, ["country"]),
    region: findColumn(headers, ["region"]),
    coverage: findColumn(headers, ["coverage"]),
    categories: findColumn(headers, ["categories"]),
    areas: findColumn(headers, ["areas"])
  };
  const byIssn = new Map();
  const byTitle = new Map();
  for (const line of lines.slice(1)) {
    const cells = splitCsvLine(line, ";");
    const row = {
      rank: cells[idx.rank] || "",
      sourceid: cells[idx.sourceid] || "",
      title: cells[idx.title] || "",
      type: cells[idx.type] || "",
      issn: cells[idx.issn] || "",
      publisher: cells[idx.publisher] || "",
      openAccess: cells[idx.openAccess] || "",
      sjr: cells[idx.sjr] || "",
      quartile: cells[idx.quartile] || "",
      hIndex: cells[idx.hIndex] || "",
      totalDocs2025: cells[idx.totalDocs2025] || "",
      totalCitations3y: cells[idx.totalCitations3y] || "",
      citationsPerDoc2y: cells[idx.citationsPerDoc2y] || "",
      country: cells[idx.country] || "",
      region: cells[idx.region] || "",
      coverage: cells[idx.coverage] || "",
      categories: cells[idx.categories] || "",
      areas: cells[idx.areas] || ""
    };
    for (const issn of row.issn.split(/[,\s;]+/).map(normalizeIssn).filter(Boolean)) {
      if (!byIssn.has(issn)) byIssn.set(issn, row);
    }
    const titleKey = normalizeTitle(row.title);
    if (titleKey && !byTitle.has(titleKey)) byTitle.set(titleKey, row);
  }
  return { byIssn, byTitle, count: lines.length - 1 };
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

function parseCards(markdown) {
  const escapedPipe = "__PIPE__";
  return markdown.split(/\r?\n/)
    .filter((line) => line.startsWith("| MTC"))
    .map((line) => line.replace(/\\\|/g, escapedPipe))
    .map((line) => line.trim().slice(1, -1).split("|").map((cell) => cell.trim().replaceAll(escapedPipe, "|")))
    .map(([id, category, quality, title, evidence, core, contribution, limitation, trace]) => ({
      id, category, quality, title, evidence, core, contribution, limitation, trace,
      sourceKey: String(trace).split("|")[0].trim()
    }));
}

function doi(entry) {
  return cleanBib(entry?.doi || "").replace(/^https?:\/\/doi.org\//i, "");
}

function sourceTitle(entry) {
  return cleanBib(entry?.journal || entry?.journaltitle || entry?.booktitle || entry?.publisher || "");
}

function csvCell(value) {
  const text = String(value ?? "");
  return /[",;\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

async function requestJson(url, cacheKey) {
  if (!apiKey) return null;
  if (cache[cacheKey]) return cache[cacheKey];
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "X-ELS-APIKey": apiKey
    }
  });
  const text = await response.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw_text: text.slice(0, 2000) };
  }
  const item = {
    url: url.replace(apiKey, "[REDACTED]"),
    status: response.status,
    ok: response.ok,
    checked_at: new Date().toISOString(),
    json
  };
  cache[cacheKey] = item;
  fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2), "utf8");
  await wait(delayMs);
  return item;
}

async function queryScopusByDoi(value) {
  if (!value) return null;
  const params = new URLSearchParams({
    query: `DOI("${value}")`,
    count: "1",
    field: "dc:identifier,dc:title,prism:doi,prism:publicationName,prism:issn,prism:eIssn,citedby-count,subtypeDescription,source-id,prism:coverDate"
  });
  return requestJson(`https://api.elsevier.com/content/search/scopus?${params.toString()}`, `scopus-doi:${value}`);
}

async function querySerialByIssn(issn) {
  if (!issn) return null;
  return requestJson(`https://api.elsevier.com/content/serial/title/issn/${issn}`, `serial-issn-basic:${issn}`);
}

function first(...values) {
  for (const value of values) {
    const text = String(value ?? "").trim();
    if (text) return text;
  }
  return "";
}

function parseScopusSearch(result) {
  const entry = result?.json?.["search-results"]?.entry?.[0];
  if (!entry || entry.error) return {};
  return {
    scopus_document_found: "si",
    scopus_citations: first(entry["citedby-count"]),
    scopus_source_id: first(entry["source-id"]),
    scopus_doc_type: first(entry.subtypeDescription),
    scopus_publication_name: first(entry["prism:publicationName"]),
    scopus_issn: first(entry["prism:issn"]),
    scopus_eissn: first(entry["prism:eIssn"]),
    scopus_cover_date: first(entry["prism:coverDate"])
  };
}

function parseSerial(result) {
  const entry = result?.json?.["serial-metadata-response"]?.entry?.[0];
  if (!entry) return {};
  const citeScore = entry.citeScoreYearInfoList?.citeScoreCurrentMetric || entry.citeScoreYearInfoList?.citeScoreCurrentMetricYear || "";
  return {
    serial_source_found: "si",
    serial_title: first(entry["dc:title"]),
    serial_source_id: first(entry["source-id"]),
    serial_issn: first(entry["prism:issn"]),
    serial_eissn: first(entry["prism:eIssn"]),
    citescore: first(citeScore),
    serial_coverage: first(entry.coverageStartYear, "") + (entry.coverageEndYear ? `-${entry.coverageEndYear}` : "")
  };
}

function classifyPublication(entry, scopus, scimago) {
  const type = String(entry?.type || "").toLowerCase();
  const scimagoType = String(scimago?.type || "").toLowerCase();
  if (/^Q[1-4]$/.test(scimago?.quartile || "")) return scimago.quartile;
  if (scimagoType.includes("conference") || type.includes("inproceedings")) return "Proceedings";
  if (type.includes("incollection")) return "Chapter";
  if (scimago) return "Scopus-NQ";
  if (type.includes("inproceedings")) return "Proceedings";
  if (type.includes("incollection")) return "Chapter";
  if (type.includes("article")) return "NQ";
  if (type.includes("book")) return "Book";
  return "NQ";
}

function points(indicatorClass) {
  return { Q1: 5, Q2: 4, Q3: 3, Q4: 2, Proceedings: 1, Chapter: 1, "Scopus-NQ": 1, Book: 1, NQ: 0 }[indicatorClass] ?? 0;
}

const scimago = parseScimago(scimagoFile);
const bibliography = parseBib(fs.readFileSync(bibFile, "utf8"));
const cards = parseCards(fs.readFileSync(cardsFile, "utf8"));
const enriched = [];

for (const card of cards) {
  const entry = bibliography.get(card.sourceKey);
  const d = doi(entry);
  console.log(`${card.id} ${card.sourceKey} ${d || sourceTitle(entry)}`);
  const scopusRaw = await queryScopusByDoi(d);
  const scopusInfo = parseScopusSearch(scopusRaw);
  const issnCandidates = [
    scopusInfo.scopus_issn,
    scopusInfo.scopus_eissn,
    entry?.issn
  ].flatMap((v) => String(v || "").split(/[;,\s]+/)).map(normalizeIssn).filter((v) => v.length === 8);

  let serialInfo = {};
  for (const issn of issnCandidates) {
    serialInfo = parseSerial(await querySerialByIssn(issn));
    if (serialInfo.serial_source_found === "si") break;
  }

  const allIssns = [...new Set([
    ...issnCandidates,
    serialInfo.serial_issn,
    serialInfo.serial_eissn
  ].flatMap((v) => String(v || "").split(/[;,\s]+/)).map(normalizeIssn).filter((v) => v.length === 8))];

  let scimagoMatch = allIssns.map((issn) => scimago.byIssn.get(issn)).find(Boolean);
  let matchMethod = scimagoMatch ? "ISSN" : "";
  if (!scimagoMatch) {
    const titleKeys = [scopusInfo.scopus_publication_name, serialInfo.serial_title, sourceTitle(entry)].map(normalizeTitle).filter(Boolean);
    scimagoMatch = titleKeys.map((t) => scimago.byTitle.get(t)).find(Boolean);
    matchMethod = scimagoMatch ? "titulo exacto normalizado" : "";
  }

  const indicatorClass = classifyPublication(entry, scopusInfo, scimagoMatch);
  enriched.push({
    card_id: card.id,
    source_key: card.sourceKey,
    title: entry?.title || card.title,
    source_title_bib: sourceTitle(entry),
    doi: d,
    year: entry?.year || card.trace.match(/\b(19|20)\d{2}\b/)?.[0] || "",
    bib_type: entry?.type || "",
    scopus_indexado: scopusInfo.scopus_document_found === "si" || serialInfo.serial_source_found === "si" ? "si" : "no",
    scopus_documento_encontrado: scopusInfo.scopus_document_found || "no",
    scopus_citas: scopusInfo.scopus_citations || "",
    scopus_tipo_documento: scopusInfo.scopus_doc_type || "",
    scopus_source_id: scopusInfo.scopus_source_id || serialInfo.serial_source_id || "",
    citescore: serialInfo.citescore || "",
    scopus_publication_name: scopusInfo.scopus_publication_name || serialInfo.serial_title || "",
    issn_verificados: allIssns.join("; "),
    scimago_match_2025: scimagoMatch ? "si" : "no",
    scimago_match_metodo: matchMethod,
    scimago_title: scimagoMatch?.title || "",
    scimago_sourceid: scimagoMatch?.sourceid || "",
    scimago_type: scimagoMatch?.type || "",
    sjr: scimagoMatch?.sjr || "",
    cuartil_sjr: scimagoMatch?.quartile || "",
    h_index_fuente_scimago: scimagoMatch?.hIndex || "",
    scimago_rank_2025: scimagoMatch?.rank || "",
    scimago_total_docs_2025: scimagoMatch?.totalDocs2025 || "",
    scimago_total_citations_3y: scimagoMatch?.totalCitations3y || "",
    scimago_citations_per_doc_2y: scimagoMatch?.citationsPerDoc2y || "",
    scimago_country: scimagoMatch?.country || "",
    scimago_categories: scimagoMatch?.categories || "",
    scimago_areas: scimagoMatch?.areas || "",
    clase_documental_verificada: indicatorClass,
    valor_documental: points(indicatorClass),
    fuentes_indicadores: [
      scopusRaw ? `Elsevier Scopus Search API ${scopusRaw.checked_at?.slice(0, 10)} status ${scopusRaw.status}` : "",
      serialInfo.serial_source_found === "si" ? "Elsevier Serial Title API" : "",
      scimagoMatch ? `SCImago Journal Rank 2025 por ${matchMethod}` : ""
    ].filter(Boolean).join(" | ")
  });
}

fs.mkdirSync(outDir, { recursive: true });
const jsonOut = path.join(outDir, "mtc_card_indicators_scopus_scimago_2025.json");
fs.writeFileSync(jsonOut, JSON.stringify(enriched, null, 2), "utf8");
const headers = Object.keys(enriched[0] || {});
const csvOut = path.join(outDir, "mtc_card_indicators_scopus_scimago_2025.csv");
fs.writeFileSync(csvOut, [headers.join(",")].concat(enriched.map((row) => headers.map((h) => csvCell(row[h])).join(","))).join("\n"), "utf8");

const quartiles = new Map();
for (const row of enriched) quartiles.set(row.clase_documental_verificada, (quartiles.get(row.clase_documental_verificada) || 0) + 1);
const summary = `# Indicadores verificados para las 49 cartas MTC

Fecha: ${new Date().toISOString()}

| Indicador | Valor |
|---|---:|
| Cartas | ${enriched.length} |
| Documentos encontrados en Scopus por DOI | ${enriched.filter((r) => r.scopus_documento_encontrado === "si").length} |
| Fuentes con match SCImago 2025 | ${enriched.filter((r) => r.scimago_match_2025 === "si").length} |
| Cartas con CiteScore | ${enriched.filter((r) => r.citescore).length} |
| Cartas con SJR/cuartil | ${enriched.filter((r) => r.cuartil_sjr).length} |

## Distribucion documental verificada

| Clase | Cartas |
|---|---:|
${[...quartiles.entries()].sort().map(([k, v]) => `| ${k} | ${v} |`).join("\n")}

## Regla

- SJR, cuartil e H-index de fuente provienen de SCImago 2025.
- Scopus, CiteScore y citaciones Scopus provienen de Elsevier API.
- Si no hay match por ISSN o titulo exacto normalizado, no se asigna cuartil.
- La clase antigua de la carta no se usa como verdad; se reemplaza por \`clase_documental_verificada\`.
`;
fs.writeFileSync(path.join(outDir, "resumen_mtc_card_indicators_2025.md"), summary, "utf8");

console.log(`JSON: ${jsonOut}`);
console.log(`CSV: ${csvOut}`);
console.log(`Resumen: ${path.join(outDir, "resumen_mtc_card_indicators_2025.md")}`);
