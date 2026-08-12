# Public Interest Tech Library

A small, browsable catalog of **free learning resources for public sector
professionals** — the people building, buying, and governing the digital
services communities rely on. Each entry is tagged by topic, skill level, and
format so you can quickly find material that fits where you are and what you
need to do next.

> This is a small personal project I built to explore **Nuxt 4** and **Nuxt
> Content v3**. It is intentionally focused: real content, a real filtering UX,
> and a hand-authored design system, rather than a broad feature set.

## Why I built it

I wanted a hands-on way to learn the current Nuxt content stack end to end —
content-as-data with typed schemas, the v3 query API, composable-driven state,
URL-synced filters, SEO metadata, and static generation — using a subject I
actually care about. A resource directory is a good fit: it needs typed
structured content, a genuinely useful search/filter experience, and it
deploys cleanly as a static site.

## Tech choices

| Choice | Why |
| --- | --- |
| **Nuxt 4** | File-based routing, layouts, auto-imports, and first-class static generation with minimal config. |
| **TypeScript** | End-to-end types — including content frontmatter — catch mistakes at author time. |
| **Nuxt Content v3** | Content lives as Markdown with typed frontmatter. A Zod schema per collection validates entries at build time and generates the TypeScript types used across the app, so the content *is* the source of truth. |
| **Hand-authored CSS with design tokens** | No CSS framework. A single stylesheet defines CSS custom properties (color, spacing, type scale, radii, shadows); components reference the tokens. Small footprint, full control, and dark mode is a token remap. |

## Content model

Resources are Markdown files in `content/resources/`, validated by the
`resources` collection schema in `content.config.ts`:

- `title`, `description`, `provider`, `url` (validated as a URL)
- `tags` — 2–4 values from a fixed set (AI, Data, Digital Services,
  Procurement, Accessibility, Civic Engagement, Policy)
- `level` — Beginner / Intermediate / Advanced
- `format` — Course / Guide / Toolkit / Video

Because the schema drives the generated types, the filter unions
(`ResourceTag`, `ResourceLevel`, `ResourceFormat`) are derived from the content
type rather than duplicated — change the schema and the app types follow.

## Architecture

**Composable-based filtering.** All filter logic lives in
`app/composables/useResourceFilters.ts`, keeping the page component purely
presentational. The composable owns filter state, derives the available tag /
level / format options *dynamically from the content*, and returns the filtered
list, a live result count, and removable "active filter" descriptors.

**URL-synced state.** Filter and search state is mirrored to the query string,
so any filtered view is shareable and bookmarkable:

- Initial state is read from the URL on load (and during SSR/prerender), so a
  shared link renders the correct filtered view immediately.
- Changes are written back with `router.push` (a client-side query update, no
  full navigation), which records history entries so the **browser back button**
  steps through filter changes.
- A `route.query` watcher reads the URL back into state on back/forward, with
  equality guards to prevent feedback loops.
- The search input is **debounced** so rapid typing coalesces into a single URL
  update, while filtering itself stays instant.

**Pages & layout.**

- `app/pages/index.vue` — the catalog listing (search, tag chips, level/format
  dropdowns, active-filter chips, result count, responsive card grid, empty
  state).
- `app/pages/resources/[slug].vue` — a resource detail page: rendered Markdown
  body, full metadata, tags that link back to a pre-filtered listing, and an
  outbound link. Sets per-page SEO via `useSeoMeta`.
- `app/pages/[...slug].vue` — catch-all for standalone content pages (e.g.
  `/about`) from the `pages` collection.
- `app/layouts/default.vue` + `SiteHeader` / `SiteFooter` — shared chrome.
- `app/error.vue` — the 404 / error page, reusing the layout.

**Static generation.** The site has no server runtime needs, so it is
prerendered to static HTML/CSS/JS with `nuxt generate` and served from a CDN.

## Accessibility decisions

Accessibility is a core part of the subject matter, so the UI aims to practice
what it lists:

- **Semantic HTML** throughout — `header`/`main`/`footer`, `nav`, `article`,
  a `fieldset`/`legend` around the tag filters, and lists for card and tag
  collections.
- **Labelled search** — the search input has an associated `<label>` and sits in
  a `role="search"` landmark.
- **Toggle state exposed** — tag filter chips are `<button>`s with
  `aria-pressed` reflecting selection, so their state is announced.
- **Live result count** — an `aria-live="polite"` region announces
  "Showing X of Y resources" whenever the filters change.
- **Keyboard operability** — all controls are native, focusable elements; a
  "skip to main content" link lets keyboard users bypass the header.
- **Visible focus** — a consistent `:focus-visible` outline on links, buttons,
  and form controls.
- **WCAG AA contrast** — text and interactive color pairings meet AA in both
  light and dark modes; dark mode is handled via `prefers-color-scheme` by
  remapping the semantic color tokens.
- **Responsive** — fluid grids and a mobile type/spacing scale keep the layout
  usable down to narrow mobile widths.

## Project structure

```
content/
  resources/*.md        # catalog entries (typed frontmatter)
  about.md              # standalone page
content.config.ts       # Nuxt Content collections + Zod schemas
app/
  app.vue               # shell: layout wrapper, global title template
  error.vue             # 404 / error page
  layouts/default.vue   # header + main + footer
  components/            # SiteHeader, SiteFooter
  composables/           # useResourceFilters (filtering + URL sync)
  pages/                 # index, resources/[slug], [...slug]
  assets/css/main.css   # design tokens + base styles
netlify.toml            # static deploy config
```

## Local development

```bash
npm install
npm run dev        # http://localhost:3000
```

## Build & static generation

```bash
npm run generate   # prerender to .output/public
npm run preview    # preview the generated output locally
```

## Deployment (Netlify)

`netlify.toml` configures a static deploy:

- **Build command:** `npm run generate`
- **Publish directory:** `.output/public`

Point Netlify at the repo and it will prerender and serve the static output.
