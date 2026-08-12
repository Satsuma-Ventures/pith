# Pith — Publishing Standard

What it takes for a piece to appear on https://pith.satsumaventures.com. The build
(`build.js`) enforces this mechanically: anything that doesn't meet the standard is skipped
with a warning rather than published silently.

## What gets published

Only files under `published/[NNN]-[slug]/` are candidates. Everything in `drafts/` and
every `transcript-*.md` is ignored. For each published folder, the build serves the
**single highest version** — older `v*.md` files are kept as history but not published.

## The standard (all required)

1. **Folder name** matches `^\d{3}-[a-z0-9-]+$` — e.g. `001-why-we-build`. The number is the
   permanent Pith number; the slug becomes the URL (`/why-we-build/`).
2. **At least one piece file** named `pith-[NNN]-[slug]-v[major].[minor].md`, where `[NNN]`
   and `[slug]` match the folder exactly — e.g. `pith-001-why-we-build-v1.0.md`.
3. **First heading** is exactly:

   ```
   # Pith-[NNN] | [Title] v[X.Y]
   ```

   The build reads the number, title, and version from this line. It must agree with the
   folder and filename.
4. **A byline line** immediately after the H1, italicised:

   ```
   *Matt Erstling · Satsuma · July 2026*
   ```

5. **Section breaks** use a horizontal rule (`---`) between movements; the build renders
   these as a centred `* * *` ornament. (The leading `---` right after the byline is
   optional and is dropped automatically.)
6. **Closing colophon** — the author bio and the "Dictated, then shaped." note, as the
   final block. See *Colophon convention* below — the build renders this as a distinct
   boxed section, so its format matters.

## Colophon convention (the bio box)

The material after the piece's **final `---`** is treated as the colophon and rendered in a
separate boxed section at the end of the piece (Plus Jakarta Sans, upright, not italic) —
visually distinct from the essay, so it clearly marks the end of the piece.

For the build to recognise it, **every paragraph after the final `---` must be fully
italicised** (wrapped in `*…*`), matching the attribution style. That is the signal. If the
tail is *not* all-italic, the build assumes it's a normal section and the `---` renders as a
`* * *` break instead. In practice:

```
…last line of the essay.

---

*Matt Erstling is the founder of Satsuma, a private family venture studio based in Seattle.*

*Dictated, then shaped. Every Pith piece starts as a conversation …*
```

- The **first** colophon paragraph renders as the bio; the rest render as smaller notes.
- Because the final `---` becomes the essay/colophon boundary, **`* * *` now only ever means
  an interior section break** — never "the piece is over." Don't add a trailing `* * *` to
  signal the end; the bio box does that.

## Numbering & versioning

Follows `pith.md` (the skill). Numbers are claimed at publish, in publish order. First
published version is `v1.0`; minor bumps (`v1.1`) for small edits, major (`v2.0`) for a
rewrite. Each bump is a **new file** in the same folder — never overwrite — so history is
preserved. The live page is always the highest version.

## The Published Index is the source of truth for dates

`content-bank.md` holds a **Published Index** table. The build reads the publish date for
each `Pith-NNN` from it (falling back to the byline's month/year if a row is missing). When
you publish or bump a piece, update that table in the same commit.

## Cross-links between pieces

Write wiki-links in the markdown body:

| You write | Resolves to |
|---|---|
| `[[why-we-build]]` | link to that piece, titled with its real title |
| `[[001]]` or `[[pith-001]]` | same, by number |
| `[[why-we-build\|read the manifesto]]` | same link, custom anchor text |

Links resolve at build time against the set of published pieces, so they survive slug or
number changes. An unresolved link is left visible as `[[…]]` in the output **and** printed
as a build warning — check the build log before pushing.

## Publish checklist

- [ ] Folder is `published/[NNN]-[slug]/`, number claimed in publish order
- [ ] Piece file `pith-[NNN]-[slug]-v[X.Y].md` present; older versions kept, not deleted
- [ ] H1, byline, and closing attribution match the standard
- [ ] Any references to other pieces use `[[…]]`
- [ ] Published Index in `content-bank.md` updated (number, title, version, date)
- [ ] `npm run build` is clean — **zero unresolved-link or standard warnings**
- [ ] Commit + push to `main` (CI builds and deploys)
