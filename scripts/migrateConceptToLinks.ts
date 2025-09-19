// scripts/migrateConceptToLinks.ts
import {createClient} from '@sanity/client'
import {projectId, dataset, apiVersion} from '/src/sanity/env'

const migrationClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN || process.env.SANITY_AUTH_TOKEN, // <-- required
})

async function migrate() {
  // grab posts that still have the old field
  const posts: Array<{_id: string; concept?: string}> = await migrationClient.fetch(
    `*[_type=="post" && defined(concept)]{_id, concept}`
  )

  if (!posts.length) {
    console.log('Nothing to migrate. All good!')
    return
  }

  for (const p of posts) {
    // append a link item and remove the old field
    await migrationClient
      .patch(p._id)
      .setIfMissing({links: []})
      .append('links', [
        {_type: 'linkItem', title: 'Concept note', url: p.concept},
      ])
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
