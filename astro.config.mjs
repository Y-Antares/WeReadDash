import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
// 引入对应的部署适配器，例如 Vercel
import vercel from '@astrojs/vercel/serverless'; 

export default defineConfig({
  output: 'hybrid', // 核心：混合渲染模式
  adapter: vercel(),
  integrations: [react(), tailwind()],
});
