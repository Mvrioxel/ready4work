// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

export default defineConfig({
  output: 'static', // pages statiques par défaut, sauf les API routes
  adapter: vercel(),
});