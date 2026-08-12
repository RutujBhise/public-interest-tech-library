import type { ResourcesCollectionItem } from '@nuxt/content'
import type { ComputedRef, MaybeRefOrGetter, Ref } from 'vue'
import type { LocationQuery } from 'vue-router'

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

// How long to wait after the last keystroke before writing search to the URL.
const SEARCH_DEBOUNCE_MS = 300

// Query-string keys used to persist filter state. Kept short for tidy URLs.
const QUERY_KEYS = ['q', 'tags', 'level', 'format'] as const

// Coerce a possibly-repeated query param into a single trimmed string.
function readParam(value: LocationQuery[string]): string {
  if (Array.isArray(value)) return (value[0] ?? '').trim()
  return (value ?? '').trim()
}

/**
 * @param source The resource list (accepts a ref, getter, or plain array;
 *   `null`/`undefined` are treated as an empty list while data loads).
 */
export function useResourceFilters(
  source: MaybeRefOrGetter<ResourcesCollectionItem[] | null | undefined>,
): UseResourceFiltersReturn {
  const route = useRoute()
  const router = useRouter()

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

  // Parse filter state out of a URL query, discarding anything that isn't a
  // valid option for the current content (so hand-edited URLs degrade safely).
  function parseQuery(query: LocationQuery) {
    const tagPool = new Set<string>(availableTags.value)
    const search = readParam(query.q)
    const tags = readParam(query.tags)
      .split(',')
      .map(t => t.trim())
      .filter((t): t is ResourceTag => tagPool.has(t))
    const levelParam = readParam(query.level)
    const level = (availableLevels.value as string[]).includes(levelParam)
      ? (levelParam as ResourceLevel)
      : ''
    const formatParam = readParam(query.format)
    const format = (availableFormats.value as string[]).includes(formatParam)
      ? (formatParam as ResourceFormat)
      : ''
    return { search, tags, level, format }
  }

  // Filter state, initialised from the current URL so a shared/bookmarked link
  // (and SSR) renders the correct filtered view immediately.
  const initial = parseQuery(route.query)
  const searchQuery = ref(initial.search)
  const selectedTags = ref<ResourceTag[]>(initial.tags)
  const selectedLevel = ref<ResourceLevel | ''>(initial.level)
  const selectedFormat = ref<ResourceFormat | ''>(initial.format)

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

  // --- URL <-> state synchronisation --------------------------------------
  // The query string is the shareable source of truth. State is written to the
  // URL on change (client-side only, no full navigation) and read back from it
  // on load and on back/forward navigation.

  // Build the query object that represents the current filter state. Empty
  // filters are omitted so the URL stays clean (e.g. `/` when nothing is set).
  function buildQuery(): LocationQuery {
    const query: LocationQuery = {}
    const search = searchQuery.value.trim()
    if (search) query.q = search
    if (selectedTags.value.length) query.tags = selectedTags.value.join(',')
    if (selectedLevel.value) query.level = selectedLevel.value
    if (selectedFormat.value) query.format = selectedFormat.value
    return query
  }

  // Compare only the keys we own, so unrelated query params are left untouched.
  function sameAsUrl(query: LocationQuery): boolean {
    return QUERY_KEYS.every(key => readParam(route.query[key]) === readParam(query[key]))
  }

  // Push state to the URL. `push` (not `replace`) records a history entry so the
  // browser back button steps through filter changes; the guard prevents
  // redundant/duplicate navigations. This is a client-side query update only —
  // the page component is not re-created and data is not refetched.
  function writeUrl(): void {
    const next = buildQuery()
    if (!sameAsUrl(next)) {
      router.push({ query: next }).catch(() => {})
    }
  }

  // Debounce only the search field so rapid typing coalesces into one history
  // entry / URL update. Filtering itself stays instant (it reads searchQuery).
  let debounceTimer: ReturnType<typeof setTimeout> | undefined
  watch(searchQuery, () => {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(writeUrl, SEARCH_DEBOUNCE_MS)
  })

  // Tags, level and format update the URL immediately (also flushing any
  // pending debounced search write so the URL reflects the typed text too).
  watch([selectedTags, selectedLevel, selectedFormat], () => {
    clearTimeout(debounceTimer)
    writeUrl()
  })

  // Read the URL back into state. Fires on back/forward navigation (and any
  // external query change); equality guards stop this from bouncing back into
  // writeUrl and creating a feedback loop.
  watch(
    () => route.query,
    (query) => {
      const parsed = parseQuery(query)
      if (searchQuery.value !== parsed.search) searchQuery.value = parsed.search
      if (selectedTags.value.join(',') !== parsed.tags.join(',')) {
        selectedTags.value = parsed.tags
      }
      if (selectedLevel.value !== parsed.level) selectedLevel.value = parsed.level
      if (selectedFormat.value !== parsed.format) selectedFormat.value = parsed.format
    },
  )

  // Avoid a dangling timer if the component unmounts mid-debounce.
  onScopeDispose(() => clearTimeout(debounceTimer))

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
