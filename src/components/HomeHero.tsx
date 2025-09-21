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
  partners?: string
  mainImage?: SanityImageSource
  youtube?: string
  sdgNums?: number[]
  themeIds?: string[]
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
    if (!(u.hostname.includes('youtube.com') || u.hostname.includes('youtu.be'))) return null
    if (u.hostname.includes('youtu.be')) return u.pathname.replace('/', '')
    const v = u.searchParams.get('v'); if (v) return v
    const last = u.pathname.split('/').at(-1)
    return last && /^[\w-]{11}$/.test(last) ? last : null
  } catch {
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

// Build a relaxed wildcard pattern for GROQ `match`
function makeSearchPattern(q?: string): string | null {
  if (!q) return null
  const trimmed = q.trim()
  if (!trimmed) return null
  // turn "climate action" into "*climate*action*"
  const core = trimmed.replace(/\s+/g, '*')
  return `*${core}*`
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
  seriesParam?: string,
  qParam?: string
): Promise<Post[]> {
  const sdgs = parseSdgsParam(sdgsParam)
  const themes = parseThemesParam(themesParam)
  const series = parseSeriesParam(seriesParam)
  const qPattern = makeSearchPattern(qParam)

  const query = `
    *[_type == "post" && (
      ($series == null || series._ref in $series) &&
      ($sdgs == null || count((sdgs[]->number)[@ in $sdgs]) > 0) &&
      ($themes == null || count(themes[@._ref in $themes]) > 0) &&
      ($qPattern == null || (
        coalesce(title, "") match $qPattern ||
        coalesce(partners, "") match $qPattern ||
        coalesce(pt::text(description), "") match $qPattern
      ))
    )] | order(date desc){
      _id,
      title,
      slug,
      partners,
      mainImage,
      youtube,
      "sdgNums": sdgs[]->number,
      "themeIds": themes[]._ref,
      series->{ _id, title }
    }
  `
  return client.fetch(query, { sdgs, themes, series, qPattern }, { cache: 'no-store' })
}

// ---- Component ----
export default async function HomeHero({
  sdgsParam,
  themesParam,
  seriesParam,
  qParam, // ⬅️ new
}: {
  sdgsParam?: string
  themesParam?: string
  seriesParam?: string
  qParam?: string
}) {
  const [posts, allThemes, allSeries] = await Promise.all([
    getPosts(sdgsParam, themesParam, seriesParam, qParam),
    getThemes(),
    getSeries(),
  ])

  // Compute which filters actually have posts (after search & current selections)
  const availableSdgNums = new Set<number>()
  const availableThemeIds = new Set<string>()
  const availableSeriesIds = new Set<string>()

  for (const p of posts) {
    for (const n of (p.sdgNums ?? [])) availableSdgNums.add(n)
    for (const tid of (p.themeIds ?? [])) availableThemeIds.add(tid)
    if (p.series?._id) availableSeriesIds.add(p.series._id)
  }

  const filteredThemes = allThemes.filter(t => availableThemeIds.has(t._id))
  const filteredSeries = allSeries.filter(s => availableSeriesIds.has(s._id))
  const allowedSdgs = Array.from(availableSdgNums).sort((a,b)=>a-b)

  const selectedSdgs = new Set(parseSdgsParam(sdgsParam) ?? [])
  const selectedThemes = new Set(parseThemesParam(themesParam) ?? [])
  const selectedSeries = new Set(parseSeriesParam(seriesParam) ?? [])
  const selectedSeriesLabels = new Set(
    filteredSeries
      .filter(s => selectedSeries.has(s._id))
      .map(s => s.title)
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
      The below is a collection of all sessions held as part of the        <em>SDG in Practice</em> since its inception in 2018. You can filter series, SDGs, and themes, or use the search box to find specific topics or partners.
<p className="results-line">
  {posts.length} {posts.length === 1 ? 'result' : 'results'}
  {(selectedSeries.size > 0 || selectedSdgs.size > 0 || selectedThemes.size > 0 || qParam) && (
    <>
      {' '}(
      {qParam ? <>search: “{qParam}”</> : null}
      {qParam && (selectedSeries.size > 0 || selectedSdgs.size > 0 || selectedThemes.size > 0) ? ' & ' : ''}
      {selectedSeries.size
        ? Array.from(selectedSeriesLabels).join(', ')
        : (selectedSdgs.size > 0 || selectedThemes.size > 0 || qParam ? ' ' : '')}
      {selectedSeries.size > 0 && (selectedSdgs.size > 0 || selectedThemes.size > 0) ? ' & ' : ''}
      {selectedSdgs.size
        ? `${selectedSdgs.size} SDG${selectedSdgs.size > 1 ? 's' : ''}`
        : ''}
      {selectedThemes.size
        ? `${selectedSeries.size > 0 || selectedSdgs.size > 0 ? ' & ' : ''}${selectedThemes.size} theme${selectedThemes.size > 1 ? 's' : ''}`
        : ''}
      )
      {qParam && (
        <> <a href="." className="reset-link">Reset search</a></>
      )}
    </>
  )}
</p>



      <div className="homehero-layout">
        {/* LEFT: Filters (now with a text search at the top) */}
        <aside className="filters">
          {/* ===== Search box ===== */}
  
          <form method="GET" action="." className="filter-search">
            <input
              type="text"
              name="q"
              placeholder="Session, partners, description"
              defaultValue={qParam ?? ''}
              className="filter-search__input"
            />
            {/* preserve current filters on submit */}
            {sdgsParam ? <input type="hidden" name="sdgs" value={sdgsParam} /> : null}
            {themesParam ? <input type="hidden" name="themes" value={themesParam} /> : null}
            {seriesParam ? <input type="hidden" name="series" value={seriesParam} /> : null}
            <button type="submit" className="filter-search__button">Search</button>
          </form>

          <div className="filter_menu filter-menu--spaced"><strong>Filter by Series</strong></div>
          <SeriesFilter series={filteredSeries} />

          <div className="filter_menu filter-menu--spaced"><strong>Filter by SDGs</strong></div>
          <SdgFilter allowedSdgs={allowedSdgs} />

          <div className="filter_menu filter-menu--spaced"><strong>Filter by Themes</strong></div>
          <ThemeFilter themes={filteredThemes} />
        </aside>

        {/* RIGHT: Cards */}
        <section className="cards">
          <div className="post-grid">
           {posts.map(post => {
  const href = `/posts/${post.slug?.current ?? ''}`
  const ytId = getYouTubeId(post.youtube)

  let thumb: string | undefined
  let imgClass = ''

  if (post.mainImage) {
    thumb = urlFor(post.mainImage)
    imgClass = 'post-card__image-studio'
  } else if (ytId) {
    thumb = youTubeThumb(ytId)
    imgClass = 'post-card__image-youtube'
  }

  return (
    <Link key={post._id} href={href} className="post-card" aria-label={post.title}>
      <div className="post-card__media">
        {thumb ? (
          <img src={thumb} alt={post.title} className={imgClass} />
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
