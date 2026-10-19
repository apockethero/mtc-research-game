import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const finalDir = path.join(import.meta.dirname, "final_cards");
const figuresDir = path.join(root, "figures");
const input = path.join(finalDir, "mtc_cards_new_proposal_es.html");
const output = path.join(figuresDir, "deck_overview_52_cards.html");

const html = fs.readFileSync(input, "utf8");
const cardMatches = [...html.matchAll(/<a class="mtc-card[\s\S]*?<\/a>/g)].map((match) => match[0]).slice(0, 52);
const wildcardCards = cardMatches.slice(0, 3);
const sourceCards = cardMatches.slice(3);

if (cardMatches.length !== 52) {
  throw new Error(`Expected 52 cards, found ${cardMatches.length}`);
}

if (sourceCards.length !== 49) {
  throw new Error(`Expected 49 source cards, found ${sourceCards.length}`);
}

const css = `
<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<base href="../card_redesign/final_cards/">
<title>52 cartas MTC - vista de articulo</title>
<style>
${html.match(/<style>([\s\S]*?)<\/style>/)?.[1] ?? ""}
html, body {
  width: 2480px;
  height: 3508px;
  margin: 0;
  background: #ffffff;
  overflow: hidden;
}
body {
  padding: 56px 35px 54px;
  box-sizing: border-box;
}
.toolbar,
.method-note,
.detail-toolbar {
  display: none !important;
}
.article-title {
  display: flex;
  justify-content: space-between;
  align-items: end;
  margin: 0 0 28px;
  border-bottom: 4px solid #172033;
  padding-bottom: 18px;
  color: #172033;
  font-family: Inter, Arial, sans-serif;
}
.article-title h1 {
  font-size: 42px;
  line-height: 1;
  margin: 0;
}
.article-title p {
  margin: 0;
  color: #475569;
  font-size: 20px;
  font-weight: 700;
}
.scale-stage {
  width: 2406px;
  margin-left: 505px;
  transform: scale(0.58);
  transform-origin: top left;
}
.overview-layout {
  display: grid !important;
  grid-template-rows: auto auto;
  gap: 16px !important;
  padding: 0 !important;
}
.wildcard-row {
  display: grid;
  grid-template-columns: repeat(3, 330px);
  gap: 16px;
  justify-content: center;
}
.source-grid {
  display: grid;
  grid-template-columns: repeat(7, 330px);
  gap: 16px;
  justify-content: center;
}
.mtc-card {
  box-shadow: none !important;
}
.mtc-card .role,
.mtc-card .habit,
.mtc-card dl,
.mtc-card footer {
  display: none !important;
}
</style>
</head>
<body>
<header class="article-title">
  <h1>Conjunto completo de 52 cartas</h1>
  <p>49 fuentes documentales + 3 cartas metodologicas</p>
</header>
<div class="scale-stage">
<main class="overview-layout">
  <section class="wildcard-row">
${wildcardCards.join("\n")}
  </section>
  <section class="source-grid">
${sourceCards.join("\n")}
  </section>
</main>
</div>
</body>
</html>
`;

fs.writeFileSync(output, css, "utf8");
console.log(output);
