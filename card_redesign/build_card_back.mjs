import fs from "node:fs";
import path from "node:path";

const redesignDir = path.resolve(import.meta.dirname);
const outDir = path.join(redesignDir, "final_cards");
const backImage = "../card_back/mtc_card_back_art.png";

function buildHtml() {
  const backs = Array.from({ length: 49 }, (_, index) => `<article class="card-back" aria-label="Card back ${index + 1}">
  <img src="${backImage}" alt="">
</article>`).join("\n");

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Reverso cartas MTC</title>
<style>
:root{font-family:Inter,Arial,sans-serif;background:#f3f4f6;color:#172033}
body{margin:0}
.toolbar{position:sticky;top:0;z-index:5;background:#fff;border-bottom:1px solid #d8dee8;padding:12px 18px;display:flex;gap:12px;align-items:center}
.toolbar h1{font-size:18px;margin:0;flex:1}
.toolbar button{border:0;background:#172033;color:#fff;border-radius:6px;padding:9px 12px;cursor:pointer}
.deck{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:18px;padding:18px}
.card-back{background:#fff;border:1px solid #d7dde6;border-radius:8px;overflow:hidden;box-shadow:0 10px 24px #0f172a14;aspect-ratio:86/120}
.card-back img{width:100%;height:100%;display:block;object-fit:cover}
@media print{.toolbar{display:none}.deck{grid-template-columns:repeat(3,86mm);gap:4mm;padding:0}.card-back{width:86mm;height:120mm;break-inside:avoid;box-shadow:none;border:0;border-radius:0}}
</style>
</head>
<body>
<header class="toolbar"><h1>Reverso cartas MTC</h1><button onclick="window.print()">Imprimir / PDF</button></header>
<main class="deck">${backs}</main>
</body>
</html>`;
}

function buildTex() {
  const card = `\\begin{tikzpicture}[x=1mm,y=1mm]
  \\clip[rounded corners=2mm] (0,0) rectangle (86,120);
  \\node[anchor=south west,inner sep=0] at (0,0) {\\includegraphics[width=86mm,height=120mm]{${backImage}}};
  \\draw[white,line width=.25mm,rounded corners=2mm,opacity=.35] (1.2,1.2) rectangle (84.8,118.8);
\\end{tikzpicture}`;

  const cards = Array.from({ length: 49 }, () => card);
  const pages = [];
  for (let i = 0; i < cards.length; i += 9) {
    const rows = [];
    for (let r = i; r < Math.min(i + 9, cards.length); r += 3) {
      const row = cards.slice(r, Math.min(r + 3, cards.length));
      while (row.length < 3) row.push("");
      rows.push(`${row.join(" & ")} \\\\[4mm]`);
    }
    pages.push(`\\begin{tabular}{ccc}\n${rows.join("\n")}\n\\end{tabular}`);
  }

  return `\\documentclass[10pt]{article}
\\usepackage[paperwidth=297mm,paperheight=420mm,margin=8mm]{geometry}
\\usepackage{graphicx}
\\usepackage{xcolor}
\\usepackage{tikz}
\\pagestyle{empty}
\\setlength{\\parindent}{0pt}
\\begin{document}
\\noindent
${pages.join("\n\\newpage\n\\noindent\n")}
\\end{document}`;
}

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "mtc_cards_back.html"), buildHtml(), "utf8");
fs.writeFileSync(path.join(outDir, "mtc_cards_back.tex"), buildTex(), "utf8");
console.log(`Built card backs in ${outDir}`);
