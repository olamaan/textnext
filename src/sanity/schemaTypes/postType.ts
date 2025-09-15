import {defineType, defineField} from 'sanity'

export const postType = defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: r => r.required() }),

    // (If you already added slug, keep it so detail pages work)
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: r => r.required(),
    }),

    // NEW: relations
    defineField({
      name: 'sdgs',
      title: 'SDGs',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'sdg' }] }],
    }),
    defineField({
      name: 'themes',
      title: 'Themes',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'theme' }] }],
    }),
    defineField({
      name: 'countries',
      title: 'Countries',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'country' }] }],
    }),

    defineField({ name: 'body', title: 'Body', type: 'array', of: [{ type: 'block' }] }),
    defineField({ name: 'mainImage', title: 'Main Image', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'publishedAt', title: 'Published At', type: 'datetime', initialValue: () => new Date().toISOString() }),
  ],
})
