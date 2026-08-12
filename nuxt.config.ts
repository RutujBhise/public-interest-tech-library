// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/content',
  ],
  // Global design-token stylesheet, applied to every page.
  css: ['~/assets/css/main.css'],
  devtools: { enabled: true },
  compatibilityDate: '2024-04-03',

  // Deploy as a fully static site. Forcing the `static` preset stops Nitro from
  // auto-selecting Netlify's server/functions preset on Netlify's build
  // environment (which caused an ENOENT for server.json when the output is
  // actually static). `crawlLinks` walks every internal link from `/`, so all
  // resource detail pages are prerendered to HTML at build time.
  nitro: {
    preset: 'static',
    prerender: {
      crawlLinks: true,
      routes: ['/'],
    },
  },
})
