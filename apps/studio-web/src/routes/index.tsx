import { createFileRoute } from '@tanstack/react-router'
import { Studio } from '~/studio/Studio'
import { googleFontsHref } from '~/studio/fonts'
import studioCss from '~/studio/studio.css?url'

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [{ title: 'ponmoji studio' }],
    links: [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      { rel: 'stylesheet', href: googleFontsHref() },
      { rel: 'stylesheet', href: studioCss },
    ],
  }),
  component: Studio,
})
