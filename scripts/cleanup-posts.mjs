// scripts/cleanup-posts.mjs
// Usage: node scripts/cleanup-posts.mjs [--dry-run]

import {createClient} from '@sanity/client'
import {config as loadEnv} from 'dotenv'

loadEnv({ path: '.env.local' })
loadEnv()

const projectId  = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset    = process.env.NEXT_PUBLIC_SANITY_DATASET
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-09-13'
const token      = process.env.SANITY_WRITE_TOKEN

const DRY = process.argv.includes('--dry-run')

if (!projectId) throw new Error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID')
if (!dataset)   throw new Error('Missing NEXT_PUBLIC_SANITY_DATASET')
if (!token)     throw new Error('Missing SANITY_WRITE_TOKEN')

const client = createClient({projectId, dataset, apiVersion, token, useCdn:false})

// Allowed keys (post schema)
const allowed = new Set([
  // system
  '_id','_type','_createdAt','_updatedAt','_rev',
  // post fields
  'title','series','slug','date','venue','partners','description',
  'sdgs','links','youtube','mainImage','themes','time'
])

function isObject(v){ return v && typeof v==='object' && !Array.isArray(v) }

async function run(){
  // Pull full docs so we can see all keys
  const posts = await client.fetch(`*[_type=="post"]`)

  let changed = 0, scanned = 0
  for (const doc of posts){
    scanned++
    const id = doc._id
    // Compute unknown top-level keys
    const unknown = Object.keys(doc).filter(k => !allowed.has(k))

    // Optional: fix partners if it’s an array → join
    let partnersFix
    if (Array.isArray(doc.partners)) {
      partnersFix = doc.partners.filter(Boolean).join(', ')
    }

    if (!unknown.length && partnersFix === undefined) continue

    if (DRY){
      console.log(`(dry-run) ${id}: unset=${JSON.stringify(unknown)}${partnersFix!==undefined?` set partners="${partnersFix}"`:''}`)
      changed++
      continue
    }

    let p = client.patch(id)
    if (unknown.length) p = p.unset(unknown)
    if (partnersFix !== undefined) p = p.set({partners: partnersFix})

    await p.commit()
    console.log(`✓ cleaned ${id}${unknown.length?` (removed ${unknown.length} unknown)`:''}${partnersFix!==undefined?' (partners normalized)':''}`)
    changed++
  }

  console.log(`\nDone. Scanned: ${scanned}. Cleaned: ${changed}.`)
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
