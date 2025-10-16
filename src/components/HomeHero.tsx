// src/components/HomeHero.tsx

import { fetchCached } from '@/app/sanity/lib/client'


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

 

async function getThemeIdsUsed(): Promise<string[]> {
  const query = `array::unique(*[_type=="post" && count(themes)>0].themes[]._ref)`
  return client.fetch(query, {}, { next: { revalidate: 600 } }) // cache 10 min
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


function parseYearsParam(seriesParam?: string): number[] | null {
  if (!seriesParam) return null
  const nums = seriesParam
    .split(',')
    .map(s => parseInt(s.trim(), 10))
    .filter(n => !Number.isNaN(n) && n >= 2000 && n <= 2100)
  return nums.length ? nums : null
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
  const years = parseYearsParam(seriesParam)    

  const qPattern = makeSearchPattern(qParam)

  const query = `
    *[_type == "post" && (
     ($years == null || (defined(series->year) && series->year in $years)) &&
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
  return client.fetch(query, { sdgs, themes, years, qPattern }, { cache: 'no-store' })


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
 

  const [posts, allThemes, allSeries, usedThemeIds] = await Promise.all([
  getPosts(sdgsParam, themesParam, seriesParam, qParam),
  getThemes(),
  getSeries(),
  getThemeIdsUsed(),   // ⬅️ new
])



  // Compute which filters actually have posts (after search & current selections)
  const availableSdgNums = new Set<number>()
  
const availableThemeIds = new Set<string>()

  // Themes that exist on at least one post (global, not filtered by current search)
const themesWithPosts = allThemes.filter(t => usedThemeIds.includes(t._id))

// (optional) For muted styling, which of those have matches under current filters:
 
  const availableSeriesIds = new Set<string>()

  for (const p of posts) {
    for (const n of (p.sdgNums ?? [])) availableSdgNums.add(n)
    for (const tid of (p.themeIds ?? [])) availableThemeIds.add(tid)
    if (p.series?._id) availableSeriesIds.add(p.series._id)
  }

 

  const filteredThemes = allThemes.filter(
  t => availableThemeIds.has(t._id) || (new Set(parseThemesParam(themesParam) ?? [])).has(t._id)
)

  const enabledThemeIds = Array.from(availableThemeIds)

  const filteredSeries = allSeries.filter(s => availableSeriesIds.has(s._id))

  const enabledSeriesIds = Array.from(availableSeriesIds)



  const allowedSdgs = Array.from(availableSdgNums).sort((a,b)=>a-b)

  const selectedSdgs = new Set(parseSdgsParam(sdgsParam) ?? [])
  const selectedThemes = new Set(parseThemesParam(themesParam) ?? [])
 
  const selectedSeriesYears = parseYearsParam(seriesParam) ?? []
const selectedSeriesLabels = selectedSeriesYears.map(String)


  // Selected IDs from the URL
const selectedSeriesIds = parseSeriesParam(seriesParam) ?? []

 


 

  return (
    <>
    
     
     <div className="post-two-col">
      
        <div className="post-main">

           <img
        src="https://sdgs.un.org/sites/default/files/2024-06/SDGs-in-Practice-Logo_0.png"
        className="library_image"
        style={{ marginBottom: '30px' }}
        alt="SDGs in Practice"
      />

        <h2>SDGs in Practice Learning Library</h2>
      The below is a collection of all sessions held as part of the        <em>SDG in Practice</em> series from 2021. Filter by series (year), SDGs, and themes, or use the search box to find specific sessions. 


<p></p>
        </div>

      <aside className="post-related">

      

<h2>Series</h2>

        <p></p>

<div className="theme-filter">
<a   href="https://sdgs.un.org/2025/SDGsinPractice"><button type="button" className="theme-chip  " title="2025"  >2025</button></a>
<a   href="https://sdgs.un.org/2024/SDGsinPractice"><button type="button" className="theme-chip" title="2024"  >2024</button></a>
<a   href="https://sdgs.un.org/events/2023sdgslearningtrainingpractice"><button type="button" className="theme-chip" title="2023"  >2023</button></a>
<a   href="https://sdgs.un.org/events/2022-sdgs-learning-training-and-practice"><button type="button" className="theme-chip" title="2022"  >2022</button></a>
<a   href="https://sdgs.un.org/events/2021-sdgs-learning-training-and-practice"><button type="button" className="theme-chip" title="2021"  >2021</button></a>
<a   href="https://sustainabledevelopment.un.org/index.php?page=view&type=12&nr=3477&menu=14"><button type="button" className="theme-chip" title="2020"  >2020</button></a>
<a   href="https://sustainabledevelopment.un.org/index.php?page=view&type=12&nr=3237&menu=14"><button type="button" className="theme-chip" title="2019"  >2019</button></a>
<a   href="https://sustainabledevelopment.un.org/index.php?page=view&type=12&nr=2756&menu=14"><button type="button" className="theme-chip" title="2018"  >2018</button></a>
<a   href="https://sdgs.un.org/sites/default/files/documents/15936HPLF_SDGs_Learning_final_programme.pdf"><button type="button" className="theme-chip" title="2017"  >2017</button></a>
<a   href="https://sustainabledevelopment.un.org/index.php?menu=3189"><button type="button" className="theme-chip" title="2017"  >2016</button></a>



</div>


<p></p>


 
        
      </aside>
     </div>
     
    

 
 

    


      <div className="homehero-layout">
        {/* LEFT: Filters (now with a text search at the top) */}
        <aside className="filters">

          <p className="results-line">
  {posts.length} {posts.length === 1 ? 'result' : 'results'}
  {(selectedSeriesIds.length > 0 || selectedSdgs.size > 0 || selectedThemes.size > 0 || qParam) && (
    <>
      {' '}(
      {qParam ? <>search: “{qParam}”</> : null}
      {qParam && (selectedSeriesIds.length > 0 || selectedSdgs.size > 0 || selectedThemes.size > 0) ? ' & ' : ''}
      {selectedSeriesIds.length > 0
        ? selectedSeriesLabels.join(', ')
        : (selectedSdgs.size > 0 || selectedThemes.size > 0 || qParam ? ' ' : '')}
      {selectedSeriesIds.length > 0 && (selectedSdgs.size > 0 || selectedThemes.size > 0) ? ' & ' : ''}
      {selectedSdgs.size
        ? `${selectedSdgs.size} SDG${selectedSdgs.size > 1 ? 's' : ''} (${Array.from(selectedSdgs).sort((a,b)=>a-b).join(', ')})`
        : ''}
      {selectedThemes.size
        ? `${selectedSeriesIds.length > 0 || selectedSdgs.size > 0 ? ' & ' : ''}${selectedThemes.size} theme${selectedThemes.size > 1 ? 's' : ''}`
        : ''}
      )
      {qParam && (
        <> <a href="." className="reset-link">Reset search</a></>
      )}
    </>
  )}
</p>


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
<SeriesFilter />


          <div className="filter_menu filter-menu--spaced"><strong>Filter by SDGs</strong></div>
         <SdgFilter />


          <div className="filter_menu filter-menu--spaced"><strong>Filter by Themes</strong></div>
<ThemeFilter themes={themesWithPosts} enabledIds={enabledThemeIds} />

          
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
else {
    // Fallback when there is NO Studio image
    thumb = '/images/bg3_wide.png'
    imgClass = 'post-card__image-fallback'
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
