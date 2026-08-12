<script setup lang="ts">
// Catalog homepage: lists every resource in the `resources` collection.
// `queryCollection` returns items typed from the collection's Zod schema,
// so `resources` is fully typed (title, provider, tags, level, format, ...).
const { data: resources } = await useAsyncData('resources-all', () =>
  queryCollection('resources').order('title', 'ASC').all(),
)
</script>

<template>
  <div class="page">
    <header class="masthead">
      <h1>Public Interest Tech Library</h1>
      <p class="lede">
        A curated catalog of free learning resources for public sector
        professionals — filterable by topic, level, and format.
      </p>
      <NuxtLink to="/about">About this library</NuxtLink>
    </header>

    <!-- Resource grid. Each card links through to the resource detail page. -->
    <ul class="grid">
      <li
        v-for="resource in resources"
        :key="resource.path"
        class="card"
      >
        <div class="card__meta">
          <span class="badge badge--format">{{ resource.format }}</span>
          <span class="badge badge--level">{{ resource.level }}</span>
        </div>

        <h2 class="card__title">
          <NuxtLink :to="resource.path">{{ resource.title }}</NuxtLink>
        </h2>

        <p class="card__provider">{{ resource.provider }}</p>
        <p class="card__desc">{{ resource.description }}</p>

        <ul class="tags">
          <li v-for="tag in resource.tags" :key="tag" class="tag">
            {{ tag }}
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<style scoped>
/* Layout container, centered with the shared max width token. */
.page {
  max-width: var(--container-width);
  margin-inline: auto;
  padding: var(--space-6) var(--space-4);
}

.masthead {
  margin-bottom: var(--space-7);
}

.lede {
  color: var(--color-text-muted);
  font-size: var(--text-lg);
  max-width: 42rem;
}

/* Responsive card grid. */
.grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));
  gap: var(--space-5);
}

.card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.card__meta {
  display: flex;
  gap: var(--space-2);
}

.card__title {
  font-size: var(--text-lg);
  margin: 0;
}

.card__title a {
  text-decoration: none;
}

.card__title a:hover {
  text-decoration: underline;
}

.card__provider {
  margin: 0;
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}

.card__desc {
  margin: 0;
  color: var(--color-text);
}

/* Badges + tags use the surface/border tokens for AA-compliant contrast. */
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
  margin: auto 0 0;
  padding: 0;
}

.tag {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  background-color: var(--color-surface-2);
  border-radius: var(--radius-sm);
  padding: var(--space-1) var(--space-2);
}
</style>
