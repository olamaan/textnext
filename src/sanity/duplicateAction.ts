// src/sanity/duplicateAction.ts
import { DocumentActionComponent, useClient } from 'sanity'

export const duplicateAction: DocumentActionComponent = (props) => {
  const client = useClient({ apiVersion: '2024-01-01' })

  return {
    label: 'Duplicate',
    onHandle: async () => {
      const source = props.draft || props.published
      if (!source) {
        props.onComplete()
        return
      }

      // Remove system fields so we get a fresh document
      const { _id, _rev, _createdAt, _updatedAt, ...rest } = source as Record<string, any>

      // Create the copy with a new title and empty slug so the editor must set it
      await client.create({
        ...rest,
        // keep original type
        _type: source._type,
        title: `${source.title ?? 'Untitled'} (Copy)`,
        slug: { _type: 'slug', current: '' },
      })

      props.onComplete()
    },
  }
}
