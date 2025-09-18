import { defineType, defineField } from 'sanity'

export const seriesType = defineType({
  name: 'series',
  title: 'Series',
  type: 'document',
  fields: [
    defineField({
      name: 'year',
      title: 'Year',
      type: 'number',
      validation: r =>
        r.required().integer().positive().min(2000).max(2100),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'e.g. “2025 SDGs in Practice”',
      validation: r => r.required(),
    }),
    defineField({
      name: 'link',
      title: 'Link',
      type: 'url',
      description: 'e.g. https://sdgs.un.org/2025/SDGsinPractice',
      validation: r => r.uri({ scheme: ['http', 'https'] }),
    }),
  ],
  orderings: [
    {
      title: 'Year (desc)',
      name: 'yearDesc',
      by: [{ field: 'year', direction: 'desc' }],
    },
    {
      title: 'Title (A→Z)',
      name: 'titleAsc',
      by: [{ field: 'title', direction: 'asc' }],
    },
  ],
  preview: {
    select: { title: 'title', subtitle: 'year' },
    prepare({ title, subtitle }) {
      return { title, subtitle: subtitle ? `Year: ${subtitle}` : undefined }
    },
  },
})
