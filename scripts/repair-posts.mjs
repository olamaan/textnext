// scripts/repair-posts.mjs
// Usage: node scripts/repair-posts.mjs

import {createClient} from '@sanity/client'
import {config as loadEnv} from 'dotenv'
loadEnv({ path: '.env.local' }); loadEnv()

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-09-13',
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
})

const rnd = () => Math.random().toString(36).slice(2)
const key = (p='k') => `${p}_${Date.now().toString(36)}_${rnd()}`
const clean = s => (s==null?'':String(s)).trim()

// Fields we keep in 'post'
const KEEP = new Set(['_type','_id','_rev','_createdAt','_updatedAt',
  'title','slug','date','venue','partners','description','sdgs','links','youtube','series','mainImage','themes'
])

function ensureKeysOnPT(blocks){
  if(!Array.isArray(blocks)) return undefined
  return blocks.map(b=>{
    const nb = {...b}
    if (!nb._key) nb._key = key('blk')
    if (Array.isArray(nb.children)) {
      nb.children = nb.children.map(ch => ({...ch, _key: ch._key || key('spn')}))
    }
    return nb
  })
}
function ensureKeysOnRefs(arr){
  if(!Array.isArray(arr)) return undefined
  return arr.map(item => {
    if (!item || item._type!=='reference') return item
    return {...item, _key: item._key || key('ref')}
  })
}
function ensureKeysOnLinks(arr){
  if(!Array.isArray(arr)) return undefined
  return arr.map(it => ({...it, _key: it._key || key('lnk')}))
}

async function run(){
  const posts = await client.fetch(`*[_type=="post"]{ _id, _type, ..., sdgs[], description, links[] }`)
  let ok=0, skip=0
  for (const doc of posts){
    const patch = client.patch(doc._id)

    // 1) Remove unknown fields
    const unknown = Object.keys(doc).filter(k => !KEEP.has(k))
    if (unknown.length) patch.unset(unknown.map(k => [k]))

    // 2) Fix arrays with missing _key
    if (doc.description) patch.set({ description: ensureKeysOnPT(doc.description) })
    if (doc.sdgs)        patch.set({ sdgs: ensureKeysOnRefs(doc.sdgs) })
    if (doc.links)       patch.set({ links: ensureKeysOnLinks(doc.links) })

    // 3) Partners should be a string (not array)
    if (Array.isArray(doc.partners)) {
      patch.set({ partners: doc.partners.filter(Boolean).join(', ') })
    }

    // Only commit if something changed
    const ops = patch.operations
    if (!ops || ops.length===0){ skip++; continue }

    await patch.commit()
    ok++
    console.log(`🔧 fixed ${doc._id}`)
  }
  console.log(`\nRepair done. Fixed: ${ok}, Unchanged: ${skip}`)
}

run().catch(e=>{ console.error(e); process.exit(1) })
