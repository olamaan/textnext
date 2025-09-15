import groq from 'groq'
import Link from 'next/link'
import { client } from '@/sanity/client'

type Post = { _id: string; title?: string; slug?: { current: string } }

const query = groq`*[_type=="post" && defined(slug.current)]
| order(publishedAt desc)[0..50]{ _id, title, slug }`

export default async function PostsIndex() {
  const posts: Post[] = await client.fetch(query)

  return (
    <main style={{ maxWidth: 800, margin: '2rem auto', fontFamily: 'system-ui' }}>
      <h1>All Posts</h1>
      <ul>
        {posts.map(p => (
          <li key={p._id}>
            <Link href={`/posts/${p.slug?.current}`}>{p.title || '(untitled)'}</Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
