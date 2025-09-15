import {defineType, defineField} from 'sanity'

export const themeType = defineType({
  name: 'theme',
  title: 'Theme',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: r => r.required() }),
  ],
})
