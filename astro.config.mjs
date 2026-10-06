import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://bidwise.website',
  output: 'static',
  trailingSlash: 'ignore',
  integrations: [],
  vite: {
    build: { target: 'esnext' }
  },
  image: {
    domains: ['bidwise.website'],
  }
});
