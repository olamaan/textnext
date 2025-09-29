import groq from 'groq'
import Link from 'next/link'
import { client } from '@/sanity/lib/client'

type Row = {
  _id: string
  title?: string
  slug?: string
  partners?: string
  descriptionText?: string
  sdgs?: Array<{ number?: number; title?: string }>
  themes?: Array<{ title?: string }>
  series?: { title?: string; year?: number } | null
}

const query = groq`*[_type=="post"] | order(date desc){
  _id,
  title,
  "slug": slug.current,
  partners,
  "descriptionText": coalesce(pt::text(description), ""),
  "sdgs": sdgs[]->{ number, title },
  "themes": themes[]->{ title },
  "series": series->{ title, year }
}`

const truncate = (s = '', n = 220) => (s.length > n ? s.slice(0, n - 1) + '…' : s)

export default async function ExportPage() {
  const rows = await client.fetch<Row[]>(query, {}, { cache: 'no-store' })

  return (
    <main style={{ padding: '24px' }}>
      <h1 style={{ marginBottom: 12 }}>Content export</h1>
      <p style={{ marginTop: 0, color: '#666' }}>
        {rows.length} {rows.length === 1 ? 'row' : 'rows'}
      </p>

      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 14,
            background: '#fff',
          }}
        >
          <thead>
            <tr>
              <th style={th}>Title</th>
              <th style={th}>Series / Year</th>
              <th style={th}>Description</th>
              <th style={th}>Partners</th>
              <th style={th}>SDGs</th>
              <th style={th}>Themes</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const sdgNums = (r.sdgs ?? [])
                .map((s) => s.number)
                .filter((n): n is number => typeof n === 'number')
                .sort((a, b) => a - b)
                .join(', ')

              const themeNames = (r.themes ?? [])
                .map((t) => t.title)
                .filter(Boolean)
                .join(', ')

              const seriesLabel =
                r.series?.year && r.series?.title
                  ? `${r.series.year} (${r.series.title})`
                  : r.series?.year
                  ? String(r.series.year)
                  : r.series?.title || '—'

              return (
                <tr key={r._id}>
                  <td style={td}>
                    {r.slug ? (
                      <Link href={`/posts/${r.slug}`} style={{ color: '#0a66c2', textDecoration: 'none' }}>
                        {r.title || 'Untitled'}
                      </Link>
                    ) : (
                      r.title || 'Untitled'
                    )}
                  </td>
                  <td style={td}>{seriesLabel}</td>
                  <td style={td} title={r.descriptionText}>
                    {truncate(r.descriptionText)}
                  </td>
                  <td style={td}>{r.partners || '—'}</td>
                  <td style={td}>{sdgNums || '—'}</td>
                  <td style={td}>{themeNames || '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </main>
  )
}

const th: React.CSSProperties = {
  textAlign: 'left',
  padding: '10px 12px',
  borderBottom: '1px solid #e5e5e5',
  background: '#fafafa',
  fontWeight: 600,
  whiteSpace: 'nowrap',
}

const td: React.CSSProperties = {
  padding: '10px 12px',
  borderBottom: '1px solid #f0f0f0',
  verticalAlign: 'top',
}
