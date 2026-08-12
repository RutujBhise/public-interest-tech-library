import type { ResourcesCollectionItem } from '@nuxt/content'
import type { ComputedRef, MaybeRefOrGetter, Ref } from 'vue'

/**
 * Filtering logic for the resource catalog, extracted so the page component
 * stays purely presentational.
 *
 * The value unions below are derived from the generated collection type
 * (`ResourcesCollectionItem`), so they always track the Zod schema declared in
 * content.config.ts — no duplicated literal lists to keep in sync.
 */
export type ResourceTag = ResourcesCollectionItem['tags'][number]
export type ResourceLevel = ResourcesCollectionItem['level']
export type ResourceFormat = ResourcesCollectionItem['format']

/**
 * A single applied filter, used to render individually removable
 * "active filter" chips in the UI.
 */
export interface ActiveFilter {
  type: 'search' | 'tag' | 'level' | 'format'
  /** Human-readable label, e.g. `Tag: AI`. */
  label: string
  /** Underlying value (tag name, level, format, or search text). */
  value: string
}

export interface UseResourceFiltersReturn {
  // --- Filter state (bind directly with v-model) ---
  searchQuery: Ref<string>
  selectedTags: Ref<ResourceTag[]>
  selectedLevel: Ref<ResourceLevel | ''>
  selectedFormat: Ref<ResourceFormat | ''>

  // --- Options, derived dynamically from the content ---
  availableTags: ComputedRef<ResourceTag[]>
  availableLevels: ComputedRef<ResourceLevel[]>
  availableFormats: ComputedRef<ResourceFormat[]>

  // --- Results ---
  filteredResources: ComputedRef<ResourcesCollectionItem[]>
  totalCount: ComputedRef<number>
  resultCount: ComputedRef<number>

  // --- Active-filter chips ---
  activeFilters: ComputedRef<ActiveFilter[]>
  hasActiveFilters: ComputedRef<boolean>

  // --- Actions ---
  toggleTag: (tag: ResourceTag) => void
  isTagSelected: (tag: ResourceTag) => boolean
  clearFilter: (filter: ActiveFilter) => void
  clearAll: () => void
}

// Canonical display order for levels (alphabetical would be misleading here).
const LEVEL_ORDER: ResourceLevel[] = ['Beginner', 'Intermediate', 'Advanced']

/**
 * @param source The resource list (accepts a ref, getter, or plain array;
 *   `null`/`undefined` are treated as an empty list while data loads).
 */
export function useResourceFilters(
  source: MaybeRefOrGetter<ResourcesCollectionItem[] | null | undefined>,
): UseResourceFiltersReturn {
  // Filter state.
  const searchQuery = ref('')
  const selectedTags = ref<ResourceTag[]>([])
  const selectedLevel = ref<ResourceLevel | ''>('')
  const selectedFormat = ref<ResourceFormat | ''>('')

  // Normalise the source into a concrete, reactive array.
  const resources = computed<ResourcesCollectionItem[]>(() => toValue(source) ?? [])

  // Unique tags across all resources, alphabetically sorted.
  const availableTags = computed<ResourceTag[]>(() => {
    const set = new Set<ResourceTag>()
    for (const resource of resources.value) {
      for (const tag of resource.tags) set.add(tag)
    }
    return [...set].sort((a, b) => a.localeCompare(b))
  })

  // Levels present in the content, ordered Beginner → Advanced.
  const availableLevels = computed<ResourceLevel[]>(() => {
    const present = new Set<ResourceLevel>(resources.value.map(r => r.level))
    return LEVEL_ORDER.filter(level => present.has(level))
  })

  // Formats present in the content, alphabetically sorted.
  const availableFormats = computed<ResourceFormat[]>(() => {
    const present = new Set<ResourceFormat>(resources.value.map(r => r.format))
    return [...present].sort((a, b) => a.localeCompare(b))
  })

  // Apply every active filter. Tags use OR semantics (match ANY selected tag);
  // level and format are single-select exact matches.
  const filteredResources = computed<ResourcesCollectionItem[]>(() => {
    const query = searchQuery.value.trim().toLowerCase()
    const tags = selectedTags.value
    const level = selectedLevel.value
    const format = selectedFormat.value

    return resources.value.filter((resource) => {
      if (query) {
        const haystack =
          `${resource.title} ${resource.description} ${resource.provider}`.toLowerCase()
        if (!haystack.includes(query)) return false
      }
      if (tags.length && !tags.some(tag => resource.tags.includes(tag))) return false
      if (level && resource.level !== level) return false
      if (format && resource.format !== format) return false
      return true
    })
  })

  const totalCount = computed(() => resources.value.length)
  const resultCount = computed(() => filteredResources.value.length)

  // Flattened list of everything currently narrowing the results.
  const activeFilters = computed<ActiveFilter[]>(() => {
    const filters: ActiveFilter[] = []
    const query = searchQuery.value.trim()
    if (query) filters.push({ type: 'search', label: `Search: "${query}"`, value: query })
    for (const tag of selectedTags.value) {
      filters.push({ type: 'tag', label: `Tag: ${tag}`, value: tag })
    }
    if (selectedLevel.value) {
      filters.push({ type: 'level', label: `Level: ${selectedLevel.value}`, value: selectedLevel.value })
    }
    if (selectedFormat.value) {
      filters.push({ type: 'format', label: `Format: ${selectedFormat.value}`, value: selectedFormat.value })
    }
    return filters
  })

  const hasActiveFilters = computed(() => activeFilters.value.length > 0)

  function isTagSelected(tag: ResourceTag): boolean {
    return selectedTags.value.includes(tag)
  }

  function toggleTag(tag: ResourceTag): void {
    selectedTags.value = isTagSelected(tag)
      ? selectedTags.value.filter(t => t !== tag)
      : [...selectedTags.value, tag]
  }

  // Remove a single active filter (used by the active-filter chips).
  function clearFilter(filter: ActiveFilter): void {
    switch (filter.type) {
      case 'search':
        searchQuery.value = ''
        break
      case 'tag':
        selectedTags.value = selectedTags.value.filter(t => t !== filter.value)
        break
      case 'level':
        selectedLevel.value = ''
        break
      case 'format':
        selectedFormat.value = ''
        break
    }
  }

  function clearAll(): void {
    searchQuery.value = ''
    selectedTags.value = []
    selectedLevel.value = ''
    selectedFormat.value = ''
  }

  return {
    searchQuery,
    selectedTags,
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
  }
}
