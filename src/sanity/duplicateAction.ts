// /src/sanity/duplicateAction.ts
import { DocumentActionComponent, DocumentActionProps, useClient } from 'sanity'

export const duplicateAction: DocumentActionComponent = (props: DocumentActionProps) => {
  const client = useClient()
  return {
    label: 'Duplicate',
    onHandle: () => {
      const { draft, published } = props
      const source = draft || published
      if (source) {
        client.create({
          ...source,
          _id: undefined, // let Sanity generate a new ID
          slug: undefined, // force user to add new slug
          title: `${source.title} (Copy)`,
        })
      }
      props.onComplete()
    },
  }
}
