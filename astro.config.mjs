import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://bidwise.co',
  output: 'static',
  trailingSlash: 'ignore',
  integrations: [],
  vite: {
    build: { target: 'esnext' },
    optimizeDeps: { exclude: ['openpyxl'] }
  },
  image: {
    domains: ['bidwise.co'],
  }
});
