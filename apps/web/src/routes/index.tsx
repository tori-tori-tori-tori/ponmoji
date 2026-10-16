import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <main style={{ padding: 16, fontFamily: 'system-ui, sans-serif' }}>
      <h1>ponmoji</h1>
      <p>
        <Link to="/studio">Studio でスタンプを作る</Link>
      </p>
    </main>
  )
}
