import fs from "node:fs";
import https from "node:https";
import path from "node:path";

const redesignDir = path.resolve(import.meta.dirname);
const datasetFile = path.join(redesignDir, "final_cards", "mtc_cards_critical_dataset.json");
const outFile = path.join(redesignDir, "final_cards", "bibliometrics_openalex.json");

const cards = JSON.parse(fs.readFileSync(datasetFile, "utf8"));
const date = new Date().toISOString().slice(0, 10);

function getJson(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { "User-Agent": "MTC-card-audit/1.0 mailto:local@example.com" } }, (res) => {
      let body = "";
      res.on("data", (chunk) => body += chunk);
      res.on("end", () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          resolve({ ok: false, status: res.statusCode, body: body.slice(0, 200) });
          return;
        }
        try {
          resolve({ ok: true, data: JSON.parse(body) });
        } catch (error) {
          resolve({ ok: false, status: "json", body: error.message });
        }
      });
    }).on("error", (error) => resolve({ ok: false, status: "network", body: error.message }));
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const results = {};
const sourceCache = new Map();
for (const card of cards) {
  if (!card.doi) {
    results[card.id] = {
      source: "OpenAlex",
      queryDate: date,
      status: "no-local-doi",
      citedByCount: null,
      venueHIndex: null,
      openAlexWork: null,
      openAlexSource: null
    };
    continue;
  }

  const doi = card.doi.replace(/^https?:\/\/doi.org\//i, "");
  const url = "https://api.openalex.org/works/https://doi.org/" + encodeURIComponent(doi);
  const response = await getJson(url);
  if (!response.ok) {
    results[card.id] = {
      source: "OpenAlex",
      queryDate: date,
      status: `lookup-failed:${response.status}`,
      citedByCount: null,
      venueHIndex: null,
      openAlexWork: null,
      openAlexSource: null
    };
    await sleep(120);
    continue;
  }

  const work = response.data;
  const source = work.primary_location?.source || work.locations?.find((location) => location.source)?.source || null;
  let sourceDetail = null;
  if (source?.id) {
    if (sourceCache.has(source.id)) {
      sourceDetail = sourceCache.get(source.id);
    } else {
      const sourceResponse = await getJson(source.id);
      sourceDetail = sourceResponse.ok ? sourceResponse.data : null;
      sourceCache.set(source.id, sourceDetail);
      await sleep(120);
    }
  }
  results[card.id] = {
    source: "OpenAlex",
    queryDate: date,
    status: "ok",
    citedByCount: Number.isFinite(work.cited_by_count) ? work.cited_by_count : null,
    venueHIndex: Number.isFinite(sourceDetail?.summary_stats?.h_index) ? sourceDetail.summary_stats.h_index : null,
    openAlexWork: work.id || null,
    openAlexSource: source?.id || null,
    openAlexSourceName: source?.display_name || null
  };
  await sleep(120);
}

fs.writeFileSync(outFile, JSON.stringify(results, null, 2), "utf8");
console.log(`Wrote ${Object.keys(results).length} records to ${outFile}`);
