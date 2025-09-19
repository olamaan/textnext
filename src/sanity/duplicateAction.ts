// src/sanity/duplicateAction.ts
import type { DocumentActionComponent } from 'sanity'
import { useClient } from 'sanity'

export const DuplicateAction: DocumentActionComponent = (props) => {
  // ✅ allowed now that the function is PascalCase
  const client = useClient({ apiVersion: '2024-01-01' })

  return {
    label: 'Duplicate',
    onHandle: async () => {
      const source = (props.draft || props.published) as Record<string, unknown> | null
      if (!source) {
        props.onComplete?.()
        return
      }

      // Strip system fields
      const { _id, _rev, _createdAt, _updatedAt, ...rest } = source

      await client.create({
        ...rest,
        _type: String(source._type || 'post'),
        title: `${(source as { title?: string }).title ?? 'Untitled'} (Copy)`,
        // force a fresh slug
        slug: { _type: 'slug', current: '' },
      })

      props.onComplete?.()
    },
  }
}
