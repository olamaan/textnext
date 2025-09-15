import {defineType, defineField} from 'sanity'

export const countryType = defineType({
  name: 'country',
  title: 'Country',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: r => r.required() }),
  ],
})
