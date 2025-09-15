import {defineType, defineField} from 'sanity'

export const sdgType = defineType({
  name: 'sdg',
  title: 'SDG',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: r => r.required() }),
    defineField({ name: 'number', title: 'Number', type: 'number', validation: r => r.required() }),
  ],
})
