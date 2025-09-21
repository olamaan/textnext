// src/app/(site)/page.tsx
import HomeHero from '@/components/HomeHero'


 

function getVideoType(input?: string): 'youtube' | 'unwebtv' | 'kaltura' | null {
  if (!input) return null
  try {
    const url = new URL(input)
    if (url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be')) return 'youtube'
    if (url.hostname.includes('un.org')) return 'unwebtv'
    if (url.hostname.includes('kaltura.com')) return 'kaltura'
    return null
  } catch {
    return null
  }
}

type SP = { sdgs?: string; themes?: string; series?: string }


export default function Page({
  searchParams,
}: {
  searchParams: { sdgs?: string; themes?: string; series?: string; q?: string }
}) {
  return (
    <HomeHero
      sdgsParam={searchParams.sdgs}
      themesParam={searchParams.themes}
      seriesParam={searchParams.series}
      qParam={searchParams.q}       // ⬅️ pass it in
    />
  )
}
