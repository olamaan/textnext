'use client'
import { useRouter, useSearchParams } from 'next/navigation'

type Props = { allowedSdgs?: number[] }

const sdgData: Record<number, { title: string }> = {
  1: { title: 'No Poverty' }, 2: { title: 'Zero Hunger' }, 3: { title: 'Good Health and Well-being' },
  4: { title: 'Quality Education' }, 5: { title: 'Gender Equality' }, 6: { title: 'Clean Water and Sanitation' },
  7: { title: 'Affordable and Clean Energy' }, 8: { title: 'Decent Work and Economic Growth' },
  9: { title: 'Industry, Innovation, and Infrastructure' }, 10: { title: 'Reduced Inequalities' },
  11: { title: 'Sustainable Cities and Communities' }, 12: { title: 'Responsible Consumption and Production' },
  13: { title: 'Climate Action' }, 14: { title: 'Life Below Water' }, 15: { title: 'Life on Land' },
  16: { title: 'Peace, Justice and Strong Institutions' }, 17: { title: 'Partnerships for the Goals' },
}

export default function SdgFilter({ allowedSdgs }: Props) {
  const router = useRouter()
  const sp = useSearchParams()

  const selected = new Set(
    (sp.get('sdgs')?.split(',').map(s => parseInt(s, 10)).filter(n => n >= 1 && n <= 17)) || []
  )

  const all = Array.from({ length: 17 }, (_, i) => i + 1)

  const toggle = (n: number) => {
    const isDisabled = allowedSdgs ? !allowedSdgs.includes(n) : false
    if (isDisabled) return

    const set = new Set(selected)
    set.has(n) ? set.delete(n) : set.add(n)
    const arr = [...set].sort((a, b) => a - b)

    // preserve other query params
    const params = new URLSearchParams(Array.from(sp.entries()))
    if (arr.length) params.set('sdgs', arr.join(','))
    else params.delete('sdgs')

    router.push(`/?${params.toString()}`)
  }

  return (
    <div className="sdg-filter">
      {all.map(n => {
        const { title } = sdgData[n]
        const isSelected = selected.has(n)
        const isDisabled = allowedSdgs ? !allowedSdgs.includes(n) : false
        return (
          <span
            key={n}
            onClick={() => toggle(n)}
            title={`SDG ${n}: ${title}`}
            aria-disabled={isDisabled}
            className={`sdg-circle sdg-${n} ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
          >
            {isSelected ? '✓' : n}
          </span>
        )
      })}
    </div>
  )
}
