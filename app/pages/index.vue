<script setup lang="ts">
// Catalog homepage. All filtering logic lives in `useResourceFilters`, so this
// component only fetches the data, wires state to the UI, and renders.
const { data: resources } = await useAsyncData('resources-all', () =>
  queryCollection('resources').order('title', 'ASC').all(),
)

// `resources` is a Ref; passing it straight through keeps the filters reactive.
const {
  searchQuery,
  selectedLevel,
  selectedFormat,
  availableTags,
  availableLevels,
  availableFormats,
  filteredResources,
  totalCount,
  resultCount,
  activeFilters,
  hasActiveFilters,
  toggleTag,
  isTagSelected,
  clearFilter,
  clearAll,
} = useResourceFilters(resources)
</script>

<template>
  <div class="page">
    <header class="masthead">
      <h1>Public Interest Tech Library</h1>
      <p class="lede">
        A curated catalog of free learning resources for public sector
        professionals — search and filter by topic, level, and format.
      </p>
      <NuxtLink to="/about">About this library</NuxtLink>
    </header>

    <!-- Filter controls -->
    <section class="filters" aria-label="Filter resources">
      <!-- Text search -->
      <form class="search" role="search" @submit.prevent>
        <label for="resource-search" class="field-label">Search resources</label>
        <input
          id="resource-search"
          v-model="searchQuery"
          type="search"
          class="search__input"
          placeholder="Search by title, description or provider"
          autocomplete="off"
        >
      </form>

      <!-- Level & format dropdowns -->
      <div class="controls">
        <div class="field">
          <label for="level-filter" class="field-label">Level</label>
          <select id="level-filter" v-model="selectedLevel" class="select">
            <option value="">All levels</option>
            <option v-for="level in availableLevels" :key="level" :value="level">
              {{ level }}
            </option>
          </select>
        </div>

        <div class="field">
          <label for="format-filter" class="field-label">Format</label>
          <select id="format-filter" v-model="selectedFormat" class="select">
            <option value="">All formats</option>
            <option v-for="format in availableFormats" :key="format" :value="format">
              {{ format }}
            </option>
          </select>
        </div>
      </div>

      <!-- Toggleable tag chips -->
      <fieldset class="tag-group">
        <legend class="field-label">Filter by tag</legend>
        <ul class="chip-list">
          <li v-for="tag in availableTags" :key="tag">
            <button
              type="button"
              class="chip chip--toggle"
              :class="{ 'chip--on': isTagSelected(tag) }"
              :aria-pressed="isTagSelected(tag)"
              @click="toggleTag(tag)"
            >
              {{ tag }}
            </button>
          </li>
        </ul>
      </fieldset>
    </section>

    <!-- Active filters, each individually removable -->
    <section v-if="hasActiveFilters" class="active" aria-label="Active filters">
      <ul class="chip-list">
        <li v-for="filter in activeFilters" :key="`${filter.type}:${filter.value}`">
          <button
            type="button"
            class="chip chip--active"
            :aria-label="`Remove filter ${filter.label}`"
            @click="clearFilter(filter)"
          >
            <span>{{ filter.label }}</span>
            <span class="chip__x" aria-hidden="true">&times;</span>
          </button>
        </li>
      </ul>
      <button type="button" class="clear-all" @click="clearAll">Clear all</button>
    </section>

    <!-- Live result count, announced to assistive tech when filters change -->
    <p class="count" role="status" aria-live="polite">
      Showing {{ resultCount }} of {{ totalCount }} resources
    </p>

    <!-- Resource grid -->
    <ul v-if="resultCount" class="grid">
      <li
        v-for="resource in filteredResources"
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
          <li v-for="tag in resource.tags" :key="tag" class="tag">{{ tag }}</li>
        </ul>
      </li>
    </ul>

    <!-- Empty state -->
    <div v-else class="empty">
      <p class="empty__title">No resources match your filters.</p>
      <p class="empty__hint">Try removing a filter or broadening your search.</p>
      <button type="button" class="clear-all" @click="clearAll">
        Clear all filters
      </button>
    </div>
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
  margin-bottom: var(--space-6);
}

.lede {
  color: var(--color-text-muted);
  font-size: var(--text-lg);
  max-width: 42rem;
}

/* --- Filters --- */
.filters {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  padding: var(--space-5);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-5);
}

.field-label {
  display: block;
  font-size: var(--text-sm);
  font-weight: 600;
  margin-bottom: var(--space-2);
  color: var(--color-text);
}

.search {
  margin: 0;
}

.search__input,
.select {
  width: 100%;
  font: inherit;
  color: var(--color-text);
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-3);
}

.search__input:focus-visible,
.select:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 1px;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
}

.field {
  flex: 1 1 12rem;
}

/* Fieldset reset so the tag group aligns with other controls. */
.tag-group {
  margin: 0;
  padding: 0;
  border: 0;
}

/* --- Chips (shared list layout) --- */
.chip-list {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin: 0;
  padding: 0;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-full);
  border: 1px solid var(--color-border);
  background-color: var(--color-bg);
  color: var(--color-text);
}

/* Toggle chip: distinct pressed state, driven by aria-pressed / .chip--on. */
.chip--toggle {
  cursor: pointer;
}

.chip--on {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-on-primary);
}

/* Active-filter chip: shows a remove affordance. */
.chip--active {
  cursor: pointer;
  background-color: var(--color-surface-2);
}

.chip__x {
  font-size: var(--text-lg);
  line-height: 1;
}

.active {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.clear-all {
  font-size: var(--text-sm);
  color: var(--color-primary);
  background: none;
  border: 0;
  text-decoration: underline;
  padding: var(--space-1);
}

.clear-all:hover {
  color: var(--color-primary-hover);
}

/* --- Result count --- */
.count {
  font-weight: 600;
  margin-bottom: var(--space-4);
}

/* --- Card grid --- */
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

/* --- Empty state --- */
.empty {
  text-align: center;
  padding: var(--space-7) var(--space-4);
  background-color: var(--color-surface);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-lg);
}

.empty__title {
  font-weight: 600;
  margin: 0 0 var(--space-2);
}

.empty__hint {
  color: var(--color-text-muted);
  margin: 0 0 var(--space-4);
}
</style>
