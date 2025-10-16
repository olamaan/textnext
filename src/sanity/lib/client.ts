// src/app/sanity/lib/client.ts
import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '../env'

// Optional: only needed for preview/drafts (server-only!)
const token = process.env.SANITY_API_READ_TOKEN

/**
 * Base client for published content (CDN = fast & cacheable).
 * NOTE: useCdn:true works great with ISR/tag revalidation.
 */
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: 'published',
})

/**
 * Preview client for drafts (no CDN, authenticated).
 * Use only when draftMode() is enabled.
 */
export const previewClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  perspective: 'previewDrafts',
  token, // requires a Viewer/Reader token
  stega: { studioUrl: '/studio' }, // optional: source maps for preview
})

/**
 * Fetch published data with Next.js caching controls.
 * Add tags so you can revalidate precisely on publish.
 */
export async function fetchCached<T>(
  query: string,
  params: Record<string, any> = {},
  {
    revalidate = 300,
    tags = [],
  }: { revalidate?: number; tags?: string[] } = {},
) {
  return client.fetch<T>(query, params, {
    next: { revalidate, tags },
  })
}

/**
 * Fetch drafts (preview) with caching disabled,
 * so editors always see fresh content.
 */
export async function fetchPreview<T>(query: string, params: Record<string, any> = {}) {
  return previewClient.fetch<T>(query, params, {
    cache: 'no-store',
  })
}
