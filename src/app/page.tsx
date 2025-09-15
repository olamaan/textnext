import groq from 'groq'
import Link from 'next/link'
import { client } from '../sanity/client'

type RefDoc = { _id: string; title?: string; number?: number }
type Post = {
  _id: string
  title?: string
  slug?: { current: string }
  sdgs?: RefDoc[]
  themes?: RefDoc[]
  countries?: RefDoc[]
}

const query = groq`*[_type=="post" && defined(slug.current)]
| order(publishedAt desc)[0..50]{
  _id, title, slug,
  sdgs[]->{ _id, title, number },
  themes[]->{ _id, title },
  countries[]->{ _id, title }
}`

export default async function Home() {
  const posts: Post[] = await client.fetch(query)

  return (
    <main style={{maxWidth: 800, margin: '2rem auto', fontFamily: 'system-ui'}}>
      <h1>Posts</h1>
      <ul style={{listStyle:'none', padding:0}}>
        {posts.map(p => (
          <li key={p._id} style={{border:'1px solid #ddd', borderRadius:8, padding:16, margin:'12px 0'}}>
            <h2 style={{margin:'0 0 .5rem'}}>
              <Link href={`/posts/${p.slug?.current}`}>{p.title || '(untitled)'}</Link>
            </h2>

            {/* Inline chips */}
            <div style={{fontSize:12, opacity:.85}}>
              {p.sdgs?.length ? (
                <div>SDGs: {p.sdgs.map(s => s.number ? `#${s.number} ${s.title}` : (s.title || '')).join(', ')}</div>
              ) : null}
              {p.themes?.length ? (
                <div>Themes: {p.themes.map(t => t.title).join(', ')}</div>
              ) : null}
              {p.countries?.length ? (
                <div>Countries: {p.countries.map(c => c.title).join(', ')}</div>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </main>
  )
}
