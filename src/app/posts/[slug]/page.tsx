import groq from 'groq'
import { client } from '../../../sanity/client'
import { PortableText } from '@portabletext/react'

type RefDoc = { _id: string; title?: string; number?: number }
type Post = {
  _id: string
  title?: string
  body?: unknown
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

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post: Post = await client.fetch(query, { slug: params.slug })

  if (!post) return <main><p>Post not found</p></main>

  return (
    <main style={{maxWidth: 800, margin: '2rem auto', fontFamily: 'system-ui'}}>
      <h1>{post.title}</h1>
      {post.publishedAt && <p style={{opacity:.75}}>{new Date(post.publishedAt).toLocaleString()}</p>}

      {/* Relations */}
      <div style={{fontSize:13, opacity:.9, margin:'8px 0 16px'}}>
        {post.sdgs?.length ? <div>SDGs: {post.sdgs.map(s => s.number ? `#${s.number} ${s.title}` : (s.title || '')).join(', ')}</div> : null}
        {post.themes?.length ? <div>Themes: {post.themes.map(t => t.title).join(', ')}</div> : null}
        {post.countries?.length ? <div>Countries: {post.countries.map(c => c.title).join(', ')}</div> : null}
      </div>

      {post.body && <article><PortableText value={post.body} /></article>}
    </main>
  )
}
