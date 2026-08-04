#!/usr/bin/env node
/**
 * Pith static-site build.
 *
 * Reads only PUBLISHED pieces (published/[NNN]-[slug]/pith-[NNN]-[slug]-v[X.Y].md),
 * enforces the publish standard, resolves [[wiki-links]] between pieces, and emits a
 * static site into dist/. Drafts and transcripts are never published.
 *
 * Run:  npm run build      (writes dist/)
 *       npm run serve      (build + local preview at http://localhost:8080)
 *
 * The publish standard (see PUBLISHING.md / skills/pith.md):
 *   - folder name must match ^\d{3}-[a-z0-9-]+$        e.g. 001-why-we-build
 *   - at least one pith-[NNN]-[slug]-v[major].[minor].md inside it
 *   - the live page is the HIGHEST version; older versions are kept as history, not published
 *   - the piece's H1 must be:  # Pith-[NNN] | [Title] v[X.Y]
 *   - a byline line (*...*) must follow the H1
 */

const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const ROOT = __dirname;
const PUBLISHED_DIR = path.join(ROOT, 'published');
const ASSETS_DIR = path.join(ROOT, 'assets');
const CONTENT_BANK = path.join(ROOT, 'content-bank.md');
const OUT = path.join(ROOT, 'dist');

const SITE = {
  name: 'Pith',
  // Fallback meta description only (not shown on the page). Pieces use their own dek.
  tagline: 'Long-form opinion from Satsuma Ventures.',
  url: 'https://pith.satsumaventures.com',
};

const warnings = [];
const warn = (m) => { warnings.push(m); console.warn('  ⚠ ' + m); };

/* ── helpers ─────────────────────────────────────────────────────────── */

const FOLDER_RE = /^(\d{3})-([a-z0-9-]+)$/;
const FILE_RE = /^pith-(\d{3})-([a-z0-9-]+)-v(\d+)\.(\d+)\.md$/;
const H1_RE = /^#\s+Pith-(\d{3})\s*\|\s*(.+?)\s+v(\d+\.\d+)\s*$/;

const cmpVersion = (a, b) => a.major - b.major || a.minor - b.minor;

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
}

/** Parse the Published Index table in content-bank.md → { 'Pith-001': '2026-08-03', ... } */
function readPublishedDates() {
  const dates = {};
  if (!fs.existsSync(CONTENT_BANK)) return dates;
  const text = fs.readFileSync(CONTENT_BANK, 'utf8');
  const rows = text.split('\n').filter((l) => /^\|\s*Pith-\d{3}/.test(l));
  for (const row of rows) {
    const cells = row.split('|').map((c) => c.trim());
    // | # | Title | Version | Published |
    const id = cells[1];
    const published = cells[4];
    if (id && published) dates[id] = published;
  }
  return dates;
}

function fmtDate(iso) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso || '';
  const [y, m, d] = iso.split('-').map(Number);
  const months = ['January','February','March','April','May','June','July',
    'August','September','October','November','December'];
  return `${months[m - 1]} ${d}, ${y}`;
}

/* ── discovery: find the live version of every published piece ───────── */

function discover(publishedDates) {
  if (!fs.existsSync(PUBLISHED_DIR)) return [];
  const pieces = [];

  for (const folder of fs.readdirSync(PUBLISHED_DIR).sort()) {
    const folderPath = path.join(PUBLISHED_DIR, folder);
    if (!fs.statSync(folderPath).isDirectory()) continue;

    const fm = folder.match(FOLDER_RE);
    if (!fm) { warn(`Skipping "${folder}": folder name must be [NNN]-[slug].`); continue; }
    const [, num, slug] = fm;

    // collect every published version file, pick the highest
    const versions = [];
    for (const file of fs.readdirSync(folderPath)) {
      const vm = file.match(FILE_RE);
      if (!vm) continue;
      if (vm[1] !== num || vm[2] !== slug) {
        warn(`"${folder}/${file}": number/slug doesn't match its folder — skipped.`);
        continue;
      }
      versions.push({ file, major: +vm[3], minor: +vm[4] });
    }
    if (!versions.length) {
      warn(`Skipping "${folder}": no pith-${num}-${slug}-vX.Y.md file found.`);
      continue;
    }
    versions.sort(cmpVersion);
    const live = versions[versions.length - 1];

    const raw = fs.readFileSync(path.join(folderPath, live.file), 'utf8');
    const parsed = parsePiece(raw, folder, live.file);
    if (!parsed) continue;

    pieces.push({
      num, slug,
      url: `/${slug}/`,
      version: parsed.version,
      title: parsed.title,
      byline: parsed.byline,
      body: parsed.body,
      date: publishedDates[`Pith-${num}`] || parsed.bylineDate || '',
      historyCount: versions.length,
    });
  }

  pieces.sort((a, b) => Number(b.num) - Number(a.num)); // newest first
  return pieces;
}

