// scripts/import-posts.mjs
// Usage:
//   node scripts/import-posts.mjs ./data/Dataset.csv
//   node scripts/import-posts.mjs ./data/Dataset.csv --dry-run

import fs from 'node:fs/promises'
import Papa from 'papaparse'
import {createClient} from '@sanity/client'
import {config as loadEnv} from 'dotenv'

loadEnv({ path: '.env.local' })
loadEnv()

const projectId  = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset    = process.env.NEXT_PUBLIC_SANITY_DATASET
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-09-13'
const token      = process.env.SANITY_WRITE_TOKEN
const DRY_RUN    = process.argv.includes('--dry-run')

if (!projectId) throw new Error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID')
if (!dataset)   throw new Error('Missing NEXT_PUBLIC_SANITY_DATASET')
if (!token)     throw new Error('Missing SANITY_WRITE_TOKEN')

console.log('Importing into:', { projectId, dataset, apiVersion, tokenPresent: !!token, dryRun: DRY_RUN })

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false })

// ── header whitelist/norm ──
const HEADER_ALIAS = {
  'title':'title','date':'date','venue':'venue','partners':'partners','description':'description',
  'series':'series','sdgs':'sdgs','sdg':'sdgs','conceptnote':'conceptnote','concept':'conceptnote',
  'youtubelink':'youtubelink','youtubeurl':'youtubelink','youtube':'youtubelink','theme':'theme',
  'themes':'theme','image':'image'
}
function normHeader(h){
  if(!h) return null
  const cleaned = String(h).replace(/^\uFEFF/,'').normalize('NFKD').replace(/[\u2000-\u200D\u2060]/g,'').trim()
  const key = cleaned.toLowerCase().replace(/[^a-z0-9]+/g,'')
  return HEADER_ALIAS[key] ?? null
}

// ── helpers ──
const rnd = () => Math.random().toString(36).slice(2)
const key = (prefix='k') => `${prefix}_${Date.now().toString(36)}_${rnd()}`

function cleanString(val){
  if (val == null) return ''
  let s = String(val)
  s = s.replace(/\r\n/g,'\n').replace(/[“”]/g,'"').replace(/[‘’]/g,"'").replace(/\u00A0/g,' ')
  s = s.replace(/\s+/g,' ').trim()
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) s = s.slice(1,-1).trim()
  return s
}
function slugify(input){
  return cleanString(input).toLowerCase().replace(/&/g,' and ').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,96)
}
function toISOFromDdmmyy(d){
  const s = cleanString(d); if(!s) return undefined
  const m = s.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{2}|\d{4})$/); if(!m) return undefined
  const day = +m[1]; const mon3 = m[2].toLowerCase(); const yRaw = m[3]
  const MONTHS = {jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12}
  const month = MONTHS[mon3]; if(!month || day<1 || day>31) return undefined
  let year = +yRaw; if (yRaw.length===2) year = 2000 + year
  return `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`
}
function toPTBlocks(text){
  const raw = cleanString(text); if(!raw) return undefined
  const paras = raw.split(/\n{2,}/).map(s=>s.trim()).filter(Boolean); if(!paras.length) return undefined
  return paras.map(p => ({
    _type:'block', _key:key('blk'), style:'normal', markDefs:[],
    children:[{ _type:'span', _key:key('spn'), text:p, marks:[] }]
  }))
}
function parseSdgNumbers(raw){
  const s = cleanString(raw); if(!s) return []
  return s.split(',').map(x => x.replace(/sdg/gi,'').replace(/[^\d]/g,'').trim())
           .map(n => parseInt(n,10)).filter(n => Number.isInteger(n) && n>=1 && n<=17)
}
async function sdgRefsFromNumbers(nums){
  if(!nums.length) return []
  const uniq = [...new Set(nums)].sort((a,b)=>a-b)
  const sdgs = await client.fetch(`*[_type=="sdg" && number in $nums]{_id, number}`, { nums: uniq })
  const map = new Map(sdgs.map(s => [s.number, s._id]))
  // IMPORTANT: give each ref an _key
  return uniq.flatMap(n => map.get(n) ? [{ _type:'reference', _ref: map.get(n), _key: key('sdg') }] : (console.warn(`⚠️ SDG ${n} not found; skipping`), []))
}
async function getExistingSeriesRef(v){
  const s = cleanString(v); if(!s) return undefined
  const asYear = parseInt(s,10)
  if(!Number.isNaN(asYear)){
    const byYear = await client.fetch(`*[_type=="series" && year==$y][0]{_id}`, { y: asYear })
    if(byYear?._id) return { _type:'reference', _ref: byYear._id }
  }
  const byTitle = await client.fetch(`*[_type=="series" && title==$t][0]{_id}`, { t: s })
  if(byTitle?._id) return { _type:'reference', _ref: byTitle._id }
  console.warn(`⚠️ Series not found: "${s}" → leaving unset`)
  return undefined
}
async function upsertPostBySlug(slugCurrent, doc){
  const existingId = await client.fetch(`*[_type=="post" && slug.current==$s][0]._id`, { s: slugCurrent })
  if (existingId){
    if (DRY_RUN){ console.log(`(dry-run) would PATCH ${existingId} (${doc.title})`); return { _id: existingId } }
    return client.patch(existingId).set(doc).commit()
  }
  if (DRY_RUN){ console.log(`(dry-run) would CREATE post (${doc.title})`); return { _id: 'dry-run' } }
  return client.create({ _type:'post', ...doc })
}

// ── importer ──
async function run(){
  const filePath = process.argv[2]
  if(!filePath){ console.error('Usage: node scripts/import-posts.mjs ./data/posts.csv [--dry-run]'); process.exit(1) }

  const raw = await fs.readFile(filePath,'utf8')
  const ignored = new Set()
  Papa.parse(raw, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => {
      const canon = normHeader(h)
      if (!canon) { ignored.add(String(h)); return undefined }
      return canon
    },
    complete: async ({data: rows}) => {
      if (ignored.size) console.warn('⚠️ Ignored CSV headers:', Array.from(ignored).join(', '))

      let ok=0, fail=0
      for (const [i, row] of rows.entries()){
        try{
          const title   = cleanString(row.title)
          if (!title){ console.warn(`Row ${i+2}: missing Title → skipped`); continue }
          const slug    = slugify(title)
          const dateISO = toISOFromDdmmyy(row.date)
          const venue   = cleanString(row.venue) || undefined
          const partners= cleanString(row.partners) || undefined
          const descPT  = toPTBlocks(row.description)
          const youtube = cleanString(row.youtubelink) || undefined
          const sdgRefs = await sdgRefsFromNumbers(parseSdgNumbers(row.sdgs))
          const series  = await getExistingSeriesRef(row.series)

          // links[] from Concept Note (with _key)
          const cn = cleanString(row.conceptnote)
          const links = cn ? [{ _type:'linkItem', _key:key('lnk'), title:'Concept note', url: cn }] : undefined

          const doc = {
            title,
            slug: { _type:'slug', current: slug },
            date: dateISO,
            venue,
            partners,
            description: descPT,
            sdgs: sdgRefs.length ? sdgRefs : undefined,
            links,
            youtube,
            series,
          }

          await upsertPostBySlug(slug, doc)
          ok++; console.log(`✅ ${title}`)
        }catch(err){
          fail++; console.error(`❌ Row ${i+2} failed:`, err?.message || err)
        }
      }
      console.log(`\nDone. Success: ${ok}, Failed: ${fail}`)
    }
  })
}
run().catch(err => { console.error(err); process.exit(1) })
