<script setup lang="ts">
// App shell. Sets document language and a global title template so per-page
// titles read "<page> · Public Interest Tech Library", plus a default
// description that individual pages can override with useSeoMeta.
useHead({
  htmlAttrs: { lang: 'en' },
  titleTemplate: title =>
    title ? `${title} · Public Interest Tech Library` : 'Public Interest Tech Library',
})

useSeoMeta({
  description:
    'A curated catalog of free learning resources for public sector professionals.',
})
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
