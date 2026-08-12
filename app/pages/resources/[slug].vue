<script setup lang="ts">
// Resource detail page. Matches /resources/:slug and renders the single
// resource whose generated path equals the current route.
const route = useRoute()

const { data: resource } = await useAsyncData(`resource-${route.path}`, () =>
  queryCollection('resources').path(route.path).first(),
)

// Surface a proper 404 when no resource matches the requested path.
if (!resource.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Resource not found',
    fatal: true,
  })
}

// Per-page SEO meta driven by the resource frontmatter. The title is combined
// with the site name via the global titleTemplate in app.vue.
useSeoMeta({
  title: () => resource.value?.title,
  description: () => resource.value?.description,
  ogTitle: () => resource.value?.title,
  ogDescription: () => resource.value?.description,
  ogType: 'article',
})
</script>

<template>
  <article v-if="resource" class="page">
    <NuxtLink to="/" class="back">&larr; Back to all resources</NuxtLink>

    <header class="head">
      <div class="head__meta">
        <span class="badge badge--format">{{ resource.format }}</span>
        <span class="badge badge--level">{{ resource.level }}</span>
      </div>
      <h1>{{ resource.title }}</h1>
      <p class="lede">{{ resource.description }}</p>

      <!-- Structured metadata -->
      <dl class="meta-list">
        <div class="meta-list__row">
          <dt>Provider</dt>
          <dd>{{ resource.provider }}</dd>
        </div>
        <div class="meta-list__row">
          <dt>Level</dt>
          <dd>{{ resource.level }}</dd>
        </div>
        <div class="meta-list__row">
          <dt>Format</dt>
          <dd>{{ resource.format }}</dd>
        </div>
      </dl>

      <!-- Tags link back to a pre-filtered catalog listing -->
      <ul class="tags" aria-label="Tags">
        <li v-for="tag in resource.tags" :key="tag">
          <NuxtLink class="tag" :to="{ path: '/', query: { tags: tag } }">
            {{ tag }}
          </NuxtLink>
        </li>
      </ul>
    </header>

    <!-- Markdown body of the resource entry. -->
    <div class="prose">
      <ContentRenderer :value="resource" />
    </div>

    <a
      class="cta"
      :href="resource.url"
      target="_blank"
      rel="noopener noreferrer"
    >
      Open resource at {{ resource.provider }} &nearr;
    </a>
  </article>
</template>

<style scoped>
.page {
  max-width: 44rem;
  margin-inline: auto;
  padding: var(--space-6) var(--space-4);
}

.back {
  display: inline-block;
  margin-bottom: var(--space-5);
  font-size: var(--text-sm);
}

.head__meta {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}

.lede {
  color: var(--color-text-muted);
  font-size: var(--text-lg);
}

/* Metadata definition list: label/value rows that wrap gracefully. */
.meta-list {
  margin: var(--space-5) 0 0;
  display: grid;
  gap: var(--space-2);
}

.meta-list__row {
  display: flex;
  gap: var(--space-3);
}

.meta-list dt {
  flex: 0 0 5rem;
  font-weight: 600;
  color: var(--color-text-muted);
}

.meta-list dd {
  margin: 0;
}

.badge {
  font-size: var(--text-sm);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
}

.badge--format {
  background-color: var(--color-primary);
  color: var(--color-on-primary);
}

.badge--level {
  background-color: var(--color-surface-2);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.tags {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin: var(--space-5) 0 0;
  padding: 0;
}

.tag {
  display: inline-block;
  font-size: var(--text-sm);
  color: var(--color-text);
  background-color: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  padding: var(--space-1) var(--space-3);
  text-decoration: none;
}

.tag:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.prose {
  margin: var(--space-6) 0;
  line-height: var(--leading-normal);
}

/* Primary call-to-action linking to the external resource. */
.cta {
  display: inline-block;
  background-color: var(--color-primary);
  color: var(--color-on-primary);
  text-decoration: none;
  padding: var(--space-3) var(--space-5);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

.cta:hover {
  background-color: var(--color-primary-hover);
  color: var(--color-on-primary);
}
</style>
