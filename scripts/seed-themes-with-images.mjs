// Usage:
//   node scripts/seed-themes-imageurl.mjs
//   node scripts/seed-themes-imageurl.mjs --dry-run
//
// What it does:
// - Deletes ALL existing `theme` documents
// - Creates new theme docs with: {title, link, imageUrl?}.
// - imageUrl is parsed from your provided HTML snippets (background:url(...)).
// - No image uploading—just stores the absolute URL.
//
// Env required in .env/.env.local:
//   NEXT_PUBLIC_SANITY_PROJECT_ID
//   NEXT_PUBLIC_SANITY_DATASET
//   NEXT_PUBLIC_SANITY_API_VERSION (optional; default below)
//   SANITY_WRITE_TOKEN or SANITY_AUTH_TOKEN (Editor or higher)

import {createClient} from '@sanity/client'
import {config as loadEnv} from 'dotenv'

loadEnv({path: '.env.local'})
loadEnv()

const DRY = process.argv.includes('--dry-run')

const projectId  = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset    = process.env.NEXT_PUBLIC_SANITY_DATASET
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01'
const token      = process.env.SANITY_WRITE_TOKEN || process.env.SANITY_AUTH_TOKEN

if (!projectId) throw new Error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID')
if (!dataset)   throw new Error('Missing NEXT_PUBLIC_SANITY_DATASET')
if (!token)     throw new Error('Missing SANITY_WRITE_TOKEN / SANITY_AUTH_TOKEN')

const client = createClient({projectId, dataset, apiVersion, token, useCdn: false})
const BASE = 'https://sdgs.un.org'

// ------------------ 1) Canonical list (title, link) ------------------
const topics = [
  ["Africa","https://sdgs.un.org/topics/africa"],
  ["Atmosphere","https://sdgs.un.org/topics/atmosphere"],
  ["Biodiversity and ecosystems","https://sdgs.un.org/topics/biodiversity-and-ecosystems"],
  ["Capacity Development","https://sdgs.un.org/topics/capacity-development"],
  ["Chemicals and waste","https://sdgs.un.org/topics/chemicals-and-waste"],
  ["Climate Action and Synergies","https://sdgs.un.org/topics/climate-action-and-synergies"],
  ["Desertification, land degradation and drought","https://sdgs.un.org/topics/desertification-land-degradation-and-drought"],
  ["Disaster risk reduction","https://sdgs.un.org/topics/disaster-risk-reduction"],
  ["Education","https://sdgs.un.org/topics/education"],
  ["Employment, decent work for all and social protection","https://sdgs.un.org/topics/employment-decent-work-for-all-and-social-protection"],
  ["Energy","https://sdgs.un.org/topics/energy"],
  ["Finance","https://sdgs.un.org/topics/finance"],
  ["Financial inclusion","https://sdgs.un.org/topics/financial-inclusion"],
  ["Food security and nutrition and sustainable agriculture","https://sdgs.un.org/topics/food-security-and-nutrition-and-sustainable-agriculture"],
  ["Forests","https://sdgs.un.org/topics/forests"],
  ["Gender equality and women’s empowerment","https://sdgs.un.org/topics/gender-equality-and-womens-empowerment"],
  ["Green economy","https://sdgs.un.org/topics/green-economy"],
  ["Health and population","https://sdgs.un.org/topics/health-and-population"],
  ["Indicators","https://sdgs.un.org/topics/indicators"],
  ["Industry","https://sdgs.un.org/topics/industry"],
  ["Information for integrated Decision-Making and Participation","https://sdgs.un.org/topics/information-integrated-decision-making-and-participation"],
  ["Institutional Frameworks and international cooperation for Sustainable Development","https://sdgs.un.org/topics/institutional-frameworks-and-international-cooperation-sustainable-development"],
  ["Mountains","https://sdgs.un.org/topics/mountains"],
  ["Multi-stakeholder partnerships","https://sdgs.un.org/topics/multi-stakeholder-partnerships"],
  ["National strategies and SDG integration","https://sdgs.un.org/topics/national-strategies-and-sdg-integration"],
  ["Poverty eradication","https://sdgs.un.org/topics/poverty-eradication"],
  ["Rural Development","https://sdgs.un.org/topics/rural-development"],
  ["Science","https://sdgs.un.org/topics/science"],
  ["Small Island Developing States","https://sdgs.un.org/topics/small-island-developing-states"],
  ["Sustainable cities and human settlements","https://sdgs.un.org/topics/sustainable-cities-and-human-settlements"],
  ["Sustainable consumption and production","https://sdgs.un.org/topics/sustainable-consumption-and-production"],
  ["Sustainable tourism","https://sdgs.un.org/topics/sustainable-tourism"],
  ["Sustainable transport","https://sdgs.un.org/topics/sustainable-transport"],
  ["Technical Cooperation","https://sdgs.un.org/topics/technical-cooperation"],
  ["Technology","https://sdgs.un.org/topics/technology"],
  ["Trade","https://sdgs.un.org/topics/trade"],
  ["Violence against children","https://sdgs.un.org/topics/violence-against-children"],
  ["Stakeholder Engagement","https://sdgs.un.org/topics/stakeholder-engagement"],
  ["Voluntary National Reviews (VNRs)","https://sdgs.un.org/topics/voluntary-national-reviews-vnrs"],
]

