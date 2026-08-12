<script setup lang="ts">
import type { NuxtError } from '#app'

// Nuxt renders this component (instead of app.vue) for fatal errors, including
// unmatched routes (404). Wrapping in <NuxtLayout> reuses the site header and
// footer so the error page still feels part of the site.
const props = defineProps<{ error: NuxtError }>()

const is404 = computed(() => props.error?.statusCode === 404)

useSeoMeta({
  title: () => (is404.value ? 'Page not found' : 'Something went wrong'),
})

// Clearing the error unmounts this component and navigates home.
function goHome() {
  clearError({ redirect: '/' })
}
</script>

<template>
  <NuxtLayout>
    <div class="error-page">
      <p class="error-page__code">{{ error.statusCode }}</p>
      <h1>{{ is404 ? 'Page not found' : 'Something went wrong' }}</h1>
      <p class="error-page__msg">
        {{
          is404
            ? "We couldn't find the page you were looking for. It may have moved or never existed."
            : (error.statusMessage || 'An unexpected error occurred.')
        }}
      </p>
      <button type="button" class="cta" @click="goHome">
        Back to all resources
      </button>
    </div>
  </NuxtLayout>
</template>

<style scoped>
.error-page {
  max-width: 36rem;
  margin-inline: auto;
  padding: var(--space-8) var(--space-4);
  text-align: center;
}

.error-page__code {
  font-size: var(--text-3xl);
  font-weight: 700;
  color: var(--color-primary);
  margin: 0;
}

.error-page__msg {
  color: var(--color-text-muted);
  margin: var(--space-3) 0 var(--space-6);
}

.cta {
  display: inline-block;
  background-color: var(--color-primary);
  color: var(--color-on-primary);
  border: 0;
  padding: var(--space-3) var(--space-5);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

.cta:hover {
  background-color: var(--color-primary-hover);
}
</style>
