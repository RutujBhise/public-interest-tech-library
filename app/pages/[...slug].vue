<script setup lang="ts">
// Catch-all for standalone informational pages (e.g. /about) served from the
// `pages` collection. More specific routes (index, resources/[slug]) take
// precedence, so this only handles top-level content pages.
const route = useRoute()

const { data: page } = await useAsyncData(`page-${route.path}`, () =>
  queryCollection('pages').path(route.path).first(),
)

if (!page.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Page not found',
    fatal: true,
  })
}

// Per-page SEO meta from the page frontmatter (title/description).
useSeoMeta({
  title: () => page.value?.title,
  description: () => page.value?.description,
})
</script>

<template>
  <div class="page">
    <NuxtLink to="/" class="back">&larr; Back to all resources</NuxtLink>
    <div class="prose">
      <ContentRenderer v-if="page" :value="page" />
    </div>
  </div>
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

.prose {
  line-height: var(--leading-normal);
}
</style>
