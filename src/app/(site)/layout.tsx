// src/app/layout.tsx
import './globals.css'
import { roboto, oswald } from './fonts'
import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'SDGs In Practice Library',
  description: '',
  icons: {
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

        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,700;1,300;1,400&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Oswald:wght@200;300;400;500;600;700&display=swap"
          rel="stylesheet"
        />

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
          <a href="/">
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
        <main className="container" style={{ marginTop:40 }}>{children}</main>

        {/* Shared Footer */}
        <Footer />
      </body>
    </html>
  )
}