/** Pull H1 (num/title/version), byline, and body out of a published .md file. */
function parsePiece(raw, folder, file) {
  const lines = raw.replace(/\r\n/g, '\n').split('\n');

  let i = 0;
  while (i < lines.length && lines[i].trim() === '') i++;
  const h1m = (lines[i] || '').match(H1_RE);
  if (!h1m) {
    warn(`"${folder}/${file}": H1 must be "# Pith-[NNN] | [Title] v[X.Y]" — piece skipped.`);
    return null;
  }
  const title = h1m[2].trim();
  const version = h1m[3];
  i++;

  // byline: first italic line after the H1
  while (i < lines.length && lines[i].trim() === '') i++;
  let byline = '';
  if (/^\*.*\*\s*$/.test((lines[i] || '').trim())) {
    byline = lines[i].trim().replace(/^\*|\*$/g, '').trim();
    i++;
  } else {
    warn(`"${folder}/${file}": no byline line (*...*) after the H1.`);
  }

  // remaining body; drop a single leading horizontal rule
  let rest = lines.slice(i).join('\n').trim();
  rest = rest.replace(/^---+\s*\n/, '').trim();

  const bylineDate = (byline.match(/([A-Z][a-z]+ \d{4})/) || [])[1] || '';
  return { title, version, byline, body: rest, bylineDate };
}

/* ── cross-links: [[slug]] · [[001]] · [[pith-001]] · [[slug|label]] ─── */

function buildResolver(pieces) {
  const bySlug = new Map(pieces.map((p) => [p.slug, p]));
  const byNum = new Map(pieces.map((p) => [p.num, p]));

  return function resolveLinks(markdown, sourceSlug) {
    return markdown.replace(/\[\[([^\]]+)\]\]/g, (_, inner) => {
      let [target, label] = inner.split('|').map((s) => s.trim());
      let key = target.toLowerCase().replace(/^pith-/, '');
      const m = /^\d{1,3}$/.test(key)
        ? byNum.get(key.padStart(3, '0'))
        : bySlug.get(key);
      if (!m) {
        warn(`Unresolved [[${inner}]] in "${sourceSlug}".`);
        return `[[${inner}]]`; // leave visible so it's caught in review
      }
      return `[${label || m.title}](${m.url})`;
    });
  };
}

/* ── templating ──────────────────────────────────────────────────────── */

