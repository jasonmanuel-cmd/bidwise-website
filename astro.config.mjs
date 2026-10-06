import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://bidwise.website',
  output: 'static',
  trailingSlash: 'ignore',
  integrations: [],
  vite: {
    build: { target: 'esnext' },
    optimizeDeps: { exclude: ['openpyxl'] }
  },
  image: {
    domains: ['bidwise.website'],
  }
});
