// src/components/ThemeFilter.tsx
'use client'
import { useRouter, useSearchParams } from 'next/navigation'

type Theme = { _id: string; title: string }

export default function ThemeFilter({ themes }: { themes: Theme[] }) {
  const router = useRouter()
  const sp = useSearchParams()

  const selected = new Set(
    (sp.get('themes')?.split(',').map(s => s.trim()).filter(Boolean)) || []
  )

  const sdgsQS = sp.get('sdgs') // preserve SDG filters when toggling themes

  const toggle = (id: string) => {
    const set = new Set(selected)
    set.has(id) ? set.delete(id) : set.add(id)
    const arr = [...set]

    const params = new URLSearchParams()
    if (sdgsQS) params.set('sdgs', sdgsQS)
    if (arr.length) params.set('themes', arr.join(','))

    const q = params.toString()
    router.push('/' + (q ? `?${q}` : ''))
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
      {themes.map(t => {
        const isOn = selected.has(t._id)
        return (
          <button
            key={t._id}
            onClick={() => toggle(t._id)}
            title={t.title}
            style={{
              cursor: 'pointer',
              border: `1px solid ${isOn ? '#00adef' : '#ddd'}`,
              background: isOn ? '#00adef' : '#fff',
              color: isOn ? '#fff' : '#333',
              borderRadius: 16,
              padding: '6px 10px',
              fontSize: 13,
              lineHeight: 1,
            }}
          >
            {t.title}
          </button>
        )
      })}
    </div>
  )
}
