'use client'

import { useRouter, useSearchParams } from 'next/navigation'

// Update this list once a year.
const YEARS = [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016]

export default function SeriesFilter() {
  const router = useRouter()
  const sp = useSearchParams()

  // read current ?series=2025,2023 etc. as numbers
  const selected = new Set(
    (sp.get('series')?.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !Number.isNaN(n))) || []
  )

  const toggle = (year: number) => {
    const next = new Set(selected)
    next.has(year) ? next.delete(year) : next.add(year)

    const params = new URLSearchParams(Array.from(sp.entries()))
    if (next.size) params.set('series', Array.from(next).sort((a,b)=>b-a).join(','))
    else params.delete('series')

    router.push(`/?${params.toString()}`)
  }

  return (
    <div className="theme-filter">
      {YEARS.map(y => {
        const isOn = selected.has(y)
        return (
          <button
            key={y}
            type="button"
            onClick={() => toggle(y)}
            className={`theme-chip ${isOn ? 'is-selected' : ''}`}
            aria-pressed={isOn}
            title={String(y)}
          >
            {y}
          </button>
        )
      })}
    </div>
  )
}
