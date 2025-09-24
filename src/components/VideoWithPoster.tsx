'use client'
import { useMemo, useState } from 'react'

type Props = {
  posterUrl?: string
  alt?: string
  /** default: 'youtube' */
  provider?: 'youtube' | 'kaltura'
  /** required when provider === 'youtube' */
  youtubeId?: string
  /** required when provider === 'kaltura' (full iframe URL) */
  embedSrc?: string
  className?: string
}

function withAutoplay(url: string) {
  try {
    const u = new URL(url)
    // Kaltura usually respects autoplay=1
    u.searchParams.set('autoplay', '1')
    return u.toString()
  } catch {
    // fallback if it's not a standard URL
    return url.includes('?') ? `${url}&autoplay=1` : `${url}?autoplay=1`
  }
}

export default function VideoWithPoster({
  posterUrl,
  alt = 'Video',
  provider = 'youtube',
  youtubeId,
  embedSrc,
  className,
}: Props) {
  const [playing, setPlaying] = useState(false)

  const src = useMemo(() => {
    if (provider === 'youtube') {
      if (!youtubeId) return null
      // modestbranding etc. + autoplay
      return `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`
    }
    if (provider === 'kaltura') {
      if (!embedSrc) return null
      return withAutoplay(embedSrc)
    }
    return null
  }, [provider, youtubeId, embedSrc])

  const start = () => setPlaying(true)

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '16 / 9',
        background: '#000',
        overflow: 'hidden',
        borderRadius: 6,
      }}
    >
      {playing && src ? (
        <iframe
          src={src}
          title={alt}
          allow="autoplay; fullscreen; encrypted-media"
          allowFullScreen
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
        />
      ) : (
        <button
          type="button"
          onClick={start}
          aria-label="Play video"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            padding: 0,
            border: 0,
            cursor: 'pointer',
            background: 'transparent',
          }}
        >
          {posterUrl ? (
            // poster image
            <img
              src={posterUrl}
              alt={alt}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : null}

          {/* simple play glyph overlay */}
          <span className="video-playbtn" aria-hidden>
            {/* Play icon */}
            <svg viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="30" />
              <polygon points="26,20 48,32 26,44" />
            </svg>
          </span>
        </button>
      )}
    </div>
  )
}