function layout({ title, description, bodyClass, main, canonical }) {
  const desc = escapeHtml(description || SITE.tagline);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${desc}">
  <meta property="og:site_name" content="Pith">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${desc}">
  <meta property="og:type" content="article">
  ${canonical ? `<link rel="canonical" href="${canonical}">` : ''}
  <link rel="icon" type="image/png" href="/assets/favicon/favicon-96x96.png" sizes="96x96">
  <link rel="icon" type="image/svg+xml" href="/assets/favicon/favicon.svg">
  <link rel="shortcut icon" href="/assets/favicon/favicon.ico">
  <link rel="apple-touch-icon" sizes="180x180" href="/assets/favicon/apple-touch-icon.png">
  <meta name="apple-mobile-web-app-title" content="Pith">
  <link rel="manifest" href="/assets/favicon/site.webmanifest">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Average&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/site.css">
</head>
<body class="${bodyClass || ''}">
  <header class="masthead">
    <div class="masthead-left">
      <a class="masthead-name" href="/">Pith</a>
      <a class="masthead-nav" href="/archive/">Archive</a>
    </div>
    <a class="masthead-brand" href="https://www.satsumaventures.com" aria-label="Satsuma Ventures">
      <span class="masthead-brand-label">A publication of</span>
      <img class="masthead-lockup" src="/assets/satsuma-lockup.svg" alt="Satsuma Ventures" width="132" height="44">
    </a>
  </header>
  <main class="wrap">
${main}
  </main>
  <div class="tree-bg" aria-hidden="true"></div>
  <footer class="site-foot">
    <div class="wrap">
      <span>Pith — <a href="https://www.satsumaventures.com">Satsuma Ventures</a></span>
      <span class="site-foot-note">Dictated, then shaped.</span>
    </div>
  </footer>
</body>
</html>`;
}

function archivePage(pieces) {
  const items = pieces.map((p) => `
      <li class="entry">
        <a class="entry-link" href="${p.url}">
          <span class="entry-num">Pith-${p.num}</span>
          <h2 class="entry-title">${escapeHtml(p.title)}</h2>
          ${p.dek ? `<p class="entry-dek">${escapeHtml(p.dek)}</p>` : ''}
          <span class="entry-meta">${p.date ? fmtDate(p.date) : ''}</span>
        </a>
      </li>`).join('\n');

  const empty = '<p class="archive-empty">No pieces published yet.</p>';
  const main = `
    <p class="kicker">Archive</p>
    <ol class="entries">
${items || empty}
    </ol>`;
  return layout({
    title: 'Archive — Pith',
    description: 'Every Pith piece, newest first.',
    bodyClass: 'archive', main,
    canonical: `${SITE.url}/archive/`,
  });
}

function piecePage(p, pieces, renderBody, colophonHtml, { atRoot = false } = {}) {
  const idx = pieces.findIndex((x) => x.slug === p.slug);
  const newer = pieces[idx - 1]; // pieces are newest-first
  const older = pieces[idx + 1];

  const nav = (newer || older) ? `
      <nav class="piece-nav">
        ${older ? `<a class="piece-nav-prev" href="${older.url}"><span>Earlier</span><strong>${escapeHtml(older.title)}</strong></a>` : '<span></span>'}
        ${newer ? `<a class="piece-nav-next" href="${newer.url}"><span>Later</span><strong>${escapeHtml(newer.title)}</strong></a>` : '<span></span>'}
      </nav>` : '';

  const main = `
    <article class="piece">
      <header class="piece-head">
        <p class="piece-num">Pith-${p.num}</p>
        <h1 class="piece-title">${escapeHtml(p.title)}</h1>
        ${p.byline ? `<p class="piece-byline">${escapeHtml(p.byline)}</p>` : ''}
      </header>
      <div class="prose">
${renderBody}
      </div>
${colophonHtml || ''}
    </article>
${nav}
    <p class="piece-back"><a href="/archive/">← The archive</a></p>`;
  // The latest piece is served at both "/" and "/<slug>/"; canonical always points to the slug.
  return layout({
    title: atRoot ? `Pith — ${p.title}` : `${p.title} — Pith-${p.num}`,
    description: p.dek || SITE.tagline,
    bodyClass: 'piece-page', main,
    canonical: `${SITE.url}${p.url}`,
  });
}

/* ── write helpers ───────────────────────────────────────────────────── */

function rmrf(dir) { fs.rmSync(dir, { recursive: true, force: true }); }
function writeFile(rel, content) {
  const full = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
}
function copyTree(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return;
  fs.mkdirSync(destDir, { recursive: true });
  for (const f of fs.readdirSync(srcDir)) {
    const s = path.join(srcDir, f);
    const d = path.join(destDir, f);
    if (fs.statSync(s).isDirectory()) copyTree(s, d);
    else fs.copyFileSync(s, d);
  }
}

/* ── main ────────────────────────────────────────────────────────────── */

function firstParagraph(html) {
  const m = html.match(/<p>([\s\S]*?)<\/p>/);
  if (!m) return '';
  const text = m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  return text.length > 200 ? text.slice(0, 197).trimEnd() + '…' : text;
}

/**
 * Split the essay from its closing colophon (author bio + "Dictated, then shaped").
 * Convention: the material after the FINAL horizontal rule is the colophon — but only
 * when it reads like attribution (every paragraph fully italicised), so a normal section
 * break that happens to be last is never mistaken for a colophon. This is what lets the
 * final `---` stop rendering as a "* * *" ornament: the boxed colophon marks the piece end,
 * and "* * *" now only ever means an interior section break.
 */
function splitColophon(md) {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  let idx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^-{3,}\s*$/.test(lines[i].trim())) idx = i;
  }
  if (idx === -1) return { essay: md, colophon: '' };

  const tail = lines.slice(idx + 1).join('\n').trim();
  const paras = tail.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean);
  const looksLikeColophon = paras.length > 0 && paras.every((p) => /^\*[\s\S]*\*$/.test(p));
  if (!looksLikeColophon) return { essay: md, colophon: '' };

  return { essay: lines.slice(0, idx).join('\n').trim(), colophon: paras };
}

/** Render the colophon paragraphs into a boxed bio section (upright, no italics). */
function colophonBox(paras) {
  if (!paras || !paras.length) return '';
  const items = paras.map((p, i) => {
    const inner = marked.parseInline(p.replace(/^\*|\*$/g, '').trim());
    const cls = i === 0 ? 'colophon-bio' : 'colophon-note';
    return `        <p class="${cls}">${inner}</p>`;
  }).join('\n');
  return `
      <aside class="colophon">
${items}
      </aside>`;
}

function main() {
  console.log('Building Pith…');
  const publishedDates = readPublishedDates();
  const pieces = discover(publishedDates);

  if (!pieces.length) {
    warn('No published pieces found. Site will have an empty index.');
  }

  const resolveLinks = buildResolver(pieces);
  marked.setOptions({ mangle: false, headerIds: false, smartypants: true });

  rmrf(OUT);
  fs.mkdirSync(OUT, { recursive: true });

  // render each piece: essay prose + a boxed colophon; capture a dek from the first paragraph
  for (const p of pieces) {
    const { essay, colophon } = splitColophon(p.body);
    const html = marked.parse(resolveLinks(essay, p.slug));
    p.renderedBody = html;
    p.colophonHtml = colophonBox(colophon);
    p.dek = firstParagraph(html);
  }

  for (const p of pieces) {
    writeFile(path.join(p.slug, 'index.html'), piecePage(p, pieces, p.renderedBody, p.colophonHtml));
  }
  // The site root is the latest piece; the full list lives at /archive/.
  if (pieces.length) {
    const latest = pieces[0]; // newest first
    writeFile('index.html', piecePage(latest, pieces, latest.renderedBody, latest.colophonHtml, { atRoot: true }));
  } else {
    writeFile('index.html', archivePage(pieces));
  }
  writeFile('archive/index.html', archivePage(pieces));

  // static assets (recursive — includes assets/favicon/)
  copyTree(ASSETS_DIR, path.join(OUT, 'assets'));

  // Pages needs the custom domain + no Jekyll processing
  if (fs.existsSync(path.join(ROOT, 'CNAME'))) {
    fs.copyFileSync(path.join(ROOT, 'CNAME'), path.join(OUT, 'CNAME'));
  }
  writeFile('.nojekyll', '');

  console.log(`\nPublished ${pieces.length} piece(s):`);
  for (const p of pieces) {
    console.log(`  Pith-${p.num}  ${p.title}  v${p.version}  → ${p.url}` +
      (p.historyCount > 1 ? `  (${p.historyCount} versions on file)` : ''));
  }
  console.log(`\nOutput: ${path.relative(process.cwd(), OUT)}/`);
  if (warnings.length) console.log(`${warnings.length} warning(s) above.`);
}

main();
