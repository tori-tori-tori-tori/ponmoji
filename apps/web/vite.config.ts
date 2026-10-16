import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { defineConfig, lazyPlugins } from 'vite-plus'

export default defineConfig({
  server: {
    port: 3000,
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: lazyPlugins(() => [
    tanstackStart(),
    // React の Vite プラグインは Start の後に置く（公式ガイドの指定）
    viteReact(),
  ]),
})
