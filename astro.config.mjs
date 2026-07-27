// astro.config.mjs
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
  output: 'hybrid', // 开启混合渲染，使 API 路由变成动态 SSR
  adapter: vercel(),
  integrations: [
    react(),
    tailwind()
  ],
});