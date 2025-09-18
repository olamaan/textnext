// src/components/ThemeExplore.tsx
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'
import imageUrlBuilder from '@sanity/image-url'
import { client } from '@/sanity/lib/client'
import Link from 'next/link'

type Theme = {
  _id: string
  title?: string
  link?: string
  image?: SanityImageSource
  text?: string
}

const builder = imageUrlBuilder(client)
const img = (src?: SanityImageSource) =>
  src ? builder.image(src).width(640).height(360).fit('crop').auto('format').url() : undefined

export default function ThemeExplore({ themes }: { themes: Theme[] }) {
  if (!themes?.length) return null

  return (
    <section className="info-section" aria-labelledby="explore-themes-heading">
      <h2 id="explore-themes-heading" className="library_h2">Explore More</h2>

      <div className="info-grid">
        {themes.map((t) => {
          const cardContent = (
            <article className="info-card">
              {t.image && (
                <img
                  className="info-image"
                  src={img(t.image)}
                  alt={t.title ?? 'Theme image'}
                />
              )}
              <div className="info-content">
                <header className="info-header">
                  <h3 className="info-title">{t.title}</h3>
                </header>
                {t.text && <div className="info-body">{t.text}</div>}
                <div className="info-link">Learn more →</div>
              </div>
            </article>
          )

          return t.link?.startsWith('/') ? (
            <Link key={t._id} href={t.link} className="info-card-link">
              {cardContent}
            </Link>
          ) : (
            <a
              key={t._id}
              href={t.link}
              target="_blank"
              rel="noopener noreferrer"
              className="info-card-link"
            >
              {cardContent}
            </a>
          )
        })}
      </div>
    </section>
  )
}
