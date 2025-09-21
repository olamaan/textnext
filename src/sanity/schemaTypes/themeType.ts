import { defineType, defineField } from 'sanity'

export const themeType = defineType({
  name: 'theme',
  title: 'Theme',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: r => r.required(),
    }),
    defineField({
      name: 'link',
      title: 'Link (external URL)',
      type: 'url',
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
    }),

        defineField({
      name: 'imageUrl',
      title: 'Image Link',
      type: 'string'
    }),


    defineField({
      name: 'text',
      title: 'Short description',
      type: 'text',
      rows: 3,
      description: 'Blurb shown in “Explore more” section',
    }),
  ],
  preview: {
    select: { title: 'title', media: 'image', subtitle: 'link' },
  },
})
