// scripts/migrateConceptToLinks.ts
import {createClient} from '@sanity/client'
import {config as loadEnv} from 'dotenv'

// Load env from .env.local first, then .env
loadEnv({path: '.env.local'})
loadEnv()

const projectId  = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset    = process.env.NEXT_PUBLIC_SANITY_DATASET
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01'
const token      = process.env.SANITY_WRITE_TOKEN || process.env.SANITY_AUTH_TOKEN

if (!projectId) throw new Error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID')
if (!dataset)   throw new Error('Missing NEXT_PUBLIC_SANITY_DATASET')
if (!token)     throw new Error('Missing SANITY_WRITE_TOKEN (Editor or higher)')

const migrationClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token,
})

async function migrate() {
  // 1) Find posts that still have legacy `concept`
  const posts: Array<{_id: string; concept?: string}> = await migrationClient.fetch(
    `*[_type=="post" && defined(concept)]{_id, concept}`
  )

  if (!posts.length) {
    console.log('Nothing to migrate. All good!')
    return
  }

  // 2) For each, append link and unset legacy field
  for (const p of posts) {
    await migrationClient
      .patch(p._id)
      .setIfMissing({links: []})
      .append('links', [{_type: 'linkItem', title: 'Concept note', url: p.concept}])
      .unset(['concept'])
      .commit()

    console.log('Migrated:', p._id)
  }

  console.log('Done.')
}

migrate().catch((err) => {
  console.error(err)
  process.exit(1)
})
