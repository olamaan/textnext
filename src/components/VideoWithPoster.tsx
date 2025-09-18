'use client'
import { useState } from 'react'

export default function VideoWithPoster({
  posterUrl,
  youtubeId,
  alt = 'Video poster',
}: {
  posterUrl?: string
  youtubeId: string
  alt?: string
}) {
  const [playing, setPlaying] = useState(false)

  if (!youtubeId) return null

  return (
    <div className="video-wrap">
      {playing ? (
        <iframe
          className="video-iframe"
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1`}
          title="YouTube video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          className="video-poster"
          onClick={() => setPlaying(true)}
          aria-label="Play video"
        >
          {posterUrl ? (
            <img src={posterUrl} alt={alt} />
          ) : (
            // fallback thumbnail from YouTube if you don't have a post image
            <img
              src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
              alt={alt}
            />
          )}
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
