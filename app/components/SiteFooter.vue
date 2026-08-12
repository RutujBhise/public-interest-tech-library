<script setup lang="ts">
// Global site footer.
const year = new Date().getFullYear()
</script>

<template>
  <footer class="site-footer">
    <div class="site-footer__inner">
      <p class="site-footer__lead">
        Public Interest Tech Library — free learning resources for public sector
        professionals.
      </p>
      <p class="site-footer__note">
        All resources are freely available from their respective providers.
        &copy; {{ year }}
      </p>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  background-color: var(--color-surface);
  border-top: 1px solid var(--color-border);
  margin-top: var(--space-8);
}

.site-footer__inner {
  max-width: var(--container-width);
  margin-inline: auto;
  padding: var(--space-6) var(--space-4);
}

.site-footer__lead {
  margin: 0 0 var(--space-2);
  font-weight: 600;
}

.site-footer__note {
  margin: 0;
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}
</style>
