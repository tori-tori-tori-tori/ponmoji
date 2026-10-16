import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { playwright } from 'vite-plus/test/browser-playwright'
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

  // guidelines/testing.md §2
  test: {
    projects: [
      {
        // Unit: 純粋なロジック。Node で速く回す
        extends: true,
        test: {
          name: 'unit',
          environment: 'node',
          include: ['src/**/*.test.ts'],
        },
      },
      {
        // Integration: 画面をユーザー操作で検証。キャンバス・レイアウト・フォントが要るので実ブラウザで走らせる
        extends: true,
        test: {
          name: 'browser',
          include: ['src/**/*.test.tsx'],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
})
