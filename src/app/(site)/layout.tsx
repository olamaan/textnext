// src/app/layout.tsx

 
import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Oswald, Roboto } from 'next/font/google'

// Load fonts locally via next/font to avoid CORS
const oswald = Oswald({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})
const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'SDGs In Practice Library',
  description: '',
  icons: {
    // this remote favicon is fine to keep
    icon: 'https://sdgs.un.org/themes/custom/porto/favicon.ico',
  },
}




export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <head>
        {/* Viewport / compatibility */}
        <meta name="MobileOptimized" content="width" />
        <meta name="HandheldFriendly" content="true" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />

  

        {/* External CSS from sdgs.un.org */}
        <link
          href="https://sdgs.un.org/themes/custom/porto/css/bundle.css?qpptv2"
          rel="stylesheet"
        />
        <link
          href="https://sdgs.un.org/themes/custom/porto/css/style.css?qpptv2"
          rel="stylesheet"
        />
        <link
          href="https://sdgs.un.org/themes/custom/porto/color/preview.css?qpptv2"
          rel="stylesheet"
        />

        {/* Your local CSS (served from /public/styles/library.css) */}
        <link href="/styles/library.css" rel="stylesheet" />
      </head>

      <body className="layout-no-sidebars page-taxonomy-term-1188 page-vocabulary-topics page-view-taxonomy-term dir-ltr lang-en path-taxonomy">
        {/* ✅ All visible content belongs inside <body> */}
        <Header />

        {/* Header Logo + Intro section (optional; could live inside <Header />) */}
        <div className="container">
          <a href="https://sdgs.un.org/">
            <img
              src="/images/desa_logo.svg"
              className="library_desa_logo"
              alt="UN DESA"
            />
          </a>

          <div className="library_accelerator_intro">
            <a href="https://sdgs.un.org"  ><button className="theme-chip " style={{padding:'20px'}} title="SDGs.un.org">Return to UN DESA / SDGs.un.org</button></a>
            
           
          </div>
        </div>

        <div id="platform_clear"></div>

        {/* Page Content */}
        <main className="container" >{children}</main>

        {/* Shared Footer */}
        <Footer />
      </body>
    </html>
  )
}
