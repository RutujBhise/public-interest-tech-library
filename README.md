# Public Interest Tech Library

A small directory of free learning resources for people working in and around
government tech — courses, guides, toolkits and videos on things like
accessibility, procurement, data and AI in the public sector. I built it as a
side project to get more comfortable with Nuxt 4 and its content module, using
a topic I actually find interesting as the excuse.

## How it works

Each resource is just a Markdown file in `content/resources/` with a bit of
frontmatter (title, provider, tags, level, format, link). Nuxt Content loads
those into a typed collection, and the homepage lists them with a search box
and some filters.

The filtering logic lives in a composable (`useResourceFilters`), and the
active filters are stored in the URL — so a filtered view can be shared or
bookmarked, and the back button does what you'd expect. Every resource also
gets its own page.

Styling is plain hand-written CSS using custom properties for colors, spacing
and so on, with a dark mode. The whole site is prerendered to static files, so
there's nothing to run server-side — it just deploys to Netlify as HTML/CSS/JS.

## Running it locally

```bash
npm install
npm run dev        # http://localhost:3000
```

To build the static site:

```bash
npm run generate   # output ends up in .output/public
```
