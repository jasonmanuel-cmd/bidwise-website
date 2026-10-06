import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
  site: 'https://bidwise.website',
  output: 'hybrid',
  adapter: vercel(),
  trailingSlash: 'ignore',
  integrations: [],
  vite: {
    build: { target: 'esnext' }
  },
  image: {
    domains: ['bidwise.website'],
  }
});
