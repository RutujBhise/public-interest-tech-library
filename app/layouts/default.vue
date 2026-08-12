<script setup lang="ts">
// Default layout: skip link, header, page content, footer.
// A flex column keeps the footer pinned to the bottom on short pages.
</script>

<template>
  <div class="site-shell">
    <a class="skip-link" href="#main">Skip to main content</a>
    <SiteHeader />
    <main id="main" class="site-main">
      <slot />
    </main>
    <SiteFooter />
  </div>
</template>

<style scoped>
.site-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.site-main {
  flex: 1;
}

/* Visually hidden until focused, so keyboard users can jump past the header. */
.skip-link {
  position: absolute;
  left: var(--space-2);
  top: -3rem;
  z-index: 10;
  background-color: var(--color-primary);
  color: var(--color-on-primary);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  text-decoration: none;
  transition: top 0.15s ease;
}

.skip-link:focus {
  top: var(--space-2);
}
</style>
