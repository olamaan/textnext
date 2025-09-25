'use client'

import { useRouter, useSearchParams } from 'next/navigation'

type Theme = { _id: string; title: string }

type Props = {
  themes: Theme[]         // ALWAYS the full list
  enabledIds?: string[]   // optional: ids that currently have results (for muted style only)
}

export default function ThemeFilter({ themes, enabledIds }: Props) {
  const router = useRouter()
  const sp = useSearchParams()

  // currently selected from ?themes=a,b,c
  const selected = new Set(
    (sp.get('themes')?.split(',').map(s => s.trim()).filter(Boolean)) || []
  )

  // sort alphabetically
  const sorted = [...themes].sort((a, b) =>
    a.title.localeCompare(b.title, undefined, { sensitivity: 'base' })
  )

  const toggle = (id: string) => {
    const next = new Set(selected)
    next.has(id) ? next.delete(id) : next.add(id)

    // preserve ALL existing query params (sdgs, series, q, etc.)
    const params = new URLSearchParams(Array.from(sp.entries()))
    if (next.size) params.set('themes', Array.from(next).join(','))
    else params.delete('themes')

    router.push(`/?${params.toString()}`)
  }

  return (
    <div className="theme-filter">
      {sorted.map(t => {
        const isOn = selected.has(t._id)
        const isMuted = enabledIds ? !enabledIds.includes(t._id) : false
        return (
          <button
            key={t._id}
            type="button"
            onClick={() => toggle(t._id)}
            className={`theme-chip-large ${isOn ? 'is-selected' : ''} ${isMuted ? 'is-muted' : ''}`}
            title={t.title}
            aria-pressed={isOn}
          >
            {t.title}
          </button>
        )
      })}
    </div>
  )
}
