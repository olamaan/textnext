// src/components/SdgLearnMore.tsx
import 'server-only'

type Props = { sdgNumbers: number[] }

const goalUrl = (n: number) => `https://sdgs.un.org/goals/goal${n}`

// Simple static descriptions (could expand later or load from JSON)
const sdgDescriptions: Record<number, string> = {
  1: 'End poverty in all its forms everywhere.',
  2: 'End hunger, achieve food security and improved nutrition, and promote sustainable agriculture.',
  3: 'Ensure healthy lives and promote well-being for all at all ages.',
  4: 'Ensure inclusive and equitable quality education and promote lifelong learning opportunities for all.',
  5: 'Achieve gender equality and empower all women and girls.',
  // … add more as needed …
}

export default async function SdgLearnMore({ sdgNumbers }: Props) {
  if (!sdgNumbers?.length) return null

  const list = Array.from(new Set(sdgNumbers))
    .sort((a, b) => a - b)
    .slice(0, 3)

  return (
    <section className="info-section" aria-labelledby="learnmore-heading">
      <h2 id="learnmore-heading" className="library_h2">
        Learn more about the SDGs
      </h2>

      <div className="info-grid">
        {list.map((n) => {
          const url = goalUrl(n)
          const imgSrc = `/sdgprogress/SDG-Report-2025-Goal-${n}.png`

          return (
            <a
              key={n}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="info-card-link"
            >
              <article className="info-card">
                {/* Top image */}
                <img
                  className="info-image"
                  src={imgSrc}
                  alt={`SDG ${n} progress snapshot`}
                />

                {/* Content wrapper */}
                <div className="info-content">
                  <header className="info-header">
                    <span className={`sdg-dot sdg-${n}`} aria-hidden />
                    <h3 className="info-title">SDG {n}</h3>
                  </header>

                  {/* Short description */}
                  {sdgDescriptions[n] && (
                    <div className="info-body">{sdgDescriptions[n]}</div>
                  )}

                  <div className="info-link">Read more →</div>
                </div>
              </article>
            </a>
          )
        })}
      </div>
    </section>
  )
}
