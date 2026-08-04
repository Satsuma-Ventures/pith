# Pith

Satsuma Ventures' thought-leadership publication — long-form written opinion on AI,
empowerment, and building well. Lives at **https://pith.satsumaventures.com**.

Pith is a markdown-first publication: you write pieces as markdown, and a small build
step turns the **published** ones into a static site. Drafts and interview transcripts
stay in the repo but are never published. See **[PUBLISHING.md](PUBLISHING.md)** for the
standard every published piece must meet, and the methodology skill (`pith.md`, in the
studio repo) for how pieces get written.

## Layout

```
pith/
  build.js              ← the generator (reads published/, writes dist/)
  content-bank.md       ← surplus insights + the Published Index (source of truth for numbers/dates)
  PUBLISHING.md         ← the publish standard + [[wiki-link]] reference
  published/
    [NNN]-[slug]/                        ← one folder per published piece
      transcript-[date].md               ← interview record (not published)
      pith-[NNN]-[slug]-v[X.Y].md        ← the piece — new file per version bump
  drafts/
    tbdnumber-[slug]/                    ← in-progress pieces, no number yet (not published)
  assets/               ← brand css, logomark, favicon
  dist/                 ← generated site (git-ignored; built by CI)
```

## Working locally

```bash
npm install
npm run build      # writes dist/
npm run serve      # build + preview at http://localhost:8080
```

The build **only** publishes files under `published/[NNN]-[slug]/` that match the standard,
and for each piece it publishes the **highest version** on file. Older versions are kept
as history but are not served.

## Deploying

Every push to `main` triggers `.github/workflows/deploy.yml`, which runs the build and
deploys `dist/` to GitHub Pages. To publish a new piece: add its folder under `published/`,
update the Published Index in `content-bank.md`, commit, and push. That's the whole flow.

## Cross-linking (the WordPress-like part)

Inside any piece, link to another piece with a wiki-link:

```
As I argued in [[why-we-build]], the hammer was never the edge.
See [[002]] or [[pith-002|the sequel]] for where this goes next.
```

The build resolves `[[slug]]`, `[[NNN]]`, `[[pith-NNN]]`, and `[[target|label]]` to the
right URL and title. Links survive renumbering, and an unresolved link is left visible
(`[[like-this]]`) and reported as a build warning so it's caught before launch.
