// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
  output: 'static',
  adapter: vercel({
    webAnalytics: { enabled: false }, 
    imageService: true, 
  }),
});