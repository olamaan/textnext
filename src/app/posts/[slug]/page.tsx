import groq from 'groq'
import { client } from '../../../sanity/client'
import { PortableText } from '@portabletext/react'
import type { PortableTextBlock } from 'sanity'

// If your dataset is private and you hit build-time issues, uncomment this:
// export const dynamic = 'force-dynamic'

type RouteParams = { slug: string }

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

export default async function PostPage(
  props: { params: Promise<RouteParams> } // 🔧 accept promised params
) {
  const { slug } = await props.params           // 🔧 await the params

  const post: Post = await client.fetch(query, { slug })
  if (!post) return <main><p>Post not found</p></main>

  return (
    <main style={{ maxWidth: 800, margin: '2rem auto', fontFamily: 'system-ui' }}>
      <h1>{post.title}</h1>
      {post.publishedAt && (
        <p style={{ opacity: 0.75 }}>{new Date(post.publishedAt).toLocaleString()}</p>
      )}

      {/* Relations */}
      <div style={{ fontSize: 13, opacity: 0.9, margin: '8px 0 16px' }}>
        {post.sdgs?.length ? (
          <div>SDGs: {post.sdgs.map(s => (s.number ? `#${s.number} ${s.title}` : s.title || '')).join(', ')}</div>
        ) : null}
        {post.themes?.length ? <div>Themes: {post.themes.map(t => t.title).join(', ')}</div> : null}
        {post.countries?.length ? <div>Countries: {post.countries.map(c => c.title).join(', ')}</div> : null}
      </div>

      {post.body && (
        <article style={{ marginTop: 20 }}>
          <PortableText value={post.body} />
        </article>
      )}
    </main>
  )
}
