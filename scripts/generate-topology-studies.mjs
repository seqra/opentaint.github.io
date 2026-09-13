import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

import { meshRelativeStudies } from './topology-studies/mesh-relatives.mjs';
import { latticeRelativeStudies } from './topology-studies/lattice-relatives.mjs';
import { hybridRelativeStudies } from './topology-studies/hybrid-relatives.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT = path.join(ROOT, 'public', 'pictures', 'generative-art-study', 'topology-studies');
const allStudies = [
  ...meshRelativeStudies,
  ...latticeRelativeStudies,
  ...hybridRelativeStudies,
];
const rejected = new Set([
  'connected-tree-forest',
   'constrained-void-field',
  'relaxed-ribbon-archipelago',
  'triangulated-flow-network',
]);
const studies = allStudies.filter((study) => !rejected.has(study.slug));

fs.mkdirSync(OUTPUT, { recursive: true });

for (const study of studies) {
  const svg = study.generate();
  fs.writeFileSync(path.join(OUTPUT, `${study.slug}.svg`), svg, 'utf8');
  const png = new Resvg(svg, {
    fitTo: { mode: 'width', value: 1600 },
    background: '#f6f0e7',
  }).render().asPng();
  fs.writeFileSync(path.join(OUTPUT, `${study.slug}.png`), png);
}

const cards = studies.map((study, index) => `
  <article>
    <a class="image" href="./${study.slug}.png"><img src="./${study.slug}.png" alt="${study.title}" width="1600" height="1000"></a>
    <div class="title"><span>${String(index + 1).padStart(2, '0')}</span><h2>${study.title}</h2></div>
    <p>${study.description}</p>
    <nav><a href="./${study.slug}.png">PNG</a><a href="./${study.slug}.svg">SVG</a></nav>
  </article>`).join('');

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>OpenTaint — Topology studies</title>
  <style>
    :root{--paper:#f6f0e7;--ink:#191719;--soft:#6e6260;--red:#ca2121;--line:#d9cec2}*{box-sizing:border-box}
    body{margin:0;background:#fbf8f3;color:var(--ink);font-family:"JetBrains Mono",ui-monospace,monospace}
    header,main{max-width:1480px;margin:auto}header{padding:64px 28px 40px;border-bottom:1px solid var(--line)}
    h1{max-width:980px;margin:0;font-size:clamp(30px,5vw,64px);line-height:1.02;letter-spacing:-.055em}
    header p{max-width:780px;margin:20px 0 0;color:var(--soft);font:16px/1.65 system-ui,sans-serif}
    main{padding:42px 28px 80px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:56px 30px}
    .image{display:block;border:1px solid var(--line);background:var(--paper)}img{display:block;width:100%;height:auto}
    .title{display:flex;align-items:baseline;gap:14px;margin-top:18px}.title span{color:var(--red);font-size:12px}
    h2{margin:0;font-size:18px;letter-spacing:-.025em}article p{min-height:3.2em;margin:10px 0 0;color:var(--soft);font:14px/1.6 system-ui,sans-serif}
    nav{display:flex;gap:14px;margin-top:12px}a{color:inherit;text-decoration:none}nav a{font-size:11px;color:var(--red);text-transform:uppercase;letter-spacing:.12em}
    @media(max-width:760px){header{padding-top:40px}main{grid-template-columns:1fr;gap:44px}article p{min-height:0}}
  </style>
</head>
<body>
  <header><h1>Topology studies</h1><p>${studies.length} revised systems built around the qualities that worked in Differential Mesh and Differential Lattice: visible connectivity, discrete geometry, generous negative space, and meaningful state encoded in red.</p></header>
  <main>${cards}</main>
</body></html>`;

fs.writeFileSync(path.join(OUTPUT, 'index.html'), html, 'utf8');
fs.writeFileSync(path.join(OUTPUT, 'README.md'), `# Topology studies\n\n${studies.length} deterministic mesh and lattice relatives in the OpenTaint palette. Connected Tree Forest, Constrained Void Field, Relaxed Ribbon Archipelago, and Triangulated Flow Network are intentionally excluded from this review.\n\n${studies.map((study, index) => `${index + 1}. **${study.title}** — ${study.description}  \n   [PNG](./${study.slug}.png) · [SVG](./${study.slug}.svg)`).join('\n\n')}\n`, 'utf8');

console.log(`Generated ${studies.length} topology studies in ${path.relative(ROOT, OUTPUT)}`);
