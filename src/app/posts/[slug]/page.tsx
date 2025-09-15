import groq from 'groq'
import { client } from '@/sanity/client'
import { PortableText, type PortableTextComponents } from '@portabletext/react'
import type { PortableTextBlock } from 'sanity'

type RouteParams = { slug: string }
type Props = { params: Promise<RouteParams> } // your setup wants params as a Promise

type RefDoc = { _id: string; title?: string; number?: number }

type Post = {
  _id: string
  title?: string
  body?: PortableTextBlock[]
  publishedAt?: string
  sdgs?: RefDoc[]
  themes?: RefDoc[]
  countries?: RefDoc[]
}

const query = groq`*[_type=="post" && slug.current==$slug][0]{
  _id, title, body, publishedAt,
  sdgs[]->{ _id, title, number },
  themes[]->{ _id, title },
  countries[]->{ _id, title }
}`

const components: PortableTextComponents = {
  block: {
    h1: ({ children }) => <h1 style={{ fontSize: 28, margin: '1rem 0' }}>{children}</h1>,
    h2: ({ children }) => <h2 style={{ fontSize: 22, margin: '1rem 0' }}>{children}</h2>,
    normal: ({ children }) => <p style={{ lineHeight: 1.7, margin: '0.75rem 0' }}>{children}</p>,
  },
  list: {
    bullet: ({ children }) => <ul style={{ paddingLeft: 20, listStyle: 'disc' }}>{children}</ul>,
    number: ({ children }) => <ol style={{ paddingLeft: 20 }}>{children}</ol>,
  },
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params

  const post: Post = await client.fetch(query, { slug })
  if (!post) return <main style={{ maxWidth: 840, margin: '2rem auto' }}><p>Post not found</p></main>

  return (
    <main style={{ maxWidth: 840, margin: '2rem auto', fontFamily: 'system-ui' }}>
      <h1 style={{ marginBottom: 8 }}>{post.title}</h1>
      {post.publishedAt && (
        <p style={{ opacity: 0.75, marginTop: 0 }}>
          {new Date(post.publishedAt).toLocaleDateString()}
        </p>
      )}

      {/* Relation chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '8px 0 16px', fontSize: 13, opacity: 0.9 }}>
        {post.sdgs?.map(s => (
          <span key={s._id} style={{ border: '1px solid #ddd', borderRadius: 12, padding: '4px 10px' }}>
            {s.number ? `SDG #${s.number} – ${s.title}` : s.title}
          </span>
        ))}
        {post.themes?.map(t => (
          <span key={t._id} style={{ border: '1px solid #ddd', borderRadius: 12, padding: '4px 10px' }}>
            {t.title}
          </span>
        ))}
        {post.countries?.map(c => (
          <span key={c._id} style={{ border: '1px solid #ddd', borderRadius: 12, padding: '4px 10px' }}>
            {c.title}
          </span>
        ))}
      </div>

      {/* Rich text body */}
      {post.body && (
        <article style={{ marginTop: 16 }}>
          <PortableText value={post.body} components={components} />
        </article>
      )}
    </main>
  )
}
