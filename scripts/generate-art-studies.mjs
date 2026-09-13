import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

import { pioneerStudies } from './generative-art-studies/pioneers.mjs';
import { contemporaryStudies } from './generative-art-studies/contemporary.mjs';
import { simulationStudies } from './generative-art-studies/simulations.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT = path.join(ROOT, 'public', 'pictures', 'generative-art-study');
const studies = [...pioneerStudies, ...contemporaryStudies, ...simulationStudies];

fs.mkdirSync(OUTPUT, { recursive: true });

for (const study of studies) {
  const svg = study.generate();
  fs.writeFileSync(path.join(OUTPUT, `${study.slug}.svg`), svg, 'utf8');
  const renderer = new Resvg(svg, {
    fitTo: { mode: 'width', value: 1600 },
    background: '#f6f0e7',
  });
  fs.writeFileSync(path.join(OUTPUT, `${study.slug}.png`), renderer.render().asPng());
}

const cards = studies.map((study, index) => `
  <article>
    <a href="./${study.slug}.png"><img src="./${study.slug}.png" alt="${study.title}" width="1600" height="1000"></a>
    <div><span>${String(index + 1).padStart(2, '0')}</span><h2>${study.title}</h2></div>
    <p>${study.description}</p>
    <nav><a href="./${study.slug}.png">PNG</a><a href="./${study.slug}.svg">SVG</a></nav>
  </article>`).join('');

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>OpenTaint generative art study</title>
  <style>
    :root{color-scheme:light;--paper:#f6f0e7;--ink:#191719;--soft:#6e6260;--red:#ca2121;--line:#d9cec2}
    *{box-sizing:border-box}body{margin:0;background:#fbf8f3;color:var(--ink);font-family:"JetBrains Mono",ui-monospace,monospace}
    header{max-width:1480px;margin:auto;padding:64px 28px 38px;border-bottom:1px solid var(--line)}
    h1{max-width:900px;margin:0;font-size:clamp(30px,5vw,64px);line-height:1.02;letter-spacing:-.055em}
    header p{max-width:760px;margin:20px 0 0;color:var(--soft);font:16px/1.65 system-ui,sans-serif}
    main{max-width:1480px;margin:auto;padding:42px 28px 80px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:56px 30px}
    article img{display:block;width:100%;height:auto;border:1px solid var(--line);background:var(--paper)}
    article>div{display:flex;align-items:baseline;gap:14px;margin-top:18px}article span{color:var(--red);font-size:12px}
    h2{margin:0;font-size:18px;letter-spacing:-.025em}article p{min-height:3.2em;margin:10px 0 0;color:var(--soft);font:14px/1.6 system-ui,sans-serif}
    nav{display:flex;gap:14px;margin-top:12px}a{color:inherit;text-decoration:none}nav a{font-size:11px;color:var(--red);text-transform:uppercase;letter-spacing:.12em}
    @media(max-width:760px){header{padding-top:40px}main{grid-template-columns:1fr;gap:44px}article p{min-height:0}}
  </style>
</head>
<body>
  <header><h1>Generative art<br>style study</h1><p>Neutral algorithmic compositions using the OpenTaint landing palette. These are studies of visual systems, not illustrations for specific posts. Randomness shapes the geometry; there is no paper grain or decorative noise. Select an image to inspect the full-size PNG.</p></header>
  <main>${cards}</main>
</body>
</html>`;

fs.writeFileSync(path.join(OUTPUT, 'index.html'), html, 'utf8');
fs.writeFileSync(path.join(OUTPUT, 'README.md'), `# Generative art style study\n\n${studies.map((study, index) => `${index + 1}. **${study.title}** — ${study.description}  \n   [PNG](./${study.slug}.png) · [SVG](./${study.slug}.svg)`).join('\n\n')}\n`, 'utf8');

console.log(`Generated ${studies.length} studies in ${path.relative(ROOT, OUTPUT)}`);
