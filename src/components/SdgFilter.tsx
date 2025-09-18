'use client'
import { useRouter, useSearchParams } from 'next/navigation'

const sdgData: Record<number, { title: string }> = {
  1: { title: 'No Poverty' },
  2: { title: 'Zero Hunger' },
  3: { title: 'Good Health and Well-being' },
  4: { title: 'Quality Education' },
  5: { title: 'Gender Equality' },
  6: { title: 'Clean Water and Sanitation' },
  7: { title: 'Affordable and Clean Energy' },
  8: { title: 'Decent Work and Economic Growth' },
  9: { title: 'Industry, Innovation, and Infrastructure' },
  10: { title: 'Reduced Inequalities' },
  11: { title: 'Sustainable Cities and Communities' },
  12: { title: 'Responsible Consumption and Production' },
  13: { title: 'Climate Action' },
  14: { title: 'Life Below Water' },
  15: { title: 'Life on Land' },
  16: { title: 'Peace, Justice and Strong Institutions' },
  17: { title: 'Partnerships for the Goals' },
}

export default function SdgFilter() {
  const router = useRouter()
  const sp = useSearchParams()
  const selected = new Set(
    (sp.get('sdgs')?.split(',').map(s => parseInt(s, 10)).filter(n => n >= 1 && n <= 17)) || []
  )

  const toggle = (n: number) => {
    const set = new Set(selected)
    set.has(n) ? set.delete(n) : set.add(n)
    const arr = [...set].sort((a, b) => a - b)
    const q = arr.length ? `?sdgs=${arr.join(',')}` : ''
    router.push('/' + q)
  }

  return (
    <div className="sdg-filter">
      {Array.from({ length: 17 }, (_, i) => i + 1).map(n => {
        const { title } = sdgData[n]
        const isSelected = selected.has(n)
        return (
          <span
            key={n}
            onClick={() => toggle(n)}
            title={`SDG ${n}: ${title}`}
            className={`sdg-circle sdg-${n} ${isSelected ? 'selected' : ''}`}
          >
            {isSelected ? '✓' : n}
          </span>
        )
      })}
    </div>
  )
}
