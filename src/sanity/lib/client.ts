// src/sanity/lib/client.ts
import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '../env' // adjust if needed

const token = process.env.SANITY_API_READ_TOKEN

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: 'published',
})

export const previewClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  perspective: 'previewDrafts',
  token,
})

type Params = Record<string, unknown>

export async function fetchCached<T>(
  query: string,
  params: Params = {},
  { revalidate = 300, tags = [] as string[] } = {},
): Promise<T> {
  return client.fetch<T>(query, params, { next: { revalidate, tags } })
}

export async function fetchPreview<T>(
  query: string,
  params: Params = {},
): Promise<T> {
  return previewClient.fetch<T>(query, params, { cache: 'no-store' })
}
