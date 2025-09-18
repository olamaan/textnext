// scripts/delete-posts.mjs
// Usage:
//   node scripts/delete-posts.mjs                  # dry-run (default)
//   node scripts/delete-posts.mjs --apply          # actually delete
//   node scripts/delete-posts.mjs --series=2025    # filter example
//   node scripts/delete-posts.mjs --before=2025-01-01
//   node scripts/delete-posts.mjs --query="*[_type=='post' && defined(youtube)]"
//
// Env required: NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_WRITE_TOKEN
// Optional: NEXT_PUBLIC_SANITY_API_VERSION

import {createClient} from '@sanity/client'
import {config as loadEnv} from 'dotenv'
import readline from 'node:readline'

// Load .env.local then .env
loadEnv({ path: '.env.local' })
loadEnv()

const projectId  = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset    = process.env.NEXT_PUBLIC_SANITY_DATASET
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01'
const token      = process.env.SANITY_WRITE_TOKEN

if (!projectId) throw new Error('Missing env NEXT_PUBLIC_SANITY_PROJECT_ID')
if (!dataset)   throw new Error('Missing env NEXT_PUBLIC_SANITY_DATASET')
if (!token)     throw new Error('Missing env SANITY_WRITE_TOKEN (Editor or higher)')

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false })

// Parse simple flags
const args = process.argv.slice(2)
const getFlag = (name) => {
  const hit = args.find(a => a === `--${name}` || a.startsWith(`--${name}=`))
  if (!hit) return undefined
  const [, val] = hit.split('=')
  return val === undefined ? true : val
}

const APPLY   = !!getFlag('apply')
const SERIES  = getFlag('series')      // e.g. 2025 (matches series->year)
const BEFORE  = getFlag('before')      // e.g. 2025-01-01 (matches date < BEFORE)
const CUSTOM  = getFlag('query')       // full custom GROQ query string

// Build query
let query = CUSTOM
if (!query) {
  // Base: all posts
  let conds = [`_type == "post"`]
  if (SERIES) conds.push(`series->year == ${Number(SERIES)}`)
  if (BEFORE) conds.push(`defined(date) && date < "${BEFORE}"`)
  query = `*[${conds.join(' && ')}]`
}

// Helpers
const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const ask = (q) => new Promise(res => rl.question(q, res))

async function run() {
  // Count and preview a few
  const count = await client.fetch(`count(${query})`)
  console.log(`\nQuery: ${query}`)
  console.log(`Matching documents: ${count}\n`)

  if (count === 0) {
    rl.close()
    return
  }

  const sample = await client.fetch(
    `${query}[0...10]{_id, _type, title, "slug": slug.current}`
  )
  console.log('Sample (first 10):')
  sample.forEach(doc => {
    console.log(` - ${doc._id} | ${doc.title || '(no title)'} ${doc.slug ? `(/${doc.slug})` : ''}`)
  })
  console.log('')

  if (!APPLY) {
    console.log('Dry-run complete. Add --apply to actually delete.')
    rl.close()
    return
  }

  const ans = (await ask('Type DELETE to confirm permanent deletion: ')).trim()
  if (ans !== 'DELETE') {
    console.log('Aborted.')
    rl.close()
    return
  }

  // Perform delete by query
  // Note: delete-by-query requires a mutation; we use client.mutate([{delete:{query}}])
  await client.mutate([{ delete: { query } }])

  console.log(`\n✅ Deleted ${count} document(s).`)
  rl.close()
}

run().catch(err => {
  console.error('❌ Error:', err.message || err)
  process.exit(1)
})
