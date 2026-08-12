<script setup lang="ts">
// Global site header: brand link home + primary navigation.
</script>

<template>
  <header class="site-header">
    <div class="site-header__inner">
      <NuxtLink to="/" class="brand">
        <span class="brand__mark" aria-hidden="true">PIT</span>
        <span class="brand__name">Public Interest Tech Library</span>
      </NuxtLink>

      <nav class="site-nav" aria-label="Primary">
        <NuxtLink to="/">Browse</NuxtLink>
        <NuxtLink to="/about">About</NuxtLink>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
}

/* Centered content row; wraps to two lines on narrow screens. */
.site-header__inner {
  max-width: var(--container-width);
  margin-inline: auto;
  padding: var(--space-4);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  text-decoration: none;
  color: var(--color-text);
  font-weight: 700;
}

.brand__mark {
  background-color: var(--color-primary);
  color: var(--color-on-primary);
  font-size: var(--text-sm);
  letter-spacing: 0.05em;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
}

.brand__name {
  font-size: var(--text-lg);
}

.site-nav {
  display: flex;
  gap: var(--space-4);
}

/* On very small screens, keep the brand mark but hide the long name. */
@media (max-width: 30rem) {
  .brand__name {
    display: none;
  }
}
</style>
