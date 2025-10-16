// src/app/layout.tsx


import './globals.css'


export const metadata = {
  title: 'SDGs In Practice Library',
  description: '…',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