// ------------------ 2) Your HTML cards (with background URLs) ------------------
const HTML_SNIPPETS = `
${String.raw`
<div class="card card-custom topic-01 col-sm-6 col-lg-3">
  <a href="/topics/africa" style="background: url('/sites/default/files/styles/topics_thumbnails/public/2020-07/topics_1-africa-original.jpg.jpg?itok=XG1Ydoul') center no-repeat;">
    <div class="card-body"><h4 class="card-title" style="display:block;">Africa</h4></div>
  </a>
</div>

<div class="card card-custom topic-01 col-sm-6 col-lg-3">
  <a href="/topics/atmosphere" style="background: url('/sites/default/files/styles/topics_thumbnails/public/2020-07/topics_2-atmosphere-original.jpg.jpg?itok=yVzIgH3a') center no-repeat;">
    <div class="card-body"><h4 class="card-title" style="display:block;">Atmosphere</h4></div>
  </a>
</div>

<div class="card card-custom topic-01 col-sm-6 col-lg-3">
  <a href="/topics/biodiversity-and-ecosystems" style="background: url('/sites/default/files/styles/topics_thumbnails/public/2020-07/topics_3-biodiversity-original.jpg.jpg?itok=NpfG5k09') center no-repeat;">
    <div class="card-body"><h4 class="card-title" style="display:block;">Biodiversity and ecosystems</h4></div>
  </a>
</div>

<!-- (keep the rest of your blocks; truncated here for brevity) -->

<div class="card card-custom topic-01 col-sm-6 col-lg-3">
  <a href="/topics/violence-against-children" style="background: url('/sites/default/files/styles/topics_thumbnails/public/2020-07/children.jpg?itok=WD3JDRuy') center no-repeat;">
    <div class="card-body"><h4 class="card-title" style="display:block;">Violence against children</h4></div>
  </a>
</div>

<div class="card card-custom topic-01 col-sm-6 col-lg-3">
  <a href="/topics/water-and-sanitation" style="background: url('/sites/default/files/styles/topics_thumbnails/public/2020-07/water_0.jpg?itok=K-KM6DEs') center no-repeat;">
    <div class="card-body"><h4 class="card-title" style="display:block;">Water and Sanitation</h4></div>
  </a>
</div>
`}
`;

// ------------------ 3) Parse helpers ------------------
function normalizeTitle(s='') {
  return s.trim().replace(/\s+/g, ' ')
}
function normalizeUrl(u='') {
  try {
    const url = new URL(u.trim())
    url.pathname = url.pathname.replace(/\/+$/,'')
    return url.toString()
  } catch {
    return u.trim()
  }
}
function absolutize(pathOrUrl) {
  if (!pathOrUrl) return undefined
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl
  if (pathOrUrl.startsWith('/')) return BASE + pathOrUrl
  return `${BASE}/${pathOrUrl.replace(/^\/+/, '')}`
}

// Returns Map<title, imageUrl>
function extractImageMap(html) {
  const map = new Map()
  const blocks = html.split(/<div\s+class=["']card\b[^>]*>/i).slice(1)

  for (const b of blocks) {
    const titleMatch = b.match(/<h4[^>]*class=["']card-title["'][^>]*>([^<]+)<\/h4>/i)
    const styleMatch = b.match(/style=["'][^"']*background:\s*url\((['"]?)([^)'"]+)\1\)/i)
    if (!titleMatch || !styleMatch) continue

    const title = normalizeTitle(titleMatch[1])
    const rawPath = styleMatch[2].trim()
    const url = absolutize(rawPath)
    if (url) map.set(title, url)
  }
  return map
}

// ------------------ 4) Delete all themes, then seed ------------------
async function deleteAllThemes() {
  if (DRY) {
    console.log('(dry-run) would DELETE all theme docs')
    return
  }
  await client.mutate([{ delete: { query: `*[_type=="theme"]` } }])
  console.log('🗑️  Deleted all existing theme docs')
}

async function seedThemes(imageMap) {
  for (const [title, link] of topics) {
    const doc = {
      _type: 'theme',
      title: normalizeTitle(title),
      link: normalizeUrl(link),
    }

    const maybeImageUrl = imageMap.get(normalizeTitle(title))
    if (maybeImageUrl) {
      doc.imageUrl = maybeImageUrl // <- string/url field on the schema
    }

    if (DRY) {
      console.log(`(dry-run) would CREATE theme: ${doc.title} ${doc.imageUrl ? `← imageUrl set` : ''}`)
    } else {
      await client.create(doc)
      console.log(`✅ Created: ${doc.title}${doc.imageUrl ? ' (with imageUrl)' : ''}`)
    }
  }
}

// ------------------ 5) Run ------------------
async function run() {
  const imageMap = extractImageMap(HTML_SNIPPETS)
  await deleteAllThemes()
  await seedThemes(imageMap)
  console.log(`\nDone${DRY ? ' (dry-run)' : ''}.`)
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
