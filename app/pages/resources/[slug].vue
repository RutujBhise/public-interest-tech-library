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
</script>

<template>
  <article v-if="resource" class="page">
    <NuxtLink to="/" class="back">&larr; Back to catalog</NuxtLink>

    <header class="head">
      <div class="head__meta">
        <span class="badge badge--format">{{ resource.format }}</span>
        <span class="badge badge--level">{{ resource.level }}</span>
      </div>
      <h1>{{ resource.title }}</h1>
      <p class="provider">Provided by {{ resource.provider }}</p>
      <ul class="tags">
        <li v-for="tag in resource.tags" :key="tag" class="tag">{{ tag }}</li>
      </ul>
    </header>

    <!-- Markdown body of the resource entry. -->
    <div class="prose">
      <ContentRenderer :value="resource" />
    </div>

    <a class="cta" :href="resource.url" target="_blank" rel="noopener noreferrer">
      Open resource at {{ resource.provider }}
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

.provider {
  color: var(--color-text-muted);
  margin-top: var(--space-2);
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
  margin: var(--space-4) 0 0;
  padding: 0;
}

.tag {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  background-color: var(--color-surface-2);
  border-radius: var(--radius-sm);
  padding: var(--space-1) var(--space-2);
}

.prose {
  margin: var(--space-6) 0;
  line-height: var(--leading-normal);
}

/* Primary call-to-action button linking to the external resource. */
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
