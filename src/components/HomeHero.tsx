// src/components/HomeHero.tsx
import { client } from '@/sanity/lib/client'
import Link from 'next/link'
import imageUrlBuilder from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'

import SdgFilter from '@/components/SdgFilter'
import ThemeFilter from '@/components/ThemeFilter'
import SeriesFilter from '@/components/SeriesFilter'

// ---- Types ----
type Post = {
  _id: string
  title: string
  slug?: { current: string }
  partners?: string            // plain text
  mainImage?: SanityImageSource
  youtube?: string             // for YouTube thumb fallback
  sdgNums?: number[]
  series?: { _id: string; title?: string } | null
}

type Theme = { _id: string; title: string }
type Series = { _id: string; title: string; year?: number }

// ---- Helpers ----
const builder = imageUrlBuilder(client)
function urlFor(source: SanityImageSource) {
  return builder.image(source).width(600).height(400).fit('crop').auto('format').url()
}

function getYouTubeId(input?: string): string | null {
  if (!input) return null

  try {
    const u = new URL(input)

    // ✅ Only proceed if hostname clearly belongs to YouTube
    if (!(u.hostname.includes('youtube.com') || u.hostname.includes('youtu.be'))) {
      return null
    }

    if (u.hostname.includes('youtu.be')) {
      return u.pathname.replace('/', '')
    }
    const v = u.searchParams.get('v')
    if (v) return v
    const last = u.pathname.split('/').at(-1)
    return last && /^[\w-]{11}$/.test(last) ? last : null
  } catch {
    // allow plain 11-char IDs if passed
    return /^[\w-]{11}$/.test(input) ? input : null
  }
}



function youTubeThumb(id?: string | null) {
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : undefined
}

function parseSdgsParam(sdgsParam?: string): number[] | null {
  if (!sdgsParam) return null
  const nums = sdgsParam
    .split(',')
    .map(s => parseInt(s.trim(), 10))
    .filter(n => !Number.isNaN(n) && n >= 1 && n <= 17)
  return nums.length ? nums : null
}
function parseThemesParam(themesParam?: string): string[] | null {
  if (!themesParam) return null
  const ids = themesParam.split(',').map(s => s.trim()).filter(Boolean)
  return ids.length ? ids : null
}
function parseSeriesParam(seriesParam?: string): string[] | null {
  if (!seriesParam) return null
  const ids = seriesParam.split(',').map(s => s.trim()).filter(Boolean)
  return ids.length ? ids : null
}

// ---- Data fetchers ----
async function getThemes(): Promise<Theme[]> {
  return client.fetch(
    `*[_type == "theme"]|order(title asc){ _id, title }`,
    {},
    { cache: 'no-store' }
  )
}
async function getSeries(): Promise<Series[]> {
  return client.fetch(
    `*[_type == "series"]|order(year desc, title asc){ _id, title, year }`,
    {},
    { cache: 'no-store' }
  )
}
async function getPosts(
  sdgsParam?: string,
  themesParam?: string,
  seriesParam?: string
): Promise<Post[]> {
  const sdgs = parseSdgsParam(sdgsParam)
  const themes = parseThemesParam(themesParam)
  const series = parseSeriesParam(seriesParam)

  const query = `
    *[_type == "post" && (
      ($series == null || series._ref in $series) &&
      ($sdgs == null || count((sdgs[]->number)[@ in $sdgs]) > 0) &&
      ($themes == null || count(themes[@._ref in $themes]) > 0)
    )] | order(date desc){
      _id,
      title,
      slug,
      partners,
      mainImage,
      youtube,                      // bring youtube for fallback
      "sdgNums": sdgs[]->number,
      series->{ _id, title }
    }
  `
  return client.fetch(query, { sdgs, themes, series }, { cache: 'no-store' })
}

// ---- Component ----
export default async function HomeHero({
  sdgsParam,
  themesParam,
  seriesParam,
}: {
  sdgsParam?: string
  themesParam?: string
  seriesParam?: string
}) {
  const [posts, allThemes, allSeries] = await Promise.all([
    getPosts(sdgsParam, themesParam, seriesParam),
    getThemes(),
    getSeries(),
  ])

  const selectedSdgs = new Set(parseSdgsParam(sdgsParam) ?? [])
  const selectedThemes = new Set(parseThemesParam(themesParam) ?? [])
  const selectedSeries = new Set(parseSeriesParam(seriesParam) ?? [])
  const selectedSeriesLabels = new Set(
    allSeries.filter(s => selectedSeries.has(s._id)).map(s => s.title)
  )

  return (
    <>
      <img
        src="https://sdgs.un.org/sites/default/files/2024-06/SDGs-in-Practice-Logo_0.png"
        className="library_image"
        style={{ marginBottom: '30px' }}
        alt="SDGs in Practice"
      />

      <h2>Session Library</h2>

      <p className="results-line">
        {posts.length} {posts.length === 1 ? 'result' : 'results'}
        {(selectedSeries.size > 0 || selectedSdgs.size > 0 || selectedThemes.size > 0) && (
          <>
            {' '}(
            {selectedSeries.size
              ? Array.from(selectedSeriesLabels).join(', ')
              : 'filtered by '}
            {selectedSeries.size > 0 && (selectedSdgs.size > 0 || selectedThemes.size > 0) ? ' & ' : ''}
            {selectedSdgs.size
              ? `${selectedSdgs.size} SDG${selectedSdgs.size > 1 ? 's' : ''}`
              : ''}
            {selectedThemes.size
              ? `${selectedSeries.size > 0 || selectedSdgs.size > 0 ? ' & ' : ''}${selectedThemes.size} theme${selectedThemes.size > 1 ? 's' : ''}`
              : ''}
            )
          </>
        )}
      </p>

      <div className="homehero-layout">
        {/* LEFT: Filters */}
        <aside className="filters">
          <div className="filter_menu"><strong>Filter by Series</strong></div>
          <SeriesFilter series={allSeries} />

          <div className="filter_menu filter-menu--spaced"><strong>Filter by SDGs</strong></div>
          <SdgFilter />

          <div className="filter_menu filter-menu--spaced"><strong>Filter by Themes</strong></div>
          <ThemeFilter themes={allThemes} />
        </aside>

        {/* RIGHT: Cards */}
        <section className="cards">
          <div className="post-grid">
            {posts.map(post => {
              const href = `/posts/${post.slug?.current ?? ''}`
         const ytId = getYouTubeId(post.youtube)
const thumb = post.mainImage
  ? urlFor(post.mainImage)
  : ytId
    ? youTubeThumb(ytId)
    : undefined
    

              return (
<Link key={post._id} href={href} className="post-card" aria-label={post.title}>
  <div className="post-card__media">
    {thumb ? (
      <img src={thumb} alt={post.title} />
    ) : (
      <div aria-hidden style={{ width: '100%', height: '100%', background: '#f2f2f2' }} />
    )}

     
  </div>

  <div className="post-card__body">
    <h3 className="post-card__title">{post.title}</h3>
    {post.partners ? (
      <p className="post-card__partners">{post.partners}</p>
    ) : (
      <p className="post-card__partners post-card__partners--empty">No partners listed</p>
    )}
  </div>
</Link>
              )
            })}
          </div>

          {posts.length === 0 && <p className="empty-state">No posts match your filters.</p>}
        </section>
      </div>
    </>
  )
}
