import { defineContentConfig, defineCollection, z } from '@nuxt/content'

/**
 * Nuxt Content v3 content configuration.
 *
 * Two collections are defined:
 *  - `resources`: the core catalog of learning resources. Each entry is a
 *    Markdown file with strongly-typed frontmatter (validated by the Zod
 *    schema below), so the frontmatter doubles as the source of truth for the
 *    generated TypeScript types used throughout the app.
 *  - `pages`: standalone informational pages (e.g. About) that only need
 *    default page fields.
 */

// Allowed values, declared once so they are reused by the schema and can be
// imported for building filter UIs if needed later.
const TAGS = [
  'AI',
  'Data',
  'Digital Services',
  'Procurement',
  'Accessibility',
  'Civic Engagement',
  'Policy',
] as const

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'] as const

const FORMATS = ['Course', 'Guide', 'Toolkit', 'Video'] as const

export default defineContentConfig({
  collections: {
    // Catalog entries, sourced from content/resources/*.md
    resources: defineCollection({
      type: 'page',
      source: 'resources/**',
      // Frontmatter contract enforced at build time and surfaced as types.
      schema: z.object({
        title: z.string(),
        description: z.string(),
        provider: z.string(),
        tags: z.array(z.enum(TAGS)).min(2).max(4),
        level: z.enum(LEVELS),
        format: z.enum(FORMATS),
        url: z.string().url(),
      }),
    }),

    // Informational pages, sourced from top-level content files (e.g. about.md).
    // `*` matches only root-level files, so it never overlaps `resources/**`.
    pages: defineCollection({
      type: 'page',
      source: '*.md',
    }),
  },
})
