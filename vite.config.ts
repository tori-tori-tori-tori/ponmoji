import { defineConfig } from 'vite-plus'

export default defineConfig({
  // `vp dev` / `vp build` をルートから実行したときの対象
  defaultPackage: './apps/studio-web',

  // pre-commit(.vite-hooks/pre-commit → vp staged)で、ステージ済みファイルを整形・lint する
  staged: {
    '*': 'vp check --fix',
  },

  // Oxfmt
  fmt: {
    semi: false,
    singleQuote: true,
    printWidth: 100,
    ignorePatterns: [
      '**/routeTree.gen.ts', // TanStack Router の自動生成
      '.claude/**', // スキル定義。ワークフロー YAML の写しを含むため手で管理する
      '.github/**',
    ],
  },

  // Oxlint
  lint: {
    jsPlugins: [{ name: 'vite-plus', specifier: 'vite-plus/oxlint-plugin' }],
    rules: { 'vite-plus/prefer-vite-plus-imports': 'error' },
    options: { typeAware: true, typeCheck: true },
    ignorePatterns: ['**/routeTree.gen.ts'],
  },
})
