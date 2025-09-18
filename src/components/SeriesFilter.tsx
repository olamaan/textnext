// src/components/SeriesFilter.tsx
'use client'

import { useRouter, useSearchParams } from 'next/navigation'

type Series = { _id: string; title: string; year?: number }

export default function SeriesFilter({ series }: { series: Series[] }) {
  const router = useRouter()
  const sp = useSearchParams()

  // preserve other filters
  const sdgsQS   = sp.get('sdgs')   ?? ''
  const themesQS = sp.get('themes') ?? ''
  const selected = new Set(
    (sp.get('series')?.split(',').map(s => s.trim()).filter(Boolean)) || []
  )

  const toggle = (id: string) => {
    const set = new Set(selected)
    set.has(id) ? set.delete(id) : set.add(id)
    const arr = [...set]

    const params = new URLSearchParams()
    if (arr.length) params.set('series', arr.join(','))
    if (sdgsQS)   params.set('sdgs', sdgsQS)
    if (themesQS) params.set('themes', themesQS)

    const q = params.toString()
    router.push('/' + (q ? `?${q}` : ''))
  }

  return (
    <div className="theme-filter">
      {series.map(s => {
        const isOn = selected.has(s._id)
        // Label should be TITLE ONLY (per your request)
        const label = s.title || 'Series'
        return (
          <button
            key={s._id}
            onClick={() => toggle(s._id)}
            className={`theme-chip ${isOn ? 'is-selected' : ''}`}
            title={label}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
