// src/sanity/schemaTypes/postType.ts
import {defineType, defineField} from 'sanity'

export const postType = defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: r => r.required() }),
    defineField({ name: 'series', title: 'Series', type: 'reference', to: [{ type: 'series' }], validation: r => r.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title', maxLength: 96 }, validation: r => r.required() }),
    defineField({ name: 'date', title: 'Date', type: 'date', options: { dateFormat: 'YYYY-MM-DD' } }),
    defineField({ name: 'venue', title: 'Venue', type: 'string' }),
 
    defineField({ name: 'description', title: 'Description', type: 'array', of: [{ type: 'block' }] }),
 
        defineField({ name: 'partners', title: 'Partners and Orgs', type: 'text' }),


        defineField({ name: 'sdgs', title: 'SDGs', type: 'array', of: [{ type: 'reference', to: [{ type: 'sdg' }] }] }),

 
    // NEW: multiple links
    defineField({
      name: 'links',
      title: 'Links',
      type: 'array',
      of: [{ type: 'linkItem' }],
      options: { sortable: true }
    }),

    defineField({ name: 'youtube', title: 'Video URL', type: 'url', validation: r => r.uri({ scheme: ['http', 'https'] }) }),
    defineField({ name: 'mainImage', title: 'Image', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'themes', title: 'Themes', type: 'array', of: [{ type: 'reference', to: [{ type: 'theme' }] }] }),
  ],
})
