import groq from 'groq'
import Link from 'next/link'
import { client } from '@/sanity/client'

type Post = { _id: string; title?: string; slug?: { current: string } }
type Search = { q?: string }
type Props = { searchParams?: Promise<Search> } // <- note: Promise

const query = groq`*[_type=="post" && defined(slug.current) && ($q == '' || title match $q)]
| order(publishedAt desc)[0..50]{ _id, title, slug }`

export default async function Home({ searchParams }: Props) {
  const sp = searchParams ? await searchParams : {}                      // normalize the promised params
  const raw = (sp.q ?? '').trim()
  const q = raw ? `${raw}*` : ''                                         // always pass a value

  const posts: Post[] = await client.fetch(query, { q })

  return (
    <main style={{ maxWidth: 800, margin: '2rem auto', fontFamily: 'system-ui' }}>
      <h1>Posts</h1>

      <form method="GET" style={{ display: 'flex', gap: 8, margin: '12px 0' }}>
        <input name="q" defaultValue={raw} placeholder="Search title…" style={{ flex: 1, padding: 8 }} />
        <button type="submit" style={{ padding: '8px 12px' }}>Filter</button>
      </form>

      {posts.length === 0 ? (
        <p>No posts found.</p>
      ) : (
        <ul>
          {posts.map(p => (
            <li key={p._id}>
              <Link href={`/posts/${p.slug?.current}`}>{p.title || '(untitled)'}</Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
