'use client'

import { useRouter, useSearchParams } from 'next/navigation'

type Series = { _id: string; title?: string; year?: number }

type Props = {
  series: Series[]
  /** Optional: ids that currently have results; used only for muted styling */
  enabledIds?: string[]
}

export default function SeriesFilter({ series, enabledIds }: Props) {
  const router = useRouter()
  const sp = useSearchParams()

  // Currently selected ids from query string (?series=a,b,c)
  const selected = new Set(
    (sp.get('series')?.split(',').map(s => s.trim()).filter(Boolean)) || []
  )

  // Always list all series; sort by year desc, then title
  const sorted = [...series].sort((a, b) => {
    const by = (b.year ?? 0) - (a.year ?? 0)
    if (by !== 0) return by
    return (a.title || '').localeCompare(b.title || '')
  })

  // Toggle selection, preserving ALL other query params (sdgs, themes, q, etc.)
  const toggle = (id: string) => {
    const next = new Set(selected)
    next.has(id) ? next.delete(id) : next.add(id)

    const params = new URLSearchParams(Array.from(sp.entries()))
    if (next.size) params.set('series', Array.from(next).join(','))
    else params.delete('series')

    router.push(`/?${params.toString()}`)
  }

  return (
    // Keep original class so your existing CSS applies
    <div className="theme-filter">
      {sorted.map(s => {
        const id = s._id
        const isOn = selected.has(id)
        const isMuted = enabledIds ? !enabledIds.includes(id) : false
        const label = s.title || (s.year ? String(s.year) : 'Series')
        return (
          <button
            key={id}
            type="button"
            onClick={() => toggle(id)}
            className={`theme-chip ${isOn ? 'is-selected' : ''} ${isMuted ? 'is-muted' : ''}`}
            title={label}
            aria-pressed={isOn}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
