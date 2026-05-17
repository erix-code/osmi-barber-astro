import { defineConfig } from 'astro/config';
import node from '@astrojs/node'; // Cambia esto
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone', // Esto permite que Astro corra como un servidor propio
  }),
  vite: {
    plugins: [tailwindcss()]
  }
});
